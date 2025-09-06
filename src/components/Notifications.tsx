import { useState } from 'react'
import { Bell, X, Check, AlertCircle, Info, Calendar, Package, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { formatDateTime } from '@/lib/utils'

interface Notification {
  id: string
  type: 'info' | 'warning' | 'success' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
  category: 'appointment' | 'order' | 'inventory' | 'system'
}

interface NotificationsProps {
  open: boolean
  onClose: () => void
}

export default function Notifications({ open, onClose }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'info',
      title: 'Lịch hẹn mới',
      message: 'Khách hàng Nguyễn Văn A đã đặt lịch hẹn vào 14:00 ngày mai',
      timestamp: new Date().toISOString(),
      read: false,
      category: 'appointment'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Sản phẩm sắp hết',
      message: 'Kem dưỡng ẩm chỉ còn 5 sản phẩm trong kho',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      category: 'inventory'
    },
    {
      id: '3',
      type: 'success',
      title: 'Đơn hàng hoàn thành',
      message: 'Đơn hàng #12345 đã được thanh toán thành công',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      read: true,
      category: 'order'
    },
    {
      id: '4',
      type: 'error',
      title: 'Lỗi hệ thống',
      message: 'Không thể kết nối đến máy chủ email',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      read: true,
      category: 'system'
    },
    {
      id: '5',
      type: 'info',
      title: 'Khách hàng mới',
      message: 'Có 3 khách hàng mới đăng ký trong ngày',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      read: true,
      category: 'system'
    }
  ])

  const getNotificationIcon = (type: string, category: string) => {
    if (category === 'appointment') return <Calendar className="w-4 h-4" />
    if (category === 'order') return <Package className="w-4 h-4" />
    if (category === 'inventory') return <Package className="w-4 h-4" />
    if (category === 'system') return <User className="w-4 h-4" />
    
    switch (type) {
      case 'success': return <Check className="w-4 h-4" />
      case 'warning': return <AlertCircle className="w-4 h-4" />
      case 'error': return <X className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'appointment': return 'bg-purple-100 text-purple-800'
      case 'order': return 'bg-green-100 text-green-800'
      case 'inventory': return 'bg-orange-100 text-orange-800'
      case 'system': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'appointment': return 'Lịch hẹn'
      case 'order': return 'Đơn hàng'
      case 'inventory': return 'Tồn kho'
      case 'system': return 'Hệ thống'
      default: return 'Khác'
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Notifications Panel */}
      <Card className="w-96 max-h-[80vh] shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-purple-500" />
              <CardTitle className="text-lg">Thông báo</CardTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Đọc tất cả
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            {notifications.length > 0 ? (
              <div className="space-y-1">
                {notifications.map((notification, index) => (
                  <div key={notification.id}>
                    <div
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type, notification.category)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className={`text-sm font-medium ${
                                  !notification.read ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                  {notification.title}
                                </h4>
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs ${getCategoryColor(notification.category)}`}
                                >
                                  {getCategoryText(notification.category)}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDateTime(notification.timestamp)}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-1 ml-2">
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteNotification(notification.id)
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < notifications.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Không có thông báo
                </h3>
                <p className="text-gray-600">
                  Bạn sẽ nhận được thông báo mới ở đây
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
