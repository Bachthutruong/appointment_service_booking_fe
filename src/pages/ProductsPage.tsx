import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Package, TrendingUp, MoreHorizontal, Edit, Trash2, Eye, PackagePlus, Pause, Play, Tag } from 'lucide-react'

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
import ProductForm from '@/components/forms/ProductForm'
import StockForm from '@/components/forms/StockForm'
import CategoryForm from '@/components/forms/CategoryForm'
import ProductDetailModal from '@/components/modals/ProductDetailModal'
import { productAPI, categoryAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

export default function ProductsPage() {
  const [showProductForm, setShowProductForm] = useState(false)
  const [showProductDetail, setShowProductDetail] = useState(false)
  const [showStockForm, setShowStockForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showCategoryManagement, setShowCategoryManagement] = useState(false)
  const [stockFormType, setStockFormType] = useState<'add' | 'adjust'>('add')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productAPI.getProducts().then(res => res.data),
  })

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getCategories().then(res => res.data),
  })

  const products = productsData?.products || []
  const categories = categoriesData?.categories || []

  // Mutation để cập nhật trạng thái sản phẩm
  const toggleProductStatusMutation = useMutation({
    mutationFn: (product: any) => 
      productAPI.updateProduct(product._id, { isActive: !product.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  // Mutation để xóa sản phẩm
  const deleteProductMutation = useMutation({
    mutationFn: (productId: string) => productAPI.deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  // Mutation để xóa danh mục
  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId: string) => categoryAPI.deleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  const handleToggleStatus = (product: any) => {
    toggleProductStatusMutation.mutate(product)
  }

  const handleDeleteProduct = (product: any) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`)) {
      deleteProductMutation.mutate(product._id)
    }
  }

  const handleDeleteCategory = (category: any) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`)) {
      deleteCategoryMutation.mutate(category._id)
    }
  }

  const handleCreateCategory = () => {
    setSelectedCategory(null)
    setShowCategoryForm(true)
  }

  const handleEditCategory = (category: any) => {
    setSelectedCategory(category)
    setShowCategoryForm(true)
  }

  const getStockStatus = (currentStock: number, minStock: number) => {
    if (currentStock === 0) return { status: 'out', color: 'bg-red-100 text-red-800', text: 'Hết hàng' }
    if (currentStock <= minStock) return { status: 'low', color: 'bg-yellow-100 text-yellow-800', text: 'Sắp hết' }
    return { status: 'good', color: 'bg-green-100 text-green-800', text: 'Còn hàng' }
  }

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Sản phẩm",
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
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
      accessorKey: "sellingPrice",
      header: "Giá bán",
      cell: ({ row }) => (
        <div className="font-semibold text-green-600">
          {formatCurrency(row.getValue("sellingPrice"))}
        </div>
      ),
    },
    {
      accessorKey: "costPrice",
      header: "Giá vốn",
      cell: ({ row }) => (
        <div className="font-medium text-orange-600">
          {formatCurrency(row.getValue("costPrice"))}
        </div>
      ),
    },
    {
      id: "profit",
      header: "Lợi nhuận",
      cell: ({ row }) => {
        const sellingPrice = row.getValue("sellingPrice") as number
        const costPrice = row.getValue("costPrice") as number
        const profit = sellingPrice - costPrice
        const profitMargin = ((profit / sellingPrice) * 100).toFixed(1)
        
        return (
          <div className="text-right">
            <div className="font-semibold text-blue-600">
              {formatCurrency(profit)}
            </div>
            <div className="text-xs text-gray-500">
              {profitMargin}%
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "currentStock",
      header: "Tồn kho",
      cell: ({ row }) => {
        const currentStock = row.getValue("currentStock") as number
        const minStock = row.original.minStock || 0
        const stockStatus = getStockStatus(currentStock, minStock)
        
        return (
          <div className="flex items-center space-x-2">
            <span className="font-medium">{currentStock} {row.original.unit}</span>
            <Badge className={stockStatus.color}>
              {stockStatus.text}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "category",
      header: "Danh mục",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Tag className="w-4 h-4 text-gray-500" />
          <Badge variant="outline">
            {row.original.category?.name || 'Chưa phân loại'}
          </Badge>
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
        const product = row.original
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
                setSelectedProduct(product)
                setShowProductDetail(true)
              }}>
                <Eye className="mr-2 h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedProduct(product)
                setShowProductForm(true)
              }}>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedProduct(product)
                setStockFormType('add')
                setShowStockForm(true)
              }}>
                <PackagePlus className="mr-2 h-4 w-4" />
                Nhập kho
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedProduct(product)
                setStockFormType('adjust')
                setShowStockForm(true)
              }}>
                <TrendingUp className="mr-2 h-4 w-4" />
                Điều chỉnh
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleStatus(product)}>
                {product.isActive ? (
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
                onClick={() => handleDeleteProduct(product)}
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
            <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
            <p className="text-gray-600">Quản lý sản phẩm và tồn kho</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-gray-600">Quản lý sản phẩm và tồn kho</p>
        </div>
        <div className="flex space-x-2">
          {/* <Button 
            onClick={() => setShowCategoryManagement(true)}
            variant="outline"
            className="border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            <Settings className="w-4 h-4 mr-2" />
            Quản lý danh mục
          </Button> */}
          {user?.role === 'admin' && (
            <Button 
              onClick={() => setShowProductForm(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm sản phẩm
            </Button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={products}
            searchKey="name"
            searchPlaceholder="Tìm kiếm sản phẩm..."
            showColumnToggle={true}
            showPageSizeSelector={true}
            pageSizeOptions={[5, 10, 20, 30]}
            defaultPageSize={10}
          />
        </CardContent>
      </Card>

      {/* Product Form Modal */}
      <ProductForm 
        open={showProductForm}
        onClose={() => {
          setShowProductForm(false)
          setSelectedProduct(null)
        }}
        product={selectedProduct}
        onSuccess={() => {
          setShowProductForm(false)
          setSelectedProduct(null)
        }}
      />

      {/* Stock Form Modal */}
      <StockForm 
        open={showStockForm}
        onClose={() => {
          setShowStockForm(false)
          setSelectedProduct(null)
        }}
        type={stockFormType}
        product={selectedProduct}
        onSuccess={() => {
          setShowStockForm(false)
          setSelectedProduct(null)
        }}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        open={showProductDetail}
        onClose={() => {
          setShowProductDetail(false)
          setSelectedProduct(null)
        }}
        product={selectedProduct}
        onEdit={(product) => {
          setSelectedProduct(product)
          setShowProductDetail(false)
          setShowProductForm(true)
        }}
        onDelete={handleDeleteProduct}
        onToggleStatus={handleToggleStatus}
      />

      {/* Category Management Modal */}
      <Card className={`fixed inset-0 z-50 ${showCategoryManagement ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h2>
                <p className="text-gray-600">Quản lý các danh mục sản phẩm</p>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleCreateCategory} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm danh mục
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCategoryManagement(false)}
                >
                  Đóng
                </Button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {categoriesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : categories.length > 0 ? (
                <div className="space-y-4">
                  {categories.map((category: any) => (
                    <div key={category._id} className="flex items-center space-x-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Tag className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">{category.name}</h3>
                          <Badge variant={category.isActive ? "default" : "secondary"}>
                            {category.isActive ? "Hoạt động" : "Tạm dừng"}
                          </Badge>
                        </div>
                        {category.description && (
                          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Mở menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteCategory(category)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Tag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chưa có danh mục nào
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Bắt đầu bằng cách tạo danh mục đầu tiên
                  </p>
                  <Button onClick={handleCreateCategory} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm danh mục
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Category Form Modal */}
      <CategoryForm 
        open={showCategoryForm}
        onClose={() => {
          setShowCategoryForm(false)
          setSelectedCategory(null)
        }}
        category={selectedCategory}
        onSuccess={() => {
          setShowCategoryForm(false)
          setSelectedCategory(null)
        }}
      />
    </div>
  )
}