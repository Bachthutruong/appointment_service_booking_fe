import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { User, Phone, Calendar, MessageSquare, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/useToast'
import { customerAPI } from '@/lib/api'

interface CustomerFormProps {
  open: boolean
  onClose: () => void
  customer?: any
  onSuccess?: (customer?: any) => void
}

interface CustomerFormData {
  name: string
  phone: string
  email?: string
  lineId?: string
  gender: 'male' | 'female' | 'other'
  dateOfBirth?: string
  notes?: string
}

export default function CustomerForm({ open, onClose, customer, onSuccess }: CustomerFormProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | 'other'>('male')
  
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>()

  // Create customer mutation
  const createMutation = useMutation({
    mutationFn: customerAPI.createCustomer,
    onSuccess: (response) => {
      toast({
        title: "Thành công!",
        description: "Khách hàng đã được tạo",
      })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      reset()
      onClose()
      onSuccess?.(response.data.customer)
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || "Có lỗi xảy ra",
      })
    },
  })

  // Update customer mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => 
      customerAPI.updateCustomer(id, data),
    onSuccess: () => {
      toast({
        title: "Thành công!",
        description: "Thông tin khách hàng đã được cập nhật",
      })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
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

  const onSubmit = (data: CustomerFormData) => {
    const customerData = {
      name: data.name,
      phone: data.phone,
      email: data.email,
      lineId: data.lineId,
      gender: selectedGender,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : undefined,
      notes: data.notes,
    }

    if (customer) {
      updateMutation.mutate({ id: customer._id, data: customerData })
    } else {
      createMutation.mutate(customerData)
    }
  }

  // Reset form when customer changes
  useEffect(() => {
    if (customer) {
      setValue('name', customer.name)
      setValue('phone', customer.phone)
      setValue('email', customer.email || '')
      setValue('lineId', customer.lineId || '')
      setSelectedGender(customer.gender || 'male')
      setValue('dateOfBirth', customer.dateOfBirth ? new Date(customer.dateOfBirth).toISOString().split('T')[0] : '')
      setValue('notes', customer.notes || '')
    } else {
      reset()
      setSelectedGender('male')
    }
  }, [customer, setValue, reset])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="w-5 h-5 mr-2 text-purple-500" />
            {customer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
          </DialogTitle>
          <DialogDescription>
            {customer ? 'Cập nhật thông tin khách hàng' : 'Điền thông tin để tạo khách hàng mới'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Họ và tên *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                {...register('name', { required: 'Vui lòng nhập họ tên' })}
                placeholder="Nguyễn Văn A"
                className="pl-10"
              />
            </div>
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                {...register('phone', { 
                  required: 'Vui lòng nhập số điện thoại',
                  pattern: {
                    value: /^[0-9]{10,11}$/,
                    message: 'Số điện thoại không hợp lệ'
                  }
                })}
                placeholder="0901234567"
                className="pl-10"
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                {...register('email', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email không hợp lệ'
                  }
                })}
                placeholder="example@email.com"
                className="pl-10"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Line ID */}
          <div className="space-y-2">
            <Label htmlFor="lineId">Tên Line</Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                {...register('lineId')}
                placeholder="line_username"
                className="pl-10"
              />
            </div>
          </div>

          {/* Gender and Date of Birth */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Giới tính *</Label>
              <Select 
                value={selectedGender} 
                onValueChange={(value: 'male' | 'female' | 'other') => setSelectedGender(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giới tính..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Nam</SelectItem>
                  <SelectItem value="female">Nữ</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Ngày sinh</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="date"
                  {...register('dateOfBirth')}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              {...register('notes')}
              placeholder="Ghi chú thêm về khách hàng..."
              rows={3}
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
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Đang xử lý...' : 
               customer ? 'Cập nhật' : 'Tạo khách hàng'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
