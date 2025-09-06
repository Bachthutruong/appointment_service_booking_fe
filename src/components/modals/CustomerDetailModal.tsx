import { useQuery } from '@tanstack/react-query'
import { User, Phone, Calendar, MessageSquare, ShoppingCart, Clock, DollarSign, Package } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { customerAPI } from '@/lib/api'
import { formatDate, formatDateTime, formatCurrency, getInitials, getStatusColor } from '@/lib/utils'

interface CustomerDetailModalProps {
  open: boolean
  onClose: () => void
  customer: any
  onEdit?: () => void
}

export default function CustomerDetailModal({ open, onClose, customer, onEdit }: CustomerDetailModalProps) {
  // Fetch customer history
  const { data: historyData, isLoading } = useQuery({
    queryKey: ['customer-history', customer?._id],
    queryFn: () => customerAPI.getCustomerHistory(customer._id).then(res => res.data.history),
    enabled: !!customer?._id && open,
  })

  if (!customer) return null

  const appointments = historyData?.appointments || []
  const orders = historyData?.orders || []
  const totalSpent = historyData?.totalSpent || 0

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="w-5 h-5 mr-2 text-purple-500" />
              Thông tin khách hàng
            </div>
            <Button variant="outline" onClick={onEdit} size="sm">
              Chỉnh sửa
            </Button>
          </DialogTitle>
          <DialogDescription>
            Xem chi tiết thông tin và lịch sử của khách hàng
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="" alt={customer.name} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg">
                    {getInitials(customer.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
                    <Badge variant={customer.gender === 'female' ? 'default' : 'secondary'} className="mt-1">
                      {customer.gender === 'female' ? 'Nữ' : customer.gender === 'male' ? 'Nam' : 'Khác'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">SĐT:</span>
                      <span>{customer.phone}</span>
                    </div>
                    
                    {customer.lineId && (
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Line:</span>
                        <span>{customer.lineId}</span>
                      </div>
                    )}
                    
                    {customer.dateOfBirth && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Sinh nhật:</span>
                        <span>{formatDate(customer.dateOfBirth)}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Tham gia:</span>
                      <span>{formatDate(customer.createdAt)}</span>
                    </div>
                  </div>
                  
                  {customer.notes && (
                    <div className="p-3 bg-white/50 rounded-lg border border-purple-200">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Ghi chú:</span> {customer.notes}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalSpent)}
                  </div>
                  <div className="text-sm text-gray-600">Tổng chi tiêu</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History Tabs */}
          <Tabs defaultValue="appointments" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="appointments" className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Lịch hẹn ({appointments.length})
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Đơn hàng ({orders.length})
              </TabsTrigger>
            </TabsList>

            {/* Appointments History */}
            <TabsContent value="appointments">
              <Card>
                <CardHeader>
                  <CardTitle>Lịch sử lịch hẹn</CardTitle>
                  <CardDescription>
                    Tất cả các lịch hẹn đã thực hiện
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse p-4 bg-gray-50 rounded-lg">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : appointments.length > 0 ? (
                    <div className="space-y-4">
                      {appointments.map((appointment: any) => (
                        <div key={appointment._id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-semibold text-gray-900">
                                    {appointment.service?.name}
                                  </h4>
                                  <Badge className={getStatusColor(appointment.status)}>
                                    {appointment.status === 'booked' && 'Đã đặt'}
                                    {appointment.status === 'completed' && 'Hoàn thành'}
                                    {appointment.status === 'cancelled' && 'Đã hủy'}
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                  <div className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {formatDateTime(appointment.startTime)}
                                  </div>
                                  <div className="flex items-center">
                                    <DollarSign className="w-3 h-3 mr-1" />
                                    {formatCurrency(appointment.service?.price || 0)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          {appointment.notes && (
                            <p className="text-sm text-gray-600 mt-3 pl-13">
                              Ghi chú: {appointment.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-600">Chưa có lịch hẹn nào</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders History */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Lịch sử đơn hàng</CardTitle>
                  <CardDescription>
                    Tất cả các đơn hàng và chi tiêu
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse p-4 bg-gray-50 rounded-lg">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order: any) => (
                        <div key={order._id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                <ShoppingCart className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-semibold text-gray-900">
                                    Đơn hàng #{order._id.slice(-8).toUpperCase()}
                                  </h4>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                  <div className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {formatDate(order.createdAt)}
                                  </div>
                                  <div className="flex items-center">
                                    <Package className="w-3 h-3 mr-1" />
                                    {order.items?.length || 0} sản phẩm
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-green-600">
                                {formatCurrency(order.totalAmount)}
                              </div>
                            </div>
                          </div>
                          
                          {/* Order Items */}
                          {order.items && order.items.length > 0 && (
                            <div className="mt-4 pl-13 space-y-1">
                              {order.items.slice(0, 3).map((item: any, index: number) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    {item.quantity}x {item.item?.name || 'N/A'}
                                  </span>
                                  <span className="font-medium">
                                    {formatCurrency(item.totalPrice)}
                                  </span>
                                </div>
                              ))}
                              {order.items.length > 3 && (
                                <div className="text-xs text-gray-500">
                                  +{order.items.length - 3} sản phẩm khác...
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingCart className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-600">Chưa có đơn hàng nào</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Customer Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <div className="text-2xl font-bold text-blue-600">
                  {appointments.length}
                </div>
                <div className="text-sm text-gray-600">Lịch hẹn</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <ShoppingCart className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                <div className="text-2xl font-bold text-orange-600">
                  {orders.length}
                </div>
                <div className="text-sm text-gray-600">Đơn hàng</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <DollarSign className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalSpent)}
                </div>
                <div className="text-sm text-gray-600">Tổng chi tiêu</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
