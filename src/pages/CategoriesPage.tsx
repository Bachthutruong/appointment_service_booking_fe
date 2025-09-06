import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoryAPI } from '@/lib/api'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { CategoryForm } from '@/components/forms/CategoryForm'
import { MoreHorizontal, Edit, Trash2, Plus, Tag } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { useToast } from '@/hooks/useToast'

interface Category {
  _id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function CategoriesPage() {
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Fetch categories
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryAPI.getCategories
  })

  const categories = categoriesData?.data?.categories || []

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: categoryAPI.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast({
        title: "Thành công!",
        description: "Xóa danh mục thành công",
      })
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || 'Có lỗi xảy ra khi xóa danh mục',
      })
    }
  })

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      await deleteCategoryMutation.mutateAsync(categoryId)
    }
  }

  const handleCreateCategory = () => {
    setSelectedCategory(null)
    setShowCategoryForm(true)
  }

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category)
    setShowCategoryForm(true)
  }

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: 'name',
      header: 'Tên danh mục',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Tag className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{row.getValue('name')}</span>
        </div>
      )
    },
    {
      accessorKey: 'description',
      header: 'Mô tả',
      cell: ({ row }) => (
        <span className="text-gray-600">
          {row.getValue('description') || 'Không có mô tả'}
        </span>
      )
    },
    {
      accessorKey: 'isActive',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean
        return (
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Hoạt động' : 'Tạm dừng'}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'createdAt',
      header: 'Ngày tạo',
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'))
        return <span>{date.toLocaleDateString('vi-VN')}</span>
      }
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => {
        const category = row.original

        return (
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
                onClick={() => handleDeleteCategory(category._id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải danh mục...</p>
        </div>
      </div>
    )
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý danh mục</h1>
          <p className="text-gray-600">Quản lý các danh mục sản phẩm</p>
        </div>
        <Button onClick={handleCreateCategory} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          Thêm danh mục
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách danh mục</CardTitle>
          <CardDescription>
            Quản lý và tổ chức các danh mục sản phẩm của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={categories}
            searchKey="name"
            searchPlaceholder="Tìm kiếm danh mục..."
          />
        </CardContent>
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
