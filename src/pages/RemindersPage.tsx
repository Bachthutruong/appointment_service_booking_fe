import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Bell, Clock, CheckCircle, X, User, Calendar, Search, Filter } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/ui/data-table'
import ReminderForm from '@/components/forms/ReminderForm'
import { reminderAPI } from '@/lib/api'
import { formatDate, formatDateTime } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'

export default function RemindersPage() {
  const [activeTab, setActiveTab] = useState('pending')
  const [showReminderForm, setShowReminderForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  // const [page, setPage] = useState(1)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: pendingReminders, isLoading: loadingPending } = useQuery({
    queryKey: ['reminders', 'pending'],
    queryFn: () => reminderAPI.getReminders({ status: 'pending' }).then(res => res.data.reminders),
  })

  const { data: todayReminders, isLoading: loadingToday } = useQuery({
    queryKey: ['reminders', 'today'],
    queryFn: () => reminderAPI.getTodayReminders().then(res => res.data.reminders),
  })

  const { data: completedReminders, isLoading: loadingCompleted } = useQuery({
    queryKey: ['reminders', 'completed'],
    queryFn: () => reminderAPI.getReminders({ 
      status: 'completed,skipped',
      limit: 20 
    }).then(res => res.data.reminders),
    enabled: activeTab === 'completed'
  })

  // Complete reminder mutation
  const completeMutation = useMutation({
    mutationFn: reminderAPI.completeReminder,
    onSuccess: () => {
      toast({
        title: "Thành công!",
        description: "Đã đánh dấu nhắc nhở hoàn thành",
      })
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || "Có lỗi xảy ra",
      })
    },
  })

  // Skip reminder mutation
  const skipMutation = useMutation({
    mutationFn: reminderAPI.skipReminder,
    onSuccess: () => {
      toast({
        title: "Đã bỏ qua",
        description: "Nhắc nhở đã được bỏ qua",
      })
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || "Có lỗi xảy ra",
      })
    },
  })

  const handleCompleteReminder = (reminderId: string) => {
    completeMutation.mutate(reminderId)
  }

  const handleSkipReminder = (reminderId: string) => {
    skipMutation.mutate(reminderId)
  }

  // Columns definition for DataTable
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "customer",
      header: "Khách hàng",
      cell: ({ row }) => {
        const customer = row.getValue("customer") as any
        return (
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-500" />
            <div>
              <div className="font-medium">{customer?.name || 'N/A'}</div>
              <div className="text-sm text-gray-500">{customer?.phone || 'N/A'}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "content",
      header: "Nội dung",
      cell: ({ row }) => {
        const content = row.getValue("content") as string
        return (
          <div className="max-w-[300px]">
            <p className="text-sm text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap">{content}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "reminderDate",
      header: "Ngày nhắc nhở",
      cell: ({ row }) => {
        const date = row.getValue("reminderDate") as string
        return (
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{formatDateTime(date)}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const statusConfig = {
          pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
          completed: { label: 'Đã hoàn thành', color: 'bg-green-100 text-green-800' },
          skipped: { label: 'Đã bỏ qua', color: 'bg-gray-100 text-gray-800' },
        }
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
        return (
          <Badge className={config.color}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: "completedAt",
      header: "Ngày xử lý",
      cell: ({ row }) => {
        const completedAt = row.getValue("completedAt") as string
        return completedAt ? (
          <span className="text-sm text-gray-600">{formatDate(completedAt)}</span>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const reminder = row.original
        const status = reminder.status
        
        if (status === 'pending') {
          return (
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                onClick={() => handleCompleteReminder(reminder._id)}
                disabled={completeMutation.isPending}
                className="bg-green-500 hover:bg-green-600"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Hoàn thành
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleSkipReminder(reminder._id)}
                disabled={skipMutation.isPending}
              >
                <X className="w-4 h-4 mr-1" />
                Bỏ qua
              </Button>
            </div>
          )
        }
        
        return (
          <div className="flex items-center space-x-1">
            <Bell className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">Đã xử lý</span>
          </div>
        )
      },
    },
  ]

  // Get data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'today':
        return { data: todayReminders, loading: loadingToday }
      case 'pending':
        return { data: pendingReminders, loading: loadingPending }
      case 'completed':
        return { data: completedReminders, loading: loadingCompleted }
      default:
        return { data: [], loading: false }
    }
  }

  const { data: currentData, loading: currentLoading } = getCurrentData()

  // Filter data based on search and status
  const filteredData = currentData?.filter((reminder: any) => {
    const matchesSearch = !searchTerm || 
      reminder.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.content?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || reminder.status === statusFilter
    
    return matchesSearch && matchesStatus
  }) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nhắc nhở chăm sóc</h1>
          <p className="text-gray-600">Quản lý nhắc nhở và chăm sóc khách hàng</p>
        </div>
        <Button 
          onClick={() => setShowReminderForm(true)}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo nhắc nhở
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { value: 'today', label: 'Hôm nay', icon: Clock, count: todayReminders?.length || 0 },
          { value: 'pending', label: 'Chờ xử lý', icon: Bell, count: pendingReminders?.length || 0 },
          { value: 'completed', label: 'Đã xử lý', icon: CheckCircle, count: completedReminders?.length || 0 },
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <Badge variant="secondary" className="ml-1">
                {tab.count}
              </Badge>
            </button>
          )
        })}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Tìm kiếm theo tên khách hàng hoặc nội dung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="pending">Chờ xử lý</SelectItem>
            <SelectItem value="completed">Đã hoàn thành</SelectItem>
            <SelectItem value="skipped">Đã bỏ qua</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {activeTab === 'today' && <Clock className="w-5 h-5 mr-2 text-orange-500" />}
            {activeTab === 'pending' && <Bell className="w-5 h-5 mr-2 text-yellow-500" />}
            {activeTab === 'completed' && <CheckCircle className="w-5 h-5 mr-2 text-green-500" />}
            {activeTab === 'today' && 'Nhắc nhở hôm nay'}
            {activeTab === 'pending' && 'Nhắc nhở chờ xử lý'}
            {activeTab === 'completed' && 'Lịch sử nhắc nhở'}
            <Badge variant="secondary" className="ml-2">
              {filteredData.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            {activeTab === 'today' && 'Danh sách các nhắc nhở cần xử lý hôm nay'}
            {activeTab === 'pending' && 'Tất cả các nhắc nhở đang chờ xử lý'}
            {activeTab === 'completed' && 'Các nhắc nhở đã được xử lý gần đây'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse p-4 bg-gray-50 rounded-lg">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredData.length > 0 ? (
            <DataTable
              columns={columns}
              data={filteredData}
              searchKey="content"
              searchPlaceholder="Tìm kiếm nhắc nhở..."
            />
          ) : (
            <div className="text-center py-12">
              {activeTab === 'today' && <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />}
              {activeTab === 'pending' && <Bell className="w-12 h-12 mx-auto text-gray-400 mb-3" />}
              {activeTab === 'completed' && <CheckCircle className="w-12 h-12 mx-auto text-gray-400 mb-3" />}
              <p className="text-gray-600">
                {activeTab === 'today' && 'Không có nhắc nhở nào hôm nay! 🎉'}
                {activeTab === 'pending' && 'Không có nhắc nhở nào chờ xử lý'}
                {activeTab === 'completed' && 'Chưa có nhắc nhở nào được xử lý'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reminder Form Modal */}
      <ReminderForm 
        open={showReminderForm}
        onClose={() => setShowReminderForm(false)}
        onSuccess={() => setShowReminderForm(false)}
      />
    </div>
  )
}
