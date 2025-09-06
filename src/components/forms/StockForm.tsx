import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Package, Plus, TrendingUp, TrendingDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/useToast'
import { productAPI } from '@/lib/api'

interface StockFormProps {
  open: boolean
  onClose: () => void
  type: 'add' | 'adjust'
  product?: any
  onSuccess?: () => void
}

interface StockFormData {
  productId: string
  quantity: number
  reason: string
  notes?: string
}

export default function StockForm({ open, onClose, type, product, onSuccess }: StockFormProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  // Debug log
  console.log('=== STOCK FORM RENDERED ===')
  console.log('Form type:', type)
  console.log('Is adjust?', type === 'adjust')
  console.log('Is add?', type === 'add')
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<StockFormData>()

  const selectedProductId = watch('productId')
  const quantity = watch('quantity')

  // Fetch products
  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: () => productAPI.getProducts({ isActive: true }).then(res => res.data),
  })

  const products = productsData?.products || []
  const selectedProduct = products.find((p: any) => p._id === selectedProductId)

  // Add stock mutation
  const addStockMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => 
      productAPI.addStock(id, data),
    onSuccess: () => {
      toast({
        title: "Thành công!",
        description: "Đã nhập kho thành công",
      })
      queryClient.invalidateQueries({ queryKey: ['products'] })
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

  // Adjust stock mutation
  const adjustStockMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => 
      productAPI.adjustStock(id, data),
    onSuccess: () => {
      toast({
        title: "Thành công!",
        description: "Đã điều chỉnh kho thành công",
      })
      queryClient.invalidateQueries({ queryKey: ['products'] })
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

  const onSubmit = (data: StockFormData) => {
    console.log('Form type:', type, 'Data:', data)
    const stockData = {
      quantity: data.quantity,
      reason: data.reason,
      notes: data.notes,
    }

    if (type === 'add') {
      addStockMutation.mutate({ id: data.productId, data: stockData })
    } else {
      adjustStockMutation.mutate({ id: data.productId, data: stockData })
    }
  }

  // Set product if passed as prop
  useEffect(() => {
    if (product) {
      setValue('productId', product._id)
    }
  }, [product, setValue])

  const isLoading = addStockMutation.isPending || adjustStockMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {type === 'add' ? (
              <>
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                Nhập kho
              </>
            ) : (
              <>
                <TrendingDown className="w-5 h-5 mr-2 text-orange-500" />
                Điều chỉnh kho
              </>
            )}
          </DialogTitle>
          {/* Debug info */}
          <div className="text-xs text-gray-500 bg-yellow-100 p-2 rounded">
            Debug: Form type = {type} | Validation: {type === 'add' ? 'Số > 0' : 'Số ≠ 0 (cho phép âm)'}
          </div>
          <DialogDescription>
            {type === 'add' 
              ? 'Nhập thêm sản phẩm vào kho' 
              : 'Điều chỉnh số lượng tồn kho (có thể tăng hoặc giảm)'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Product Selection */}
          {!product && (
            <div className="space-y-2">
              <Label htmlFor="productId">Sản phẩm *</Label>
              <Select onValueChange={(value) => setValue('productId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn sản phẩm..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product: any) => (
                    <SelectItem key={product._id} value={product._id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{product.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {product.currentStock} {product.unit}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.productId && (
                <p className="text-sm text-red-500">Vui lòng chọn sản phẩm</p>
              )}
            </div>
          )}

          {/* Current Stock Info */}
          {selectedProduct && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{selectedProduct.name}</h3>
                    <p className="text-sm text-gray-600">
                      Tồn kho hiện tại: <span className="font-medium">{selectedProduct.currentStock} {selectedProduct.unit}</span>
                    </p>
                    {selectedProduct.currentStock <= selectedProduct.minStockAlert && (
                      <Badge variant="destructive" className="mt-1">
                        Sắp hết hàng
                      </Badge>
                    )}
                  </div>
                  <Package className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">
              {type === 'add' ? 'Số lượng nhập' : 'Số lượng điều chỉnh'} *
            </Label>
            <div className="relative">
              {type === 'add' ? (
                <Plus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-4 h-4" />
              ) : (
                <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-4 h-4" />
              )}
              <Input
                type="number"
                {...register('quantity', { 
                  required: 'Vui lòng nhập số lượng',
                  valueAsNumber: true,
                  validate: (value) => {
                    console.log('=== VALIDATION DEBUG ===')
                    console.log('Value:', value, 'Type:', typeof value)
                    console.log('Form type:', type)
                    console.log('Is adjust?', type === 'adjust')
                    console.log('Is add?', type === 'add')
                    
                    if (type === 'add') {
                      console.log('Add validation: checking if value <= 0')
                      if (value <= 0) {
                        console.log('Add validation failed: value <= 0')
                        return 'Số lượng nhập phải lớn hơn 0'
                      }
                    } else if (type === 'adjust') {
                      console.log('Adjust validation: checking if value === 0')
                      if (value === 0) {
                        console.log('Adjust validation failed: value === 0')
                        return 'Số lượng điều chỉnh không được bằng 0'
                      }
                      if (isNaN(value)) {
                        console.log('Adjust validation failed: isNaN')
                        return 'Vui lòng nhập số hợp lệ'
                      }
                      console.log('Adjust validation passed: allowing negative numbers')
                      return true
                    }
                    console.log('Validation passed')
                    return true
                  }
                })}
                placeholder={type === 'add' ? "10" : "+10 hoặc -5"}
                className="pl-10"
              />
            </div>
            {type === 'adjust' && (
              <p className="text-sm text-gray-600">
                Nhập số dương để tăng, số âm để giảm. VD: +10, -5
              </p>
            )}
            {errors.quantity && (
              <p className="text-sm text-red-500">{errors.quantity.message}</p>
            )}
          </div>

          {/* Preview */}
          {selectedProduct && quantity && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Tồn kho sau khi {type === 'add' ? 'nhập' : 'điều chỉnh'}:</span>
                  <span className="font-medium text-blue-800">
                    {type === 'add' 
                      ? selectedProduct.currentStock + quantity
                      : Math.max(0, selectedProduct.currentStock + quantity)
                    } {selectedProduct.unit}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Lý do *</Label>
            <Input
              {...register('reason', { required: 'Vui lòng nhập lý do' })}
              placeholder={
                type === 'add' 
                  ? "Nhập hàng từ nhà cung cấp" 
                  : "Kiểm kê, hỏng hóc, mất mát..."
              }
            />
            {errors.reason && (
              <p className="text-sm text-red-500">{errors.reason.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              {...register('notes')}
              placeholder="Ghi chú thêm..."
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !selectedProductId}
              className={
                type === 'add' 
                  ? "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  : "bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
              }
            >
              {isLoading ? 'Đang xử lý...' : 
               type === 'add' ? 'Nhập kho' : 'Điều chỉnh'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
