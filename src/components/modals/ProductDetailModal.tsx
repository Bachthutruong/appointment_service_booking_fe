import { Package, Edit, Trash2, Play, Pause, DollarSign, AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ProductDetailModalProps {
  open: boolean
  onClose: () => void
  product: any
  onEdit?: (product: any) => void
  onDelete?: (product: any) => void
  onToggleStatus?: (product: any) => void
}

export default function ProductDetailModal({
  open,
  onClose,
  product,
  onEdit,
  onDelete,
  onToggleStatus
}: ProductDetailModalProps) {
  if (!product) return null

  const getStockStatus = (currentStock: number, minStock: number) => {
    if (currentStock === 0) return { status: 'out', color: 'bg-red-100 text-red-800', text: 'Hết hàng' }
    if (currentStock <= minStock) return { status: 'low', color: 'bg-yellow-100 text-yellow-800', text: 'Sắp hết' }
    return { status: 'good', color: 'bg-green-100 text-green-800', text: 'Còn hàng' }
  }

  const stockStatus = getStockStatus(product.currentStock || 0, product.minStockAlert || 0)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{product.name}</h2>
              <p className="text-gray-600">Chi tiết sản phẩm</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Thông tin sản phẩm</span>
                <Badge variant={product.isActive ? "default" : "secondary"}>
                  {product.isActive ? "Hoạt động" : "Tạm dừng"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Tên sản phẩm</label>
                <p className="text-lg font-semibold">{product.name}</p>
              </div>
              
              {product.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Mô tả</label>
                  <p className="text-gray-800">{product.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Giá bán</label>
                  <div className="flex items-center text-green-600 font-semibold text-lg">
                    <DollarSign className="w-5 h-5 mr-2" />
                    {formatCurrency(product.price)}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Danh mục</label>
                  <Badge variant="outline" className="mt-1">
                    {product.category || 'Chưa phân loại'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Ngày tạo</label>
                  <p className="text-gray-800">{formatDate(product.createdAt)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Cập nhật lần cuối</label>
                  <p className="text-gray-800">{formatDate(product.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Thông tin tồn kho
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {product.currentStock || 0} {product.unit}
                  </div>
                  <div className="text-sm text-gray-600">Tồn kho hiện tại</div>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {product.minStockAlert || 0} {product.unit}
                  </div>
                  <div className="text-sm text-gray-600">Cảnh báo tối thiểu</div>
                </div>
                
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: stockStatus.color.replace('text-', 'bg-').replace('800', '50') }}>
                  <div className="text-2xl font-bold" style={{ color: stockStatus.color.replace('bg-', 'text-').replace('100', '600') }}>
                    {stockStatus.text}
                  </div>
                  <div className="text-sm text-gray-600">Trạng thái</div>
                </div>
              </div>

              {product.currentStock <= product.minStockAlert && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="text-yellow-800 text-sm">
                    Sản phẩm sắp hết hàng! Cần nhập thêm.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Thống kê</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {product.totalSold || 0}
                  </div>
                  <div className="text-sm text-gray-600">Đã bán</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(product.totalRevenue || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Doanh thu</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {product.totalImports || 0}
                  </div>
                  <div className="text-sm text-gray-600">Lần nhập kho</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
            
            {onToggleStatus && (
              <Button
                variant={product.isActive ? "destructive" : "default"}
                onClick={() => onToggleStatus(product)}
              >
                {product.isActive ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Tạm dừng
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Kích hoạt
                  </>
                )}
              </Button>
            )}
            
            {onEdit && (
              <Button onClick={() => onEdit(product)}>
                <Edit className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </Button>
            )}
            
            {onDelete && (
              <Button variant="destructive" onClick={() => onDelete(product)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
