import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Package, TrendingUp, TrendingDown, User, FileText } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/ui/data-table'
import { productAPI } from '@/lib/api'
import { formatDate } from '@/lib/utils'

export default function InventoryPage() {
  const [selectedProduct, setSelectedProduct] = useState<string>('all')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [movementType, setMovementType] = useState<string>('all')

  // Fetch products for filter
  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: () => productAPI.getProducts().then(res => res.data),
  })

  // Fetch stock movements
  const { data: movementsData, isLoading } = useQuery({
    queryKey: ['stock-movements', selectedProduct, dateRange, movementType],
    queryFn: () => productAPI.getAllStockMovements({
      productId: selectedProduct === 'all' ? undefined : selectedProduct,
      type: movementType === 'all' ? undefined : movementType,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      limit: 50
    }).then(res => res.data),
  })

  const products = productsData?.products || []
  const movements = movementsData?.movements || []

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in': return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'out': return <TrendingDown className="w-4 h-4 text-red-500" />
      case 'adjustment': return <Package className="w-4 h-4 text-orange-500" />
      default: return <Package className="w-4 h-4 text-gray-500" />
    }
  }


  const getMovementText = (type: string) => {
    switch (type) {
      case 'in': return 'Nhập kho'
      case 'out': return 'Xuất kho'
      case 'adjustment': return 'Điều chỉnh'
      default: return 'Khác'
    }
  }

  // Define columns for DataTable
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "product",
      header: "Sản phẩm",
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-medium">{row.original.product?.name}</div>
            <div className="text-sm text-gray-500">{row.original.product?.unit}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Loại giao dịch",
      cell: ({ row }) => {
        const type = row.getValue("type") as string
        return (
          <div className="flex items-center space-x-2">
            {getMovementIcon(type)}
            <Badge className={
              type === 'in' ? 'bg-green-100 text-green-800' :
              type === 'out' ? 'bg-red-100 text-red-800' :
              'bg-orange-100 text-orange-800'
            }>
              {getMovementText(type)}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "quantity",
      header: "Số lượng",
      cell: ({ row }) => {
        const quantity = row.getValue("quantity") as number
        const type = row.original.type
        return (
          <div className={`text-right font-semibold ${
            type === 'in' ? 'text-green-600' :
            type === 'out' ? 'text-red-600' :
            'text-orange-600'
          }`}>
            {quantity > 0 ? '+' : ''}{quantity}
          </div>
        )
      },
    },
    {
      accessorKey: "reason",
      header: "Lý do",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.getValue("reason")}>
          {row.getValue("reason")}
        </div>
      ),
    },
    {
      accessorKey: "createdBy",
      header: "Người thực hiện",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{row.original.createdBy?.name || 'N/A'}</span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Thời gian",
      cell: ({ row }) => (
        <div className="text-sm">
          <div>{formatDate(row.getValue("createdAt"))}</div>
          <div className="text-gray-500">
            {new Date(row.getValue("createdAt")).toLocaleTimeString('vi-VN')}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "notes",
      header: "Ghi chú",
      cell: ({ row }) => {
        const notes = row.getValue("notes") as string
        return notes ? (
          <div className="flex items-center space-x-1">
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 max-w-[150px] truncate" title={notes}>
              {notes}
            </span>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        )
      },
    },
    {
      accessorKey: "orderId",
      header: "Đơn hàng",
      cell: ({ row }) => {
        const orderId = row.original.orderId
        return orderId ? (
          <Badge variant="outline" className="text-xs">
            #{orderId.slice(-8).toUpperCase()}
          </Badge>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lịch sử tồn kho</h1>
          <p className="text-gray-600">Theo dõi chi tiết các giao dịch nhập/xuất kho</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Product Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sản phẩm</label>
              <Select onValueChange={setSelectedProduct} value={selectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả sản phẩm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả sản phẩm</SelectItem>
                  {products.map((product: any) => (
                    <SelectItem key={product._id} value={product._id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Loại giao dịch</label>
              <Select onValueChange={setMovementType} value={movementType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="in">Nhập kho</SelectItem>
                  <SelectItem value="out">Xuất kho</SelectItem>
                  <SelectItem value="adjustment">Điều chỉnh</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Từ ngày</label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Đến ngày</label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Movements Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2 text-blue-500" />
            Lịch sử giao dịch ({movements.length})
          </CardTitle>
          <CardDescription>
            {selectedProduct !== 'all'
              ? `Lịch sử của sản phẩm: ${products.find((p: any) => p._id === selectedProduct)?.name}`
              : 'Tất cả giao dịch nhập/xuất kho'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
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
          ) : movements.length > 0 ? (
            <DataTable 
              columns={columns} 
              data={movements}
              searchKey="reason"
              searchPlaceholder="Tìm kiếm theo lý do..."
            />
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không có giao dịch nào
              </h3>
              <p className="text-gray-600">
                {selectedProduct !== 'all'
                  ? 'Sản phẩm này chưa có giao dịch nào trong khoảng thời gian được chọn'
                  : 'Chưa có giao dịch nào trong khoảng thời gian được chọn'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {movements.filter((m: any) => m.type === 'in').length}
            </div>
            <div className="text-sm text-gray-600">Lần nhập kho</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingDown className="w-8 h-8 mx-auto text-red-500 mb-2" />
            <div className="text-2xl font-bold text-red-600">
              {movements.filter((m: any) => m.type === 'out').length}
            </div>
            <div className="text-sm text-gray-600">Lần xuất kho</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="w-8 h-8 mx-auto text-orange-500 mb-2" />
            <div className="text-2xl font-bold text-orange-600">
              {movements.filter((m: any) => m.type === 'adjustment').length}
            </div>
            <div className="text-sm text-gray-600">Lần điều chỉnh</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
