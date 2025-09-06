import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Edit, Key, Lock, Unlock, Mail, Shield, User, Calendar, Phone, MapPin } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { authAPI } from '@/lib/api'
import { getInitials, formatDate } from '@/lib/utils'

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // State for dialogs
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false)
  
  // Form states
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'employee',
    isActive: true,
    phone: '',
    address: ''
  })
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  // Fetch user details
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => authAPI.getUser(id!).then(res => res.data),
    enabled: !!id,
  })

  const user = userData?.user

  // Mutations
  const updateUserMutation = useMutation({
    mutationFn: ({ id, userData }: { id: string, userData: any }) => 
      authAPI.updateUser(id, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', id] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsEditDialogOpen(false)
      toast({
        title: "Thành công",
        description: "Cập nhật thông tin người dùng thành công!",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật người dùng',
        variant: "destructive",
      })
    }
  })

  const toggleUserStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string, isActive: boolean }) => 
      authAPI.updateUser(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', id] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast({
        title: "Thành công",
        description: "Cập nhật trạng thái người dùng thành công!",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái',
        variant: "destructive",
      })
    }
  })

  const changePasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: string, password: string }) => 
      authAPI.changeUserPassword(id, { newPassword: password }),
    onSuccess: () => {
      setIsChangePasswordDialogOpen(false)
      setPasswordForm({ newPassword: '', confirmPassword: '' })
      toast({
        title: "Thành công",
        description: "Đổi mật khẩu thành công!",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu',
        variant: "destructive",
      })
    }
  })

  const handleEdit = () => {
    if (user) {
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'employee',
        isActive: user.isActive !== false,
        phone: user.phone || '',
        address: user.address || ''
      })
      setIsEditDialogOpen(true)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/users')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-red-500 mb-4">
              <User className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không tìm thấy người dùng
            </h3>
            <p className="text-gray-600 mb-4">
              Người dùng này không tồn tại hoặc đã bị xóa.
            </p>
            <Button onClick={() => navigate('/users')}>
              Quay lại danh sách
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/users')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" alt={user.name} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsChangePasswordDialogOpen(true)}
          >
            <Key className="w-4 h-4 mr-2" />
            Đổi mật khẩu
          </Button>
          <Button
            variant={user.isActive ? "destructive" : "default"}
            onClick={() => toggleUserStatusMutation.mutate({
              id: user._id,
              isActive: !user.isActive
            })}
            disabled={toggleUserStatusMutation.isPending}
          >
            {user.isActive ? (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Khóa tài khoản
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 mr-2" />
                Mở khóa tài khoản
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Họ và tên</p>
                  <p className="font-medium">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              {user.phone && (
                <div className="flex items-center space-x-4">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Số điện thoại</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                </div>
              )}
              {user.address && (
                <div className="flex items-center space-x-4">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Địa chỉ</p>
                    <p className="font-medium">{user.address}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin tài khoản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Shield className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Vai trò</p>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-5 h-5 text-gray-500">
                  {user.isActive ? (
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  ) : (
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? "Hoạt động" : "Tạm khóa"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Ngày tạo</p>
                  <p className="font-medium">{formatDate(user.createdAt)}</p>
                </div>
              </div>
              {user.updatedAt && (
                <div className="flex items-center space-x-4">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Cập nhật lần cuối</p>
                    <p className="font-medium">{formatDate(user.updatedAt)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {user.role === 'admin' ? 'Admin' : 'User'}
                </div>
                <div className="text-sm text-blue-700">Loại tài khoản</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {user.isActive ? 'Online' : 'Offline'}
                </div>
                <div className="text-sm text-green-700">Trạng thái</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin người dùng. Thay đổi sẽ được áp dụng ngay lập tức.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Tên
              </Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right">
                SĐT
              </Label>
              <Input
                id="edit-phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="col-span-3"
                placeholder="Nhập số điện thoại"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-address" className="text-right">
                Địa chỉ
              </Label>
              <Input
                id="edit-address"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                className="col-span-3"
                placeholder="Nhập địa chỉ"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">
                Vai trò
              </Label>
              <Select
                value={editForm.role}
                onValueChange={(value) => setEditForm({ ...editForm, role: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Quản trị viên</SelectItem>
                  <SelectItem value="employee">Nhân viên</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Trạng thái
              </Label>
              <Select
                value={editForm.isActive.toString()}
                onValueChange={(value) => setEditForm({ ...editForm, isActive: value === 'true' })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Hoạt động</SelectItem>
                  <SelectItem value="false">Tạm khóa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={() => updateUserMutation.mutate({ 
                id: user._id, 
                userData: editForm 
              })}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Đổi mật khẩu</DialogTitle>
            <DialogDescription>
              Đặt mật khẩu mới cho {user.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-password" className="text-right">
                Mật khẩu mới
              </Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="col-span-3"
                placeholder="Nhập mật khẩu mới"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="confirm-password" className="text-right">
                Xác nhận
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="col-span-3"
                placeholder="Xác nhận mật khẩu mới"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsChangePasswordDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                  toast({
                    title: "Lỗi",
                    description: "Mật khẩu xác nhận không khớp!",
                    variant: "destructive",
                  })
                  return
                }
                if (passwordForm.newPassword.length < 6) {
                  toast({
                    title: "Lỗi",
                    description: "Mật khẩu phải có ít nhất 6 ký tự!",
                    variant: "destructive",
                  })
                  return
                }
                changePasswordMutation.mutate({ 
                  id: user._id, 
                  password: passwordForm.newPassword 
                })
              }}
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? 'Đang đổi...' : 'Đổi mật khẩu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
