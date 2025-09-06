import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, TrendingUp, Users, Package, DollarSign, Calendar, Download, RefreshCw, Eye, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { reportAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  const { data: revenueData, isLoading: loadingRevenue, error: revenueError } = useQuery({
    queryKey: ['reports', 'revenue', dateRange],
    queryFn: () => reportAPI.getRevenueReport({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      period: 'day'
    }).then(res => {
      console.log('Revenue API Response:', res.data);
      return res.data;
    }),
  })

  const { data: topSellingData } = useQuery({
    queryKey: ['reports', 'top-selling', dateRange],
    queryFn: () => reportAPI.getTopSellingReport({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      limit: 10
    }).then(res => {
      console.log('Top Selling API Response:', res.data);
      return res.data;
    }),
  })

  const { data: customerData, isLoading: loadingCustomers, error: customerError } = useQuery({
    queryKey: ['reports', 'customers', dateRange],
    queryFn: () => reportAPI.getCustomerReport({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    }).then(res => {
      console.log('Customer API Response:', res.data);
      return res.data;
    }),
  })

  const { data: inventoryData, isLoading: loadingInventory, error: inventoryError } = useQuery({
    queryKey: ['reports', 'inventory'],
    queryFn: () => reportAPI.getInventoryReport().then(res => {
      console.log('Inventory API Response:', res.data);
      return res.data;
    }),
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Báo cáo & Thống kê</h1>
            <p className="text-blue-100 mt-1">Phân tích doanh thu và hiệu quả kinh doanh</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg p-2">
              <Calendar className="w-4 h-4" />
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="bg-transparent text-white placeholder-white/70 text-sm border-none outline-none"
              />
              <span className="text-white/70">đến</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="bg-transparent text-white placeholder-white/70 text-sm border-none outline-none"
              />
            </div>
            <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm mới
            </Button>
            <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
              <Download className="w-4 h-4 mr-2" />
              Xuất báo cáo
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-100">
                Tổng doanh thu
              </CardTitle>
              <DollarSign className="w-5 h-5 text-green-200" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingRevenue ? (
              <div className="animate-pulse">
                <div className="h-8 bg-green-400 rounded mb-2"></div>
                <div className="h-4 bg-green-400 rounded w-3/4"></div>
              </div>
            ) : revenueError ? (
              <div className="text-red-200 text-sm">
                Lỗi tải dữ liệu
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold mb-1">
                  {formatCurrency(revenueData?.summary?.total || 0)}
                </div>
                <div className="flex items-center space-x-2">
                  <ArrowUpRight className="w-4 h-4 text-green-200" />
                  <p className="text-green-100 text-sm">
                    {revenueData?.summary?.count || 0} đơn hàng
                  </p>
                </div>
                <div className="mt-2 text-xs text-green-200">
                  Tăng 12% so với tháng trước
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-100">
                Khách hàng
              </CardTitle>
              <Users className="w-5 h-5 text-blue-200" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingCustomers ? (
              <div className="animate-pulse">
                <div className="h-8 bg-blue-400 rounded mb-2"></div>
                <div className="h-4 bg-blue-400 rounded w-3/4"></div>
              </div>
            ) : customerError ? (
              <div className="text-red-200 text-sm">
                Lỗi tải dữ liệu
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold mb-1">
                  {customerData?.totalCustomers || 0}
                </div>
                <div className="flex items-center space-x-2">
                  <ArrowUpRight className="w-4 h-4 text-blue-200" />
                  <p className="text-blue-100 text-sm">
                    +{customerData?.newCustomers || 0} khách mới
                  </p>
                </div>
                <div className="mt-2 text-xs text-blue-200">
                  Tăng 8% so với tháng trước
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-100">
                Tỷ lệ quay lại
              </CardTitle>
              <TrendingUp className="w-5 h-5 text-purple-200" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingCustomers ? (
              <div className="animate-pulse">
                <div className="h-8 bg-purple-400 rounded mb-2"></div>
                <div className="h-4 bg-purple-400 rounded w-3/4"></div>
              </div>
            ) : customerError ? (
              <div className="text-red-200 text-sm">
                Lỗi tải dữ liệu
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold mb-1">
                  {customerData?.retention?.retentionRate?.toFixed(1) || 0}%
                </div>
                <div className="flex items-center space-x-2">
                  <ArrowUpRight className="w-4 h-4 text-purple-200" />
                  <p className="text-purple-100 text-sm">
                    {customerData?.retention?.returningCustomers || 0} khách quay lại
                  </p>
                </div>
                <div className="mt-2 text-xs text-purple-200">
                  Tăng 5% so với tháng trước
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-orange-100">
                Cảnh báo kho
              </CardTitle>
              <Package className="w-5 h-5 text-orange-200" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingInventory ? (
              <div className="animate-pulse">
                <div className="h-8 bg-orange-400 rounded mb-2"></div>
                <div className="h-4 bg-orange-400 rounded w-3/4"></div>
              </div>
            ) : inventoryError ? (
              <div className="text-red-200 text-sm">
                Lỗi tải dữ liệu
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold mb-1">
                  {inventoryData?.lowStockProducts?.length || 0}
                </div>
                <div className="flex items-center space-x-2">
                  <ArrowDownRight className="w-4 h-4 text-orange-200" />
                  <p className="text-orange-100 text-sm">
                    Sản phẩm sắp hết
                  </p>
                </div>
                <div className="mt-2 text-xs text-orange-200">
                  Cần nhập hàng ngay
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-1">
          <TabsList className="grid w-full grid-cols-4 bg-transparent">
            <TabsTrigger value="revenue" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <DollarSign className="w-4 h-4 mr-2" />
              Doanh thu
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <Package className="w-4 h-4 mr-2" />
              Sản phẩm
            </TabsTrigger>
            <TabsTrigger value="customers" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Khách hàng
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Tồn kho
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Revenue Report */}
        <TabsContent value="revenue">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                      Biểu đồ doanh thu
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      <Eye className="w-3 h-3 mr-1" />
                      Xem chi tiết
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Xu hướng doanh thu theo thời gian
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {revenueData?.revenueData?.length > 0 ? (
                    <div className="space-y-4">
                      {/* Revenue Chart */}
                      <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={revenueData.revenueData.slice(0, 7).map((item: any) => ({
                            date: `${item._id.day}/${item._id.month}`,
                            revenue: item.totalRevenue,
                            orders: item.totalOrders
                          }))}>
                            <defs>
                              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="date" 
                              stroke="#6b7280"
                              fontSize={12}
                            />
                            <YAxis 
                              stroke="#6b7280"
                              fontSize={12}
                              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                            />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: '#1f2937',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#f9fafb'
                              }}
                              formatter={(value: any, name: string) => [
                                name === 'revenue' ? formatCurrency(value) : value,
                                name === 'revenue' ? 'Doanh thu' : 'Đơn hàng'
                              ]}
                            />
                            <Area
                              type="monotone"
                              dataKey="revenue"
                              stroke="#10b981"
                              strokeWidth={3}
                              fill="url(#revenueGradient)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {/* Revenue List */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900 flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Doanh thu theo ngày
                        </h3>
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {revenueData.revenueData.slice(0, 10).map((item: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-green-50 rounded-lg hover:shadow-sm transition-all">
                              <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-gray-700 font-medium">
                                  {item._id.day}/{item._id.month}/{item._id.year}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-green-600">
                                  {formatCurrency(item.totalRevenue)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {item.totalOrders} đơn
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">Không có dữ liệu doanh thu</p>
                      <p className="text-sm">Trong khoảng thời gian này</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Revenue Stats */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-100">
                    Tổng doanh thu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {formatCurrency(revenueData?.summary?.total || 0)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowUpRight className="w-4 h-4 text-green-200" />
                    <span className="text-green-100 text-sm">
                      Tăng 12% so với tháng trước
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-100">
                    Tổng đơn hàng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {revenueData?.summary?.count || 0}
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowUpRight className="w-4 h-4 text-blue-200" />
                    <span className="text-blue-100 text-sm">
                      Tăng 8% so với tháng trước
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-100">
                    Giá trị TB/đơn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {formatCurrency(revenueData?.summary?.total / (revenueData?.summary?.count || 1))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowUpRight className="w-4 h-4 text-purple-200" />
                    <span className="text-purple-100 text-sm">
                      Tăng 5% so với tháng trước
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Top Products */}
        <TabsContent value="products">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Products Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2 text-green-500" />
                  Biểu đồ sản phẩm bán chạy
                </CardTitle>
                <CardDescription>
                  Top 10 sản phẩm và dịch vụ có doanh thu cao nhất
                </CardDescription>
              </CardHeader>
              <CardContent>
                {topSellingData?.topSelling?.length > 0 ? (
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topSellingData.topSelling.slice(0, 10).map((item: any) => ({
                        name: item.name.length > 15 ? `${item.name.substring(0, 15)}...` : item.name,
                        revenue: item.totalRevenue,
                        quantity: item.totalQuantity,
                        type: item.type === 'product' ? 'Sản phẩm' : 'Dịch vụ'
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="name" 
                          stroke="#6b7280"
                          fontSize={10}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          fontSize={12}
                          tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#f9fafb'
                          }}
                          formatter={(value: any, name: string) => [
                            name === 'revenue' ? formatCurrency(value) : value,
                            name === 'revenue' ? 'Doanh thu' : 'Số lượng'
                          ]}
                        />
                        <Bar 
                          dataKey="revenue" 
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Không có dữ liệu sản phẩm</p>
                    <p className="text-sm">Trong khoảng thời gian này</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Products List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                  Danh sách chi tiết
                </CardTitle>
                <CardDescription>
                  Thông tin chi tiết về từng sản phẩm/dịch vụ
                </CardDescription>
              </CardHeader>
              <CardContent>
                {topSellingData?.topSelling?.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {topSellingData.topSelling.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-green-50 rounded-lg hover:shadow-sm transition-all">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                            <p className="text-xs text-gray-600 capitalize">
                              {item.type === 'product' ? 'Sản phẩm' : 'Dịch vụ'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600 text-sm">
                            {formatCurrency(item.totalRevenue)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.totalQuantity} lần • {item.orderCount} đơn
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>Không có dữ liệu sản phẩm trong khoảng thời gian này</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customer Report */}
        <TabsContent value="customers">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-500" />
                  Biểu đồ khách hàng VIP
                </CardTitle>
                <CardDescription>
                  Top khách hàng có chi tiêu cao nhất
                </CardDescription>
              </CardHeader>
              <CardContent>
                {customerData?.topCustomers?.length > 0 ? (
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={customerData.topCustomers.slice(0, 8).map((customer: any) => ({
                        name: customer.customer?.name?.length > 10 ? `${customer.customer.name.substring(0, 10)}...` : customer.customer?.name || 'N/A',
                        spent: customer.totalSpent,
                        orders: customer.orderCount
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="name" 
                          stroke="#6b7280"
                          fontSize={10}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          fontSize={12}
                          tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#f9fafb'
                          }}
                          formatter={(value: any, name: string) => [
                            name === 'spent' ? formatCurrency(value) : value,
                            name === 'spent' ? 'Chi tiêu' : 'Đơn hàng'
                          ]}
                        />
                        <Bar 
                          dataKey="spent" 
                          fill="#8b5cf6"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Không có dữ liệu khách hàng</p>
                    <p className="text-sm">Trong khoảng thời gian này</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Stats & List */}
            <div className="space-y-6">
              {/* Customer Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thống kê khách hàng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="text-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg">
                      <div className="text-2xl font-bold">
                        {customerData?.totalCustomers || 0}
                      </div>
                      <div className="text-sm text-blue-100">Tổng khách hàng</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg">
                      <div className="text-2xl font-bold">
                        {customerData?.newCustomers || 0}
                      </div>
                      <div className="text-sm text-green-100">Khách hàng mới</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg">
                      <div className="text-2xl font-bold">
                        {customerData?.retention?.retentionRate?.toFixed(1) || 0}%
                      </div>
                      <div className="text-sm text-purple-100">Tỷ lệ quay lại</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Customers List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Khách hàng VIP</CardTitle>
                </CardHeader>
                <CardContent>
                  {customerData?.topCustomers?.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {customerData.topCustomers.slice(0, 5).map((customer: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:shadow-sm transition-all">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {customer.customer?.name}
                              </h4>
                              <p className="text-xs text-gray-600">
                                {customer.customer?.phone}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-purple-600 text-sm">
                              {formatCurrency(customer.totalSpent)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {customer.orderCount} đơn
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>Không có dữ liệu khách hàng</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Inventory Report */}
        <TabsContent value="inventory">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inventory Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2 text-orange-500" />
                  Biểu đồ tình trạng tồn kho
                </CardTitle>
                <CardDescription>
                  Phân bố sản phẩm theo trạng thái tồn kho
                </CardDescription>
              </CardHeader>
              <CardContent>
                {inventoryData ? (
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Đang bán', value: inventoryData.inventoryValue?.totalProducts || 0, color: '#10b981' },
                            { name: 'Sắp hết hàng', value: inventoryData.lowStockProducts?.length || 0, color: '#f59e0b' },
                            { name: 'Hết hàng', value: inventoryData.outOfStockProducts?.length || 0, color: '#ef4444' }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[
                            { name: 'Đang bán', value: inventoryData.inventoryValue?.totalProducts || 0, color: '#10b981' },
                            { name: 'Sắp hết hàng', value: inventoryData.lowStockProducts?.length || 0, color: '#f59e0b' },
                            { name: 'Hết hàng', value: inventoryData.outOfStockProducts?.length || 0, color: '#ef4444' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#f9fafb'
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Không có dữ liệu tồn kho</p>
                    <p className="text-sm">Trong khoảng thời gian này</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Inventory Stats & Alerts */}
            <div className="space-y-6">
              {/* Inventory Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thống kê tồn kho</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg">
                      <div className="text-2xl font-bold">
                        {formatCurrency(inventoryData?.inventoryValue?.totalSellingValue || 0)}
                      </div>
                      <div className="text-sm text-green-100">Giá trị bán</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg">
                      <div className="text-2xl font-bold">
                        {formatCurrency(inventoryData?.inventoryValue?.totalCostValue || 0)}
                      </div>
                      <div className="text-sm text-blue-100">Giá trị vốn</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg">
                      <div className="text-2xl font-bold">
                        {inventoryData?.inventoryValue?.totalProducts || 0}
                      </div>
                      <div className="text-sm text-purple-100">Loại sản phẩm</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg">
                      <div className="text-2xl font-bold">
                        {inventoryData?.inventoryValue?.totalUnits || 0}
                      </div>
                      <div className="text-sm text-orange-100">Tổng số lượng</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Low Stock & Out of Stock */}
              <div className="space-y-4">
                {/* Low Stock Alert */}
                {inventoryData?.lowStockProducts?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-red-600">⚠️ Sản phẩm sắp hết hàng</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {inventoryData.lowStockProducts.map((product: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg hover:shadow-sm transition-all">
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">{product.name}</h4>
                              <p className="text-xs text-gray-600">
                                Cảnh báo khi &lt; {product.minStockAlert} {product.unit}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-red-600 text-sm">
                                {product.currentStock} {product.unit}
                              </div>
                              <div className="text-xs text-red-500">Sắp hết</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Out of Stock */}
                {inventoryData?.outOfStockProducts?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-red-600">🚫 Sản phẩm hết hàng</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {inventoryData.outOfStockProducts.map((product: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-100 to-red-50 rounded-lg hover:shadow-sm transition-all">
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">{product.name}</h4>
                              <p className="text-xs text-gray-600">Cần nhập hàng ngay</p>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-red-600 text-sm">0 {product.unit}</div>
                              <div className="text-xs text-red-500">Hết hàng</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

