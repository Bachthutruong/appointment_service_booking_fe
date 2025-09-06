import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, ShoppingCart, User, Calendar, DollarSign, Bell, MoreHorizontal, Edit, Trash2, Eye, Package, Download, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DataTable } from '@/components/ui/data-table'
import OrderForm from '@/components/forms/OrderForm'
import ReminderForm from '@/components/forms/ReminderForm'
import { orderAPI } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/hooks/useToast'

export default function OrdersPage() {
  const navigate = useNavigate()
  const [searchTerm] = useState('')
  const [page] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [showReminderForm, setShowReminderForm] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)
  const { user } = useAuthStore()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders', { page, searchTerm, statusFilter }],
    queryFn: () => orderAPI.getOrders({ 
      page, 
      limit: 50, 
      search: searchTerm,
      status: statusFilter !== 'all' ? statusFilter : undefined
    }).then(res => {
      console.log('API Response:', res.data);
      if (res.data?.orders?.[0]?.items) {
        console.log('First order items:', res.data.orders[0].items);
      }
      return res.data;
    }),
  })

  const orders = ordersData?.orders || []

  // Delete order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: orderAPI.deleteOrder,
    onSuccess: () => {
      toast({
        title: "Thành công!",
        description: "Đơn hàng đã được xóa",
      })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
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
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái',
      })
    }
  })

  const handleDeleteOrder = async (orderId: string) => {
    setOrderToDelete(orderId)
    setShowDeleteDialog(true)
  }

  const confirmDeleteOrder = async () => {
    if (orderToDelete) {
      await deleteOrderMutation.mutateAsync(orderToDelete)
      setShowDeleteDialog(false)
      setOrderToDelete(null)
    }
  }

  const handleViewOrder = (order: any) => {
    navigate(`/orders/${order._id}`)
  }

  const handleEditOrder = (order: any) => {
    navigate(`/orders/${order._id}/edit`)
  }

  const handleCreateReminder = (order: any) => {
    setSelectedOrder(order)
    setShowReminderForm(true)
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    await updateOrderStatusMutation.mutateAsync({ id: orderId, status: newStatus })
  }

  const handleExportData = () => {
    const csvContent = [
      ['Mã đơn hàng', 'Khách hàng', 'Số lượng sản phẩm', 'Tổng tiền', 'Trạng thái', 'Ngày tạo'],
      ...orders.map((order: any) => [
        `#${order._id.slice(-8).toUpperCase()}`,
        order.customer?.name || 'N/A',
        order.items?.length || 0,
        order.totalAmount || 0,
        order.status || 'pending',
        formatDate(order.createdAt)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Define columns for DataTable
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "_id",
      header: "Mã đơn hàng",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 text-white" />
          </div>
          <span className="font-mono text-sm font-medium">
            #{(row.getValue("_id") as string).slice(-8).toUpperCase()}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "customer",
      header: "Khách hàng",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-500" />
          <span className="font-medium">{row.original.customer?.name || 'N/A'}</span>
        </div>
      ),
    },
    {
      accessorKey: "items",
      header: "Sản phẩm/Dịch vụ",
      cell: ({ row }) => {
        const items = row.getValue("items") as any[]
        return (
          <div className="max-w-[200px]">
            <div className="flex items-center space-x-1 mb-1">
              <Package className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">{items?.length || 0} mục</span>
            </div>
            <div className="text-xs text-gray-500 truncate">
              {items?.slice(0, 2).map((item, index) => {
                const itemName = item.item?.name || 'N/A'
                return (
                  <span key={index}>
                    {item.quantity}x {itemName}
                    {index < Math.min(items.length, 2) - 1 ? ', ' : ''}
                  </span>
                )
              })}
              {items?.length > 2 && ` +${items.length - 2} khác`}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "totalAmount",
      header: "Tổng tiền",
      cell: ({ row }) => (
        <div className="text-right">
          <div className="font-semibold text-green-600">
            {formatCurrency(row.getValue("totalAmount"))}
          </div>
          {row.original.discountAmount > 0 && (
            <div className="text-xs text-red-500">
              -{formatCurrency(row.original.discountAmount)} giảm giá
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const orderId = (row.original as any)._id
        const statusConfig = {
          pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
          confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
          processing: { label: 'Đang xử lý', color: 'bg-orange-100 text-orange-800' },
          shipped: { label: 'Đã giao', color: 'bg-green-100 text-green-800' },
          delivered: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
          cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
        }
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-auto p-0">
                <Badge className={`${config.color} cursor-pointer hover:opacity-80`}>
                  {config.label}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(statusConfig).map(([key, value]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => handleUpdateStatus(orderId, key)}
                  disabled={key === status}
                >
                  <Badge className={value.color}>
                    {value.label}
                  </Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{formatDate(row.getValue("createdAt"))}</span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const order = row.original as any
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                <Eye className="mr-2 h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditOrder(order)}>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateReminder(order)}>
                <Bell className="mr-2 h-4 w-4" />
                Tạo nhắc nhở
              </DropdownMenuItem>
              {user?.role === 'admin' && (
                <DropdownMenuItem 
                  onClick={() => handleDeleteOrder(order._id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Đơn hàng</h1>
          <p className="text-gray-600">Quản lý đơn hàng và thanh toán</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="processing">Đang xử lý</option>
            <option value="shipped">Đã giao</option>
            <option value="delivered">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['orders'] })}
            variant="outline"
            className="flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
          <Button 
            onClick={handleExportData}
            variant="outline"
            className="flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Xuất dữ liệu
          </Button>
          <Button 
            onClick={() => navigate('/orders/new')}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo đơn hàng
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(orders.reduce((sum: any, order: any) => sum + (order.totalAmount || 0), 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter((order: any) => order.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter((order: any) => order.status === 'delivered').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2 text-orange-500" />
            Danh sách đơn hàng ({orders.length})
          </CardTitle>
          <CardDescription>
            Quản lý và theo dõi tất cả đơn hàng của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : orders.length > 0 ? (
            <DataTable 
              columns={columns} 
              data={orders}
              searchKey="customer.name"
              searchPlaceholder="Tìm kiếm theo tên khách hàng hoặc mã đơn hàng..."
            />
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có đơn hàng nào
              </h3>
              <p className="text-gray-600 mb-4">
                Bắt đầu bằng cách tạo đơn hàng đầu tiên của bạn
              </p>
              <Button 
                onClick={() => navigate('/orders/new')}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tạo đơn hàng
              </Button>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Order Form Modal */}
      <OrderForm 
        open={showOrderForm}
        onClose={() => setShowOrderForm(false)}
        onSuccess={() => setShowOrderForm(false)}
      />

      {/* Reminder Form Modal */}
      <ReminderForm 
        open={showReminderForm}
        onClose={() => {
          setShowReminderForm(false)
          setSelectedOrder(null)
        }}
        order={selectedOrder}
        customer={selectedOrder?.customer || null}
        onSuccess={() => {
          setShowReminderForm(false)
          setSelectedOrder(null)
        }}
      />

      {/* Delete Order Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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
              onClick={confirmDeleteOrder}
              disabled={deleteOrderMutation.isPending}
            >
              {deleteOrderMutation.isPending ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
