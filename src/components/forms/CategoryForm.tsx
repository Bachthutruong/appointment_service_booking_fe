import { useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Tag, MessageSquare } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/useToast'
import { categoryAPI } from '@/lib/api'

interface CategoryFormProps {
  open: boolean
  onClose: () => void
  category?: any
  onSuccess?: (category?: any) => void
}

interface CategoryFormData {
  name: string
  description?: string
  isActive: boolean
}

function CategoryForm({ open, onClose, category, onSuccess }: CategoryFormProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>()

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: categoryAPI.createCategory,
    onSuccess: (response) => {
      toast({
        title: "Thành công!",
        description: "Danh mục đã được tạo",
      })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      reset()
      onClose()
      onSuccess?.(response.data.category)
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || "Có lỗi xảy ra",
      })
    },
  })

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => 
      categoryAPI.updateCategory(id, data),
    onSuccess: () => {
      toast({
        title: "Thành công!",
        description: "Danh mục đã được cập nhật",
      })
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

  const onSubmit = (data: CategoryFormData) => {
    const categoryData = {
      name: data.name,
      description: data.description,
      isActive: data.isActive,
    }

    if (category) {
      updateMutation.mutate({ id: category._id, data: categoryData })
    } else {
      createMutation.mutate(categoryData)
    }
  }

  // Reset form when category changes
  useEffect(() => {
    if (category) {
      setValue('name', category.name)
      setValue('description', category.description || '')
      setValue('isActive', category.isActive !== undefined ? category.isActive : true)
    } else {
      reset()
    }
  }, [category, setValue, reset])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Tag className="w-5 h-5 mr-2 text-purple-500" />
            {category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          </DialogTitle>
          <DialogDescription>
            {category ? 'Cập nhật thông tin danh mục' : 'Điền thông tin để tạo danh mục mới'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Tên danh mục *</Label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                {...register('name', { required: 'Vui lòng nhập tên danh mục' })}
                placeholder="Ví dụ: Mỹ phẩm, Dụng cụ làm đẹp"
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
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <Textarea
                {...register('description')}
                placeholder="Mô tả chi tiết về danh mục..."
                rows={3}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="isActive">Trạng thái</Label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                {...register('isActive')}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <Label htmlFor="isActive" className="text-sm text-gray-700">
                Danh mục hoạt động
              </Label>
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
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Đang xử lý...' : 
               category ? 'Cập nhật' : 'Tạo danh mục'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { CategoryForm }
export default CategoryForm
