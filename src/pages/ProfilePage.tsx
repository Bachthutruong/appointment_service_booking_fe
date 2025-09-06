import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { User, Mail, Phone, MapPin, Calendar, Shield, Save, Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/hooks/useToast'
import { formatDate } from '@/lib/utils'

interface ProfileFormData {
  name: string
  email: string
  phone?: string
  address?: string
}

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [showPassword, setShowPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)

  const profileForm = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    }
  })

  const passwordForm = useForm<PasswordFormData>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => authAPI.updateProfile(data),
    onSuccess: (response) => {
      setUser(response.data.user)
      queryClient.invalidateQueries({ queryKey: ['user'] })
      toast({
        title: 'Thành công',
        description: 'Cập nhật thông tin cá nhân thành công',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin',
        variant: 'destructive',
      })
    }
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: PasswordFormData) => authAPI.changePassword(data),
    onSuccess: () => {
      passwordForm.reset()
      toast({
        title: 'Thành công',
        description: 'Đổi mật khẩu thành công',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu',
        variant: 'destructive',
      })
    }
  })

  const onProfileSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data)
  }

  const onPasswordSubmit = (data: PasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({
        title: 'Lỗi',
        description: 'Mật khẩu mới và xác nhận mật khẩu không khớp',
        variant: 'destructive',
      })
      return
    }
    changePasswordMutation.mutate(data)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Thông tin cá nhân</h1>
        <p className="text-gray-600">Quản lý thông tin tài khoản và cài đặt bảo mật</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="" alt={user?.name} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">{user?.name}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
              <div className="flex justify-center mt-2">
                <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'}>
                  <Shield className="w-3 h-3 mr-1" />
                  {user?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Tham gia: {formatDate(user?.createdAt) || '-'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{user?.email}</span>
                </div>
                {user?.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user?.address && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{user.address}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Thông tin cá nhân
              </CardTitle>
              <CardDescription>
                Cập nhật thông tin cá nhân của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Họ và tên *</Label>
                    <Input
                      id="name"
                      {...profileForm.register('name', { required: 'Vui lòng nhập họ và tên' })}
                      placeholder="Nhập họ và tên"
                    />
                    {profileForm.formState.errors.name && (
                      <p className="text-sm text-red-500">{profileForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...profileForm.register('email', { 
                        required: 'Vui lòng nhập email',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Email không hợp lệ'
                        }
                      })}
                      placeholder="Nhập email"
                    />
                    {profileForm.formState.errors.email && (
                      <p className="text-sm text-red-500">{profileForm.formState.errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      {...profileForm.register('phone')}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Địa chỉ</Label>
                    <Input
                      id="address"
                      {...profileForm.register('address')}
                      placeholder="Nhập địa chỉ"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={updateProfileMutation.isPending}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateProfileMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Separator />

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Đổi mật khẩu
              </CardTitle>
              <CardDescription>
                Thay đổi mật khẩu để bảo mật tài khoản
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mật khẩu hiện tại *</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      {...passwordForm.register('currentPassword', { required: 'Vui lòng nhập mật khẩu hiện tại' })}
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Mật khẩu mới *</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        {...passwordForm.register('newPassword', { 
                          required: 'Vui lòng nhập mật khẩu mới',
                          minLength: {
                            value: 6,
                            message: 'Mật khẩu phải có ít nhất 6 ký tự'
                          }
                        })}
                        placeholder="Nhập mật khẩu mới"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-sm text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...passwordForm.register('confirmPassword', { required: 'Vui lòng xác nhận mật khẩu' })}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={changePasswordMutation.isPending}
                  variant="outline"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {changePasswordMutation.isPending ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
