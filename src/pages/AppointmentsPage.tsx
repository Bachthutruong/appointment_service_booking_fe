import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Calendar, Clock, User, Scissors, ChevronLeft, ChevronRight, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import AppointmentForm from '@/components/forms/AppointmentForm'
import { appointmentAPI } from '@/lib/api'
import { formatDate, formatTime, getStatusColor, formatCurrency } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

// Type definitions
interface Customer {
  _id: string
  name: string
  phone: string
  email?: string
}

interface Service {
  _id: string
  name: string
  price: number
  duration: number
}

interface Appointment {
  _id: string
  customer: Customer
  service: Service
  startTime: string
  endTime: string
  status: 'booked' | 'completed' | 'cancelled'
  notes?: string
  createdAt: string
}

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [viewMode, setViewMode] = useState('day')
  const [showAppointmentDetail, setShowAppointmentDetail] = useState(false)
  const { user } = useAuthStore()

  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ['appointments', selectedDate, viewMode],
    queryFn: () => {
      let startDate: Date, endDate: Date
      
      if (viewMode === 'day') {
        startDate = new Date(selectedDate)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(selectedDate)
        endDate.setHours(23, 59, 59, 999)
      } else if (viewMode === 'week') {
        startDate = new Date(selectedDate)
        startDate.setDate(selectedDate.getDate() - selectedDate.getDay())
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 6)
        endDate.setHours(23, 59, 59, 999)
      } else { // month
        startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
        endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59, 999)
      }
      
      return appointmentAPI.getAppointments({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }).then(res => res.data)
    },
  })

  const appointments = (appointmentsData?.appointments || []).sort((a: Appointment, b: Appointment) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  )
  const queryClient = useQueryClient()

  // Mutation để cập nhật trạng thái lịch hẹn
  const updateAppointmentStatusMutation = useMutation({
    mutationFn: ({ appointmentId, status }: { appointmentId: string, status: string }) => 
      appointmentAPI.updateAppointment(appointmentId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })

  // Mutation để xóa lịch hẹn
  const deleteAppointmentMutation = useMutation({
    mutationFn: (appointmentId: string) => appointmentAPI.deleteAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })

  const handleUpdateStatus = (appointment: Appointment, newStatus: string) => {
    updateAppointmentStatusMutation.mutate({ 
      appointmentId: appointment._id, 
      status: newStatus 
    })
  }

  const handleDeleteAppointment = (appointment: Appointment) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa lịch hẹn của ${appointment.customer?.name}?`)) {
      deleteAppointmentMutation.mutate(appointment._id)
    }
  }

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowAppointmentDetail(true)
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowAppointmentForm(true)
  }

  const handleCreateAppointment = () => {
    setSelectedAppointment(null)
    setShowAppointmentForm(true)
  }

  // Appointment Card Component
  const AppointmentCard = ({ appointment, size = 'normal' }: { appointment: Appointment, size?: 'small' | 'normal' }) => {
    const isSmall = size === 'small'
    
    return (
      <div 
        className={`${isSmall ? 'p-1 bg-blue-50 rounded text-xs cursor-pointer hover:bg-blue-100' : 'flex items-center space-x-4 p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer'}`}
        onClick={() => handleViewAppointment(appointment)}
      >
        {!isSmall && (
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
        )}
        
        <div className={`${isSmall ? 'space-y-1' : 'flex-1'}`}>
          <div className={`${isSmall ? 'font-medium truncate' : 'flex items-center space-x-2'}`}>
            <h3 className={`${isSmall ? 'text-xs' : 'font-semibold text-gray-900'}`}>
              {appointment.customer?.name}
            </h3>
            {!isSmall && (
              <Badge className={getStatusColor(appointment.status)}>
                {appointment.status === 'booked' && 'Đã đặt'}
                {appointment.status === 'completed' && 'Hoàn thành'}
                {appointment.status === 'cancelled' && 'Đã hủy'}
              </Badge>
            )}
          </div>
          
          <div className={`${isSmall ? 'text-gray-600' : 'flex items-center space-x-4 mt-1 text-sm text-gray-600'}`}>
            <div className={`${isSmall ? 'text-xs' : 'flex items-center font-medium text-blue-600'}`}>
              {!isSmall && <Clock className="w-4 h-4 mr-1" />}
              {formatTime(appointment.startTime)}
              {!isSmall && ` - ${formatTime(appointment.endTime)}`}
            </div>
            
            {!isSmall && (
              <>
                <div className="flex items-center">
                  <Scissors className="w-4 h-4 mr-1" />
                  {appointment.service?.name}
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {appointment.customer?.phone}
                </div>
              </>
            )}
          </div>
          
          {!isSmall && appointment.notes && (
            <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
              💬 {appointment.notes}
            </p>
          )}
        </div>
        
        {!isSmall && (
          <div className="text-right">
            <div className="text-lg font-semibold text-green-600">
              {formatCurrency(appointment.service?.price || 0)}
            </div>
            <div className="text-sm text-gray-500">
              {appointment.service?.duration} phút
            </div>
          </div>
        )}
        
        {!isSmall && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                handleViewAppointment(appointment)
              }}>
                <Eye className="mr-2 h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                handleEditAppointment(appointment)
              }}>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              {appointment.status === 'booked' && (
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation()
                  handleUpdateStatus(appointment, 'completed')
                }}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Đánh dấu hoàn thành
                </DropdownMenuItem>
              )}
              {appointment.status === 'booked' && (
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation()
                  handleUpdateStatus(appointment, 'cancelled')
                }}>
                  <Clock className="mr-2 h-4 w-4" />
                  Hủy lịch hẹn
                </DropdownMenuItem>
              )}
              {user?.role === 'admin' && (
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteAppointment(appointment)
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    )
  }

  // Helper functions for calendar
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    if (viewMode === 'day') {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1))
    } else if (viewMode === 'week') {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7))
    } else { // month
      newDate.setMonth(selectedDate.getMonth() + (direction === 'next' ? 1 : -1))
    }
    setSelectedDate(newDate)
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const getWeekDays = () => {
    const startOfWeek = new Date(selectedDate)
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay())
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      return day
    })
  }

  const getMonthDays = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(firstDay.getDate() - firstDay.getDay())
    
    const days = []
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate)
      day.setDate(startDate.getDate() + i)
      days.push(day)
    }
    return days
  }

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter((appointment: Appointment) => {
      const appointmentDate = new Date(appointment.startTime)
      return appointmentDate.toDateString() === day.toDateString()
    })
  }

  // const getAppointmentsForTimeSlot = (day: Date, hour: number) => {
  //   return appointments.filter(appointment => {
  //     const appointmentDate = new Date(appointment.startTime)
  //     const appointmentHour = appointmentDate.getHours()
  //     return appointmentDate.toDateString() === day.toDateString() && appointmentHour === hour
  //   })
  // }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lịch hẹn</h1>
            <p className="text-gray-600">Quản lý lịch hẹn khách hàng</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lịch hẹn</h1>
          <p className="text-gray-600">Quản lý lịch hẹn khách hàng</p>
        </div>
        <Button 
          onClick={handleCreateAppointment}
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Đặt lịch hẹn
        </Button>
      </div>

      {/* Calendar Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => navigateDate('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => navigateDate('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline"
                onClick={goToToday}
              >
                Hôm nay
              </Button>
              
              {/* View Mode Tabs */}
              <Tabs value={viewMode} onValueChange={setViewMode} className="ml-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="day">Ngày</TabsTrigger>
                  <TabsTrigger value="week">Tuần</TabsTrigger>
                  <TabsTrigger value="month">Tháng</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Display */}
      {viewMode === 'day' ? (
        /* Day View */
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {formatDate(selectedDate)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))
              ) : appointments.length > 0 ? (
                appointments.map((appointment: Appointment) => (
                  <AppointmentCard key={appointment._id} appointment={appointment} />
                ))
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Không có lịch hẹn nào
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Chưa có lịch hẹn nào cho ngày {formatDate(selectedDate)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'week' ? (
        /* Week View */
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Tuần từ {formatDate(getWeekDays()[0])} đến {formatDate(getWeekDays()[6])}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {getWeekDays().map((day, index) => {
                const dayAppointments = getAppointmentsForDay(day)
                return (
                  <div key={index} className="border rounded-lg p-2 min-h-[200px]">
                    <div className="text-center font-medium text-sm mb-2">
                      {day.toLocaleDateString('vi-VN', { weekday: 'short' })}
                      <br />
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 3).map((appointment: Appointment) => (
                        <AppointmentCard key={appointment._id} appointment={appointment} size="small" />
                      ))}
                      {dayAppointments.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayAppointments.length - 3} khác
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Month View */
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Tháng {selectedDate.getMonth() + 1} năm {selectedDate.getFullYear()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
                <div key={day} className="p-2 text-center font-medium text-sm text-gray-600">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {getMonthDays().map((day, index) => {
                const dayAppointments = getAppointmentsForDay(day)
                const isCurrentMonth = day.getMonth() === selectedDate.getMonth()
                const isToday = day.toDateString() === new Date().toDateString()
                
                return (
                  <div 
                    key={index} 
                    className={`border rounded-lg p-2 min-h-[120px] ${
                      !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                    } ${isToday ? 'bg-blue-50 border-blue-200' : ''}`}
                  >
                    <div className="text-center font-medium text-sm mb-2">
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 2).map((appointment: Appointment) => (
                        <AppointmentCard key={appointment._id} appointment={appointment} size="small" />
                      ))}
                      {dayAppointments.length > 2 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayAppointments.length - 2} khác
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appointment Form Modal */}
      <AppointmentForm 
        open={showAppointmentForm}
        onClose={() => {
          setShowAppointmentForm(false)
          setSelectedAppointment(null)
        }}
        appointment={selectedAppointment}
        onSuccess={() => {
          setShowAppointmentForm(false)
          setSelectedAppointment(null)
        }}
      />

      {/* Appointment Detail Modal */}
      <Dialog open={showAppointmentDetail} onOpenChange={setShowAppointmentDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-green-500" />
              Chi tiết lịch hẹn
            </DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về lịch hẹn
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedAppointment?.customer?.name}
                  </h3>
                  <p className="text-gray-600">{selectedAppointment.customer?.phone}</p>
                  {selectedAppointment.customer?.email && (
                    <p className="text-gray-600">{selectedAppointment.customer?.email}</p>
                  )}
                </div>
              </div>

              {/* Appointment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Dịch vụ</label>
                    <p className="text-lg font-semibold text-blue-600">
                      {selectedAppointment.service?.name}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Thời gian</label>
                    <p className="text-lg font-semibold">
                      {formatTime(selectedAppointment.startTime)} - {formatTime(selectedAppointment.endTime)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(selectedAppointment.startTime)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedAppointment.status)}>
                        {selectedAppointment.status === 'booked' && 'Đã đặt'}
                        {selectedAppointment.status === 'completed' && 'Hoàn thành'}
                        {selectedAppointment.status === 'cancelled' && 'Đã hủy'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Giá dịch vụ</label>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(selectedAppointment.service?.price || 0)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Thời lượng</label>
                    <p className="text-lg font-semibold">
                      {selectedAppointment.service?.duration} phút
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                    <p className="text-sm text-gray-600">
                      {formatDate(selectedAppointment.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedAppointment.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Ghi chú</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{selectedAppointment.notes}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAppointmentDetail(false)}
                >
                  Đóng
                </Button>
                <Button 
                  onClick={() => {
                    setShowAppointmentDetail(false)
                    handleEditAppointment(selectedAppointment)
                  }}
                  className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
                {selectedAppointment.status === 'booked' && (
                  <Button 
                    onClick={() => {
                      handleUpdateStatus(selectedAppointment, 'completed')
                      setShowAppointmentDetail(false)
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Hoàn thành
                  </Button>
                )}
                {user?.role === 'admin' && (
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      handleDeleteAppointment(selectedAppointment)
                      setShowAppointmentDetail(false)
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
