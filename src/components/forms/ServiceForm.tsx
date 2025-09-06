import { useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Scissors, Clock, DollarSign } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/useToast'
import { serviceAPI } from '@/lib/api'

interface ServiceFormProps {
  open: boolean
  onClose: () => void
  service?: any
  onSuccess?: () => void
}

interface ServiceFormData {
  name: string
  description?: string
  price: number
  duration: number
  isActive: boolean
}

export default function ServiceForm({ open, onClose, service, onSuccess }: ServiceFormProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ServiceFormData>({
    defaultValues: {
      isActive: true
    }
  })

  const isActive = watch('isActive')

  // Create service mutation
  const createMutation = useMutation({
    mutationFn: serviceAPI.createService,
    onSuccess: () => {
      toast({
        title: "Thành công!",
        description: "Dịch vụ đã được tạo",
      })
      queryClient.invalidateQueries({ queryKey: ['services'] })
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

  // Update service mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => 
      serviceAPI.updateService(id, data),
    onSuccess: () => {
      toast({
        title: "Thành công!",
        description: "Dịch vụ đã được cập nhật",
      })
      queryClient.invalidateQueries({ queryKey: ['services'] })
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

  const onSubmit = (data: ServiceFormData) => {
    const serviceData = {
      name: data.name,
      description: data.description,
      price: data.price,
      duration: data.duration,
      isActive: data.isActive,
    }

    if (service) {
      updateMutation.mutate({ id: service._id, data: serviceData })
    } else {
      createMutation.mutate(serviceData)
    }
  }

  // Reset form when service changes
  useEffect(() => {
    if (service) {
      setValue('name', service.name)
      setValue('description', service.description || '')
      setValue('price', service.price)
      setValue('duration', service.duration)
      setValue('isActive', service.isActive)
    } else {
      reset({ isActive: true })
    }
  }, [service, setValue, reset])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Scissors className="w-5 h-5 mr-2 text-pink-500" />
            {service ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
          </DialogTitle>
          <DialogDescription>
            {service ? 'Cập nhật thông tin dịch vụ' : 'Điền thông tin để tạo dịch vụ mới'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Tên dịch vụ *</Label>
            <div className="relative">
              <Scissors className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                {...register('name', { required: 'Vui lòng nhập tên dịch vụ' })}
                placeholder="Cắt tóc nam"
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
              placeholder="Mô tả chi tiết về dịch vụ..."
              rows={3}
            />
          </div>

          {/* Price and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Giá dịch vụ (VNĐ) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  {...register('price', { 
                    required: 'Vui lòng nhập giá dịch vụ',
                    min: { value: 0, message: 'Giá không được âm' },
                    valueAsNumber: true
                  })}
                  placeholder="150000"
                  className="pl-10"
                />
              </div>
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Thời gian (phút) *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="number"
                  min="1"
                  {...register('duration', { 
                    required: 'Vui lòng nhập thời gian',
                    min: { value: 1, message: 'Thời gian tối thiểu 1 phút' },
                    valueAsNumber: true
                  })}
                  placeholder="30"
                  className="pl-10"
                />
              </div>
              {errors.duration && (
                <p className="text-sm text-red-500">{errors.duration.message}</p>
              )}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label>Trạng thái hoạt động</Label>
              <p className="text-sm text-gray-600">
                {isActive ? 'Dịch vụ đang hoạt động' : 'Dịch vụ tạm dừng'}
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Đang xử lý...' : 
               service ? 'Cập nhật' : 'Tạo dịch vụ'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

