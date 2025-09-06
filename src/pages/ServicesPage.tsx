import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Clock, DollarSign, Scissors, MoreHorizontal, Edit, Trash2, Eye, Pause, Play } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable } from '@/components/ui/data-table'
import ServiceForm from '@/components/forms/ServiceForm'
import ServiceDetailModal from '@/components/modals/ServiceDetailModal'
import { serviceAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

export default function ServicesPage() {
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [showServiceDetail, setShowServiceDetail] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: servicesData, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => serviceAPI.getServices().then(res => res.data),
  })

  const services = servicesData?.services || []

  // Mutation để cập nhật trạng thái dịch vụ
  const toggleServiceStatusMutation = useMutation({
    mutationFn: (service: any) => 
      serviceAPI.updateService(service._id, { isActive: !service.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })

  // Mutation để xóa dịch vụ
  const deleteServiceMutation = useMutation({
    mutationFn: (serviceId: string) => serviceAPI.deleteService(serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })

  const handleToggleStatus = (service: any) => {
    toggleServiceStatusMutation.mutate(service)
  }

  const handleDeleteService = (service: any) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${service.name}"?`)) {
      deleteServiceMutation.mutate(service._id)
    }

    
  }

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Tên dịch vụ",
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-medium">{row.getValue("name")}</div>
            {row.original.description && (
              <div className="text-sm text-gray-500 line-clamp-1">
                {row.original.description}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: "Giá",
      cell: ({ row }) => (
        <div className="flex items-center text-green-600 font-semibold">
          <DollarSign className="w-4 h-4 mr-1" />
          {formatCurrency(row.getValue("price"))}
        </div>
      ),
    },
    {
      accessorKey: "duration",
      header: "Thời gian",
      cell: ({ row }) => (
        <div className="flex items-center text-blue-600">
          <Clock className="w-4 h-4 mr-1" />
          {row.getValue("duration")} phút
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Trạng thái",
      cell: ({ row }) => (
        <Badge variant={row.getValue("isActive") ? "default" : "secondary"}>
          {row.getValue("isActive") ? "Hoạt động" : "Tạm dừng"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const service = row.original
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
                setSelectedService(service)
                setShowServiceDetail(true)
              }}>
                <Eye className="mr-2 h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedService(service)
                setShowServiceForm(true)
              }}>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleStatus(service)}>
                {service.isActive ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Tạm dừng
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Kích hoạt
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => handleDeleteService(service)}
              >
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
            <h1 className="text-3xl font-bold text-gray-900">Quản lý dịch vụ</h1>
            <p className="text-gray-600">Quản lý các dịch vụ làm đẹp và chăm sóc</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý dịch vụ</h1>
          <p className="text-gray-600">Quản lý các dịch vụ làm đẹp và chăm sóc</p>
        </div>
        {user?.role === 'admin' && (
          <Button 
            onClick={() => setShowServiceForm(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm dịch vụ
          </Button>
        )}
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách dịch vụ</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={services}
            searchKey="name"
            searchPlaceholder="Tìm kiếm dịch vụ..."
            showColumnToggle={true}
            showPageSizeSelector={true}
            pageSizeOptions={[5, 10, 20, 30]}
            defaultPageSize={10}
          />
        </CardContent>
      </Card>

      {/* Service Form Modal */}
      <ServiceForm 
        open={showServiceForm}
        onClose={() => {
          setShowServiceForm(false)
          setSelectedService(null)
        }}
        service={selectedService}
        onSuccess={() => {
          setShowServiceForm(false)
          setSelectedService(null)
        }}
      />

      {/* Service Detail Modal */}
      <ServiceDetailModal
        open={showServiceDetail}
        onClose={() => {
          setShowServiceDetail(false)
          setSelectedService(null)
        }}
        service={selectedService}
        onEdit={(service) => {
          setSelectedService(service)
          setShowServiceDetail(false)
          setShowServiceForm(true)
        }}
        onDelete={handleDeleteService}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  )
}
