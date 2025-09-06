import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, MoreHorizontal, Phone, Mail, Calendar, Users, Edit, Trash2, Eye } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable } from '@/components/ui/data-table'
import CustomerForm from '@/components/forms/CustomerForm'
import CustomerDetailModal from '@/components/modals/CustomerDetailModal'
import { customerAPI } from '@/lib/api'
import { formatDate, getInitials } from '@/lib/utils'

// Type definitions
interface Customer {
  _id: string
  name: string
  phone: string
  email?: string
  totalOrders?: number
  totalAppointments?: number
  createdAt: string
}

export default function CustomersPage() {
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [showCustomerDetail, setShowCustomerDetail] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const { data: customersData, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerAPI.getCustomers().then(res => res.data),
  })

  const customers = customersData?.customers || []

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "name",
      header: "Khách hàng",
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" alt={row.getValue("name")} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
              {getInitials(row.getValue("name"))}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.getValue("name")}</div>
            {row.original.email && (
              <div className="text-sm text-gray-500">{row.original.email}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Số điện thoại",
      cell: ({ row }) => (
        <div className="flex items-center text-blue-600">
          <Phone className="w-4 h-4 mr-2" />
          {row.getValue("phone")}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="flex items-center text-gray-600">
          <Mail className="w-4 h-4 mr-2" />
          {row.getValue("email") || '-'}
        </div>
      ),
    },
    {
      accessorKey: "totalOrders",
      header: "Đơn hàng",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-2 text-green-600" />
          <span className="font-medium">{row.original.totalOrders || 0}</span>
        </div>
      ),
    },
    {
      accessorKey: "totalAppointments",
      header: "Lịch hẹn",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-blue-600" />
          <span className="font-medium">{row.original.totalAppointments || 0}</span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tham gia",
      cell: ({ row }) => (
        <div className="flex items-center text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          {formatDate(row.getValue("createdAt"))}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const customer = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                setSelectedCustomer(customer)
                setShowCustomerDetail(true)
              }}>
                <Eye className="mr-2 h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedCustomer(customer)
                setShowCustomerForm(true)
              }}>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý khách hàng</h1>
            <p className="text-gray-600">Quản lý thông tin và lịch sử khách hàng</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý khách hàng</h1>
          <p className="text-gray-600">Quản lý thông tin và lịch sử khách hàng</p>
        </div>
        <Button 
          onClick={() => setShowCustomerForm(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm khách hàng
        </Button>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách khách hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={customers}
            searchKey="name"
            searchPlaceholder="Tìm kiếm khách hàng..."
            showColumnToggle={true}
            showPageSizeSelector={true}
            pageSizeOptions={[5, 10, 20, 30]}
            defaultPageSize={10}
          />
        </CardContent>
      </Card>

      {/* Customer Forms */}
      <CustomerForm 
        open={showCustomerForm}
        onClose={() => {
          setShowCustomerForm(false)
          setSelectedCustomer(null)
        }}
        customer={selectedCustomer}
        onSuccess={() => {
          setShowCustomerForm(false)
          setSelectedCustomer(null)
        }}
      />

      <CustomerDetailModal 
        open={showCustomerDetail}
        onClose={() => {
          setShowCustomerDetail(false)
          setSelectedCustomer(null)
        }}
        customer={selectedCustomer}
        onEdit={() => {
          setShowCustomerDetail(false)
          setShowCustomerForm(true)
        }}
      />
    </div>
  )
}