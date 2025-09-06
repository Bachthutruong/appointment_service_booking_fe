import { Clock, DollarSign, Scissors, Edit, Trash2, Play, Pause } from 'lucide-react'

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

interface ServiceDetailModalProps {
  open: boolean
  onClose: () => void
  service: any
  onEdit?: (service: any) => void
  onDelete?: (service: any) => void
  onToggleStatus?: (service: any) => void
}

export default function ServiceDetailModal({
  open,
  onClose,
  service,
  onEdit,
  onDelete,
  onToggleStatus
}: ServiceDetailModalProps) {
  if (!service) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
              <Scissors className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{service.name}</h2>
              <p className="text-gray-600">Chi tiết dịch vụ</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Thông tin dịch vụ</span>
                <Badge variant={service.isActive ? "default" : "secondary"}>
                  {service.isActive ? "Hoạt động" : "Tạm dừng"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Tên dịch vụ</label>
                <p className="text-lg font-semibold">{service.name}</p>
              </div>
              
              {service.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Mô tả</label>
                  <p className="text-gray-800">{service.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Giá dịch vụ</label>
                  <div className="flex items-center text-green-600 font-semibold text-lg">
                    <DollarSign className="w-5 h-5 mr-2" />
                    {formatCurrency(service.price)}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Thời gian thực hiện</label>
                  <div className="flex items-center text-blue-600 font-semibold text-lg">
                    <Clock className="w-5 h-5 mr-2" />
                    {service.duration} phút
                  </div>
                </div>
              </div>

              {service.category && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Danh mục</label>
                  <Badge variant="outline" className="mt-1">
                    {service.category}
                  </Badge>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Ngày tạo</label>
                  <p className="text-gray-800">{formatDate(service.createdAt)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Cập nhật lần cuối</label>
                  <p className="text-gray-800">{formatDate(service.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Thống kê</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {service.totalBookings || 0}
                  </div>
                  <div className="text-sm text-gray-600">Lượt đặt lịch</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(service.totalRevenue || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Doanh thu</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {service.averageRating || 0}/5
                  </div>
                  <div className="text-sm text-gray-600">Đánh giá TB</div>
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
                variant={service.isActive ? "destructive" : "default"}
                onClick={() => onToggleStatus(service)}
              >
                {service.isActive ? (
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
              <Button onClick={() => onEdit(service)}>
                <Edit className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </Button>
            )}
            
            {onDelete && (
              <Button variant="destructive" onClick={() => onDelete(service)}>
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
