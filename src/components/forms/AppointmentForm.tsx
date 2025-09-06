import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { Calendar, Clock, User, Scissors, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/useToast'
import { customerAPI, serviceAPI, appointmentAPI } from '@/lib/api'
// import { formatDateTime } from '@/lib/utils'
import CustomerForm from './CustomerForm'

interface AppointmentFormProps {
  open: boolean
  onClose: () => void
  appointment?: any
  onSuccess?: () => void
}

interface AppointmentFormData {
  customer: string
  service: string
  startTime: string
  endTime: string
  notes?: string
}

export default function AppointmentForm({ open, onClose, appointment, onSuccess }: AppointmentFormProps) {
  const [showNewCustomer, setShowNewCustomer] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormData>()

  // Watch service and startTime to auto-calculate endTime
  const selectedService = watch('service')
  const startTime = watch('startTime')

  // Fetch customers and services
  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerAPI.getCustomers({ limit: 100 }).then(res => res.data),
  })

  const { data: servicesData } = useQuery({
    queryKey: ['services'],
    queryFn: () => serviceAPI.getServices({ isActive: true }).then(res => res.data),
  })

  const customers = customersData?.customers || []
  const services = servicesData?.services || []

  // Auto-calculate end time when service or start time changes
  useEffect(() => {
    if (selectedService && startTime) {
      const service = services.find((s: any) => s._id === selectedService)
      if (service) {
        const start = new Date(startTime)
        const end = new Date(start.getTime() + service.duration * 60000)
        setValue('endTime', end.toISOString().slice(0, 16))
      }
    }
  }, [selectedService, startTime, services, setValue])

  // Create appointment mutation
  const createMutation = useMutation({
    mutationFn: appointmentAPI.createAppointment,
    onSuccess: () => {
      toast({
        title: "Thành công!",
        description: "Lịch hẹn đã được tạo",
      })
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
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

  // Update appointment mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => 
      appointmentAPI.updateAppointment(id, data),
    onSuccess: () => {
      toast({
        title: "Thành công!",
        description: "Lịch hẹn đã được cập nhật",
      })
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
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

  const onSubmit = (data: AppointmentFormData) => {
    const appointmentData = {
      customer: data.customer,
      service: data.service,
      startTime: new Date(data.startTime).toISOString(),
      endTime: new Date(data.endTime).toISOString(),
      notes: data.notes,
    }

    if (appointment) {
      updateMutation.mutate({ id: appointment._id, data: appointmentData })
    } else {
      createMutation.mutate(appointmentData)
    }
  }

  // Reset form when appointment changes
  useEffect(() => {
    if (appointment) {
      setValue('customer', appointment.customer._id)
      setValue('service', appointment.service._id)
      setValue('startTime', new Date(appointment.startTime).toISOString().slice(0, 16))
      setValue('endTime', new Date(appointment.endTime).toISOString().slice(0, 16))
      setValue('notes', appointment.notes || '')
    } else {
      reset()
    }
  }, [appointment, setValue, reset])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-500" />
            {appointment ? 'Chỉnh sửa lịch hẹn' : 'Tạo lịch hẹn mới'}
          </DialogTitle>
          <DialogDescription>
            {appointment ? 'Cập nhật thông tin lịch hẹn' : 'Điền thông tin để tạo lịch hẹn mới'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label htmlFor="customer">Khách hàng *</Label>
            <div className="flex space-x-2">
              <div className="flex-1">
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
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowNewCustomer(true)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {errors.customer && (
              <p className="text-sm text-red-500">{errors.customer.message}</p>
            )}
          </div>

          {/* Service Selection */}
          <div className="space-y-2">
            <Label htmlFor="service">Dịch vụ *</Label>
            <Controller
              name="service"
              control={control}
              rules={{ required: 'Vui lòng chọn dịch vụ' }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn dịch vụ..." />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service: any) => (
                      <SelectItem key={service._id} value={service._id}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-2">
                            <Scissors className="w-4 h-4" />
                            <span>{service.name}</span>
                          </div>
                          <div className="text-sm text-gray-500 ml-4">
                            {service.duration}p - {service.price.toLocaleString()}đ
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.service && (
              <p className="text-sm text-red-500">{errors.service.message}</p>
            )}
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Thời gian bắt đầu *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="datetime-local"
                  {...register('startTime', { required: 'Vui lòng chọn thời gian bắt đầu' })}
                  className="pl-10"
                />
              </div>
              {errors.startTime && (
                <p className="text-sm text-red-500">{errors.startTime.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">Thời gian kết thúc *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="datetime-local"
                  {...register('endTime', { required: 'Vui lòng chọn thời gian kết thúc' })}
                  className="pl-10"
                />
              </div>
              {errors.endTime && (
                <p className="text-sm text-red-500">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              {...register('notes')}
              placeholder="Ghi chú thêm về lịch hẹn..."
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
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Đang xử lý...' : 
               appointment ? 'Cập nhật' : 'Tạo lịch hẹn'}
            </Button>
          </div>
        </form>

        {/* Customer Form for creating new customer */}
        <CustomerForm 
          open={showNewCustomer}
          onClose={() => setShowNewCustomer(false)}
          onSuccess={(newCustomer) => {
            setValue('customer', newCustomer._id)
            setShowNewCustomer(false)
            queryClient.invalidateQueries({ queryKey: ['customers'] })
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
