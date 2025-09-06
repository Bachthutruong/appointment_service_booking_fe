import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Edit, Trash2, Package, User, DollarSign, Tag, FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { orderAPI } from '@/lib/api'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'
import { useAuthStore } from '@/store/authStore'

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data: orderData, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderAPI.getOrder(id!).then(res => res.data),
    enabled: !!id
  })

  const order = orderData?.order

  // Delete order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: orderAPI.deleteOrder,
    onSuccess: () => {
      toast({
        title: "Thành công!",
        description: "Đơn hàng đã được xóa",
      })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      navigate('/orders')
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || 'Có lỗi xảy ra khi xóa đơn hàng',
      })
    }
  })

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => 
      orderAPI.updateOrderStatus(id, status),
    onSuccess: () => {
      toast({
        title: "Thành công!",
        description: "Trạng thái đơn hàng đã được cập nhật",
      })
      queryClient.invalidateQueries({ queryKey: ['order', id] })
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái',
      })
    }
  })

  const handleDeleteOrder = async () => {
    await deleteOrderMutation.mutateAsync(id!)
    setShowDeleteDialog(false)
  }

  const handleUpdateStatus = async (newStatus: string) => {
    await updateOrderStatusMutation.mutateAsync({ id: id!, status: newStatus })
  }

  const getStatusConfig = (status: string) => {
    const statusConfig = {
      pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
      processing: { label: 'Đang xử lý', color: 'bg-orange-100 text-orange-800' },
      shipped: { label: 'Đã giao', color: 'bg-green-100 text-green-800' },
      delivered: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
    }
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Không tìm thấy đơn hàng
        </h3>
        <p className="text-gray-600 mb-4">
          Đơn hàng bạn đang tìm kiếm không tồn tại
        </p>
        <Button onClick={() => navigate('/orders')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/orders')}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Đơn hàng #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-gray-600">
              Tạo lúc {formatDate(order.createdAt)} - {formatTime(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/orders/${id}/edit`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
          {user?.role === 'admin' && (
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Xác nhận xóa đơn hàng</DialogTitle>
                  <DialogDescription>
                    Bạn có chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn tác.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                    Hủy
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteOrder}
                    disabled={deleteOrderMutation.isPending}
                  >
                    {deleteOrderMutation.isPending ? 'Đang xóa...' : 'Xóa'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-500" />
                Thông tin khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tên:</span>
                  <span className="font-medium">{order.customer?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số điện thoại:</span>
                  <span className="font-medium">{order.customer?.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{order.customer?.email || 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2 text-green-500" />
                Sản phẩm/Dịch vụ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {item.item?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.type === 'product' ? 'Sản phẩm' : 'Dịch vụ'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {item.quantity}x {formatCurrency(item.unitPrice)}
                      </div>
                      <div className="text-sm text-gray-500">
                        = {formatCurrency(item.totalPrice)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="w-5 h-5 mr-2 text-purple-500" />
                Trạng thái đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Trạng thái hiện tại:</span>
                  <Badge className={getStatusConfig(order.status).color}>
                    {getStatusConfig(order.status).label}
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Cập nhật trạng thái:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                      <Button
                        key={status}
                        variant={order.status === status ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleUpdateStatus(status)}
                        disabled={order.status === status || updateOrderStatusMutation.isPending}
                        className="text-xs"
                      >
                        {getStatusConfig(status).label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                Tổng kết đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Giảm giá:</span>
                    <span>-{formatCurrency(order.discountAmount)}</span>
                  </div>
                )}
                {order.shippingFee > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Phí ship:</span>
                    <span>+{formatCurrency(order.shippingFee)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-500" />
                Chi tiết đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-mono text-sm">#{order._id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày tạo:</span>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Người tạo:</span>
                  <span>{order.createdBy?.name || 'N/A'}</span>
                </div>
                {order.appointmentId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lịch hẹn:</span>
                    <span className="text-blue-600">#{order.appointmentId.slice(-8).toUpperCase()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
