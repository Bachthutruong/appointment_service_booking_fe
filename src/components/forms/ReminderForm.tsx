import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { Bell, User, Calendar, MessageSquare } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/useToast'
import { customerAPI, reminderAPI } from '@/lib/api'

interface ReminderFormProps {
  open: boolean
  onClose: () => void
  customer?: any
  order?: any
  onSuccess?: () => void
}

interface ReminderFormData {
  customer: string
  reminderDate: string
  content: string
}

export default function ReminderForm({ open, onClose, customer, order, onSuccess }: ReminderFormProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<ReminderFormData>()

  // Debug log
  console.log('ReminderForm control:', control)

  // Fetch customers if not provided
  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerAPI.getCustomers({ limit: 100 }).then(res => res.data),
    enabled: !customer
  })

  const customers = customersData?.customers || []

  // Create reminder mutation
  const createMutation = useMutation({
    mutationFn: order 
      ? (data: any) => reminderAPI.createReminderFromOrder(order._id, data)
      : reminderAPI.createReminder,
    onSuccess: () => {
      toast({
        title: "Thành công!",
        description: "Nhắc nhở đã được tạo",
      })
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
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

  const onSubmit = (data: ReminderFormData) => {
    const reminderData = {
      customer: data.customer,
      reminderDate: new Date(data.reminderDate).toISOString(),
      content: data.content,
    }

    createMutation.mutate(reminderData)
  }

  // Set customer and default values when props change
  useEffect(() => {
    if (customer) {
      setValue('customer', customer._id)
    }
    
    // Set default reminder date to 7 days from now
    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + 7)
    setValue('reminderDate', defaultDate.toISOString().slice(0, 16))

    // Set default content based on context
    if (order) {
      setValue('content', `Chăm sóc sau dịch vụ - Đơn hàng #${order._id.slice(-8).toUpperCase()}`)
    } else if (customer) {
      setValue('content', `Liên hệ chăm sóc khách hàng ${customer.name}`)
    }
  }, [customer, order, setValue])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2 text-yellow-500" />
            Tạo nhắc nhở chăm sóc
          </DialogTitle>
          <DialogDescription>
            {order 
              ? 'Tạo nhắc nhở chăm sóc khách hàng sau khi hoàn thành đơn hàng'
              : 'Tạo nhắc nhở chăm sóc khách hàng'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label htmlFor="customer">Khách hàng *</Label>
            {customer ? (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-gray-600">{customer.phone}</p>
                </div>
              </div>
            ) : (
              control && (
                <Controller
                  name="customer"
                  control={control}
                  rules={{ required: 'Vui lòng chọn khách hàng' }}
                  render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn khách hàng..." />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer: any) => (
                        <SelectItem key={customer._id} value={customer._id}>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>{customer.name} - {customer.phone}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  )}
                />
              )
            )}
            {errors.customer && (
              <p className="text-sm text-red-500">Vui lòng chọn khách hàng</p>
            )}
          </div>

          {/* Order Info */}
          {order && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Thông tin đơn hàng</h4>
              <div className="space-y-1 text-sm text-blue-700">
                <p>Mã đơn: #{order._id.slice(-8).toUpperCase()}</p>
                <p>Tổng tiền: {order.totalAmount?.toLocaleString()}đ</p>
                <p>Ngày tạo: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>
          )}

          {/* Reminder Date */}
          <div className="space-y-2">
            <Label htmlFor="reminderDate">Ngày nhắc nhở *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="datetime-local"
                {...register('reminderDate', { required: 'Vui lòng chọn ngày nhắc nhở' })}
                className="pl-10"
              />
            </div>
            {errors.reminderDate && (
              <p className="text-sm text-red-500">{errors.reminderDate.message}</p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Nội dung nhắc nhở *</Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <Textarea
                {...register('content', { required: 'Vui lòng nhập nội dung nhắc nhở' })}
                placeholder="Nội dung nhắc nhở chăm sóc khách hàng..."
                rows={4}
                className="pl-10"
              />
            </div>
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
          </div>

          {/* Quick Templates */}
          <div className="space-y-2">
            <Label>Mẫu nhanh</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setValue('content', 'Chăm sóc sau dịch vụ - Hỏi thăm cảm nhận và hiệu quả')}
              >
                Chăm sóc sau dịch vụ
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setValue('content', 'Nhắc lịch hẹn tiếp theo - Tư vấn dịch vụ phù hợp')}
              >
                Tư vấn lịch hẹn
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setValue('content', 'Chúc mừng sinh nhật - Ưu đãi đặc biệt')}
              >
                Chúc sinh nhật
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setValue('content', 'Khuyến mãi đặc biệt - Giảm giá cho khách hàng thân thiết')}
              >
                Khuyến mãi
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              {createMutation.isPending ? 'Đang tạo...' : 'Tạo nhắc nhở'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
