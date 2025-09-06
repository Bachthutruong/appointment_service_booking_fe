import { useQuery } from '@tanstack/react-query'
import { 
  Calendar, 
  Users, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/authStore'
import { reportAPI, reminderAPI } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const { user } = useAuthStore()
  
  // Only fetch dashboard data if user is admin
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => reportAPI.getDashboardOverview().then(res => res.data),
    enabled: user?.role === 'admin',
  })

  // Fetch today's reminders for all users
  const { data: todayReminders } = useQuery({
    queryKey: ['reminders', 'today'],
    queryFn: () => reminderAPI.getTodayReminders().then(res => res.data.reminders),
  })

  const stats = [
    {
      title: 'Doanh thu hôm nay',
      value: formatCurrency(dashboardData?.today?.revenue || 0),
      description: `${dashboardData?.today?.orders || 0} đơn hàng`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      adminOnly: true,
    },
    {
      title: 'Doanh thu tháng này',
      value: formatCurrency(dashboardData?.thisMonth?.revenue || 0),
      description: `${dashboardData?.thisMonth?.orders || 0} đơn hàng`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      adminOnly: true,
    },
    {
      title: 'Tổng khách hàng',
      value: dashboardData?.totalCustomers || 0,
      description: 'Khách hàng đã đăng ký',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      adminOnly: false,
    },
    {
      title: 'Cảnh báo tồn kho',
      value: dashboardData?.lowStockAlerts || 0,
      description: 'Sản phẩm sắp hết',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      adminOnly: true,
    },
  ]

  const filteredStats = stats.filter(stat => !stat.adminOnly || user?.role === 'admin')

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">
              Chào mừng trở lại, {user?.name}! 👋
            </h1>
            <p className="text-purple-100">
              Hôm nay là {formatDate(new Date())} - Chúc bạn một ngày làm việc hiệu quả!
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/20">
              <Calendar className="w-4 h-4 mr-2" />
              Xem lịch hẹn hôm nay
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-600 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Reminders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-orange-500" />
              Nhắc nhở hôm nay
            </CardTitle>
            <CardDescription>
              Danh sách các nhắc nhở cần xử lý hôm nay
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayReminders?.length > 0 ? (
              todayReminders.slice(0, 5).map((reminder: any) => (
                <div key={reminder._id} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {reminder.customer?.name}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {reminder.content}
                    </p>
                    <p className="text-xs text-gray-500">
                      {reminder.customer?.phone}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Chờ xử lý
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p>Không có nhắc nhở nào hôm nay! 🎉</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders (Admin Only) */}
        {user?.role === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-blue-500" />
                Đơn hàng gần đây
              </CardTitle>
              <CardDescription>
                5 đơn hàng được tạo gần đây nhất
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData?.recentOrders?.length > 0 ? (
                dashboardData.recentOrders.map((order: any) => (
                  <div key={order._id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {order.customer?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-600">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>Chưa có đơn hàng nào</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions for Employees */}
        {user?.role === 'employee' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-green-500" />
                Thao tác nhanh
              </CardTitle>
              <CardDescription>
                Các chức năng thường dùng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Tạo lịch hẹn mới
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Thêm khách hàng
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Tạo đơn hàng
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="w-4 h-4 mr-2" />
                Xem nhắc nhở
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

