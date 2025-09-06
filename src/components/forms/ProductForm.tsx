import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Package, DollarSign, AlertTriangle, Tag } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/useToast'
import { productAPI, categoryAPI } from '@/lib/api'

interface ProductFormProps {
  open: boolean
  onClose: () => void
  product?: any
  onSuccess?: () => void
}

interface ProductFormData {
  name: string
  description?: string
  sellingPrice: number
  costPrice: number
  unit: string
  minStockAlert: number
  category?: string
  isActive: boolean
  isDiscontinued: boolean
}

export default function ProductForm({ open, onClose, product, onSuccess }: ProductFormProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      isActive: true,
      isDiscontinued: false,
      minStockAlert: 10,
      category: 'none'
    }
  })

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryAPI.getCategories
  })

  const categories = categoriesData?.data?.categories || []

  const isActive = watch('isActive')
  const isDiscontinued = watch('isDiscontinued')

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: productAPI.createProduct,
    onSuccess: () => {
      toast({
        title: "Thành công!",
        description: "Sản phẩm đã được tạo",
      })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      reset()
      onClose()
      onSuccess?.()
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || "Có lỗi xảy ra",
      })
    },
  })

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => 
      productAPI.updateProduct(id, data),
    onSuccess: () => {
      toast({
        title: "Thành công!",
        description: "Sản phẩm đã được cập nhật",
      })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      onClose()
      onSuccess?.()
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || "Có lỗi xảy ra",
      })
    },
  })

  const onSubmit = (data: ProductFormData) => {
    const productData = {
      name: data.name,
      description: data.description,
      sellingPrice: data.sellingPrice,
      costPrice: data.costPrice,
      unit: data.unit,
      minStockAlert: data.minStockAlert,
      category: data.category === 'none' ? undefined : data.category || undefined,
      isActive: data.isActive,
      isDiscontinued: data.isDiscontinued,
    }

    if (product) {
      updateMutation.mutate({ id: product._id, data: productData })
    } else {
      createMutation.mutate(productData)
    }
  }

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      setValue('name', product.name)
      setValue('description', product.description || '')
      setValue('sellingPrice', product.sellingPrice)
      setValue('costPrice', product.costPrice)
      setValue('unit', product.unit)
      setValue('minStockAlert', product.minStockAlert)
      setValue('category', product.category?._id || 'none')
      setValue('isActive', product.isActive)
      setValue('isDiscontinued', product.isDiscontinued)
    } else {
      reset({ isActive: true, isDiscontinued: false, minStockAlert: 10, category: 'none' })
    }
  }, [product, setValue, reset])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2 text-blue-500" />
            {product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </DialogTitle>
          <DialogDescription>
            {product ? 'Cập nhật thông tin sản phẩm' : 'Điền thông tin để tạo sản phẩm mới'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Tên sản phẩm *</Label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                {...register('name', { required: 'Vui lòng nhập tên sản phẩm' })}
                placeholder="Dầu gội đầu cao cấp"
                className="pl-10"
              />
            </div>
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              {...register('description')}
              placeholder="Mô tả chi tiết về sản phẩm..."
              rows={3}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Danh mục</Label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Select
                value={watch('category') || 'none'}
                onValueChange={(value) => setValue('category', value)}
              >
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Chọn danh mục sản phẩm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không có danh mục</SelectItem>
                  {categories.map((category: any) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Giá bán (VNĐ) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-4 h-4" />
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  {...register('sellingPrice', { 
                    required: 'Vui lòng nhập giá bán',
                    min: { value: 0, message: 'Giá không được âm' },
                    valueAsNumber: true
                  })}
                  placeholder="250000"
                  className="pl-10"
                />
              </div>
              {errors.sellingPrice && (
                <p className="text-sm text-red-500">{errors.sellingPrice.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="costPrice">Giá vốn (VNĐ) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-4 h-4" />
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  {...register('costPrice', { 
                    required: 'Vui lòng nhập giá vốn',
                    min: { value: 0, message: 'Giá không được âm' },
                    valueAsNumber: true
                  })}
                  placeholder="150000"
                  className="pl-10"
                />
              </div>
              {errors.costPrice && (
                <p className="text-sm text-red-500">{errors.costPrice.message}</p>
              )}
            </div>
          </div>

          {/* Unit and Stock Alert */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Đơn vị *</Label>
              <Input
                {...register('unit', { required: 'Vui lòng nhập đơn vị' })}
                placeholder="chai, hộp, miếng..."
              />
              {errors.unit && (
                <p className="text-sm text-red-500">{errors.unit.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStockAlert">Cảnh báo khi tồn kho dưới *</Label>
              <div className="relative">
                <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400 w-4 h-4" />
                <Input
                  type="number"
                  min="0"
                  {...register('minStockAlert', { 
                    required: 'Vui lòng nhập mức cảnh báo',
                    min: { value: 0, message: 'Số lượng không được âm' },
                    valueAsNumber: true
                  })}
                  placeholder="10"
                  className="pl-10"
                />
              </div>
              {errors.minStockAlert && (
                <p className="text-sm text-red-500">{errors.minStockAlert.message}</p>
              )}
            </div>
          </div>

          {/* Status Settings */}
          <div className="space-y-4">
            {/* Active Status */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label>Trạng thái hoạt động</Label>
                <p className="text-sm text-gray-600">
                  {isActive ? 'Sản phẩm đang hoạt động' : 'Sản phẩm tạm dừng'}
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={(checked) => setValue('isActive', checked)}
              />
            </div>

            {/* Discontinued Status */}
            <div className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50">
              <div className="space-y-1">
                <Label className="text-red-700">Ngưng bán</Label>
                <p className="text-sm text-red-600">
                  {isDiscontinued ? 'Sản phẩm đã ngưng bán' : 'Sản phẩm vẫn đang bán'}
                </p>
              </div>
              <Switch
                checked={isDiscontinued}
                onCheckedChange={(checked) => setValue('isDiscontinued', checked)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Đang xử lý...' : 
               product ? 'Cập nhật' : 'Tạo sản phẩm'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

