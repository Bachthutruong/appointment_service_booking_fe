import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { 
  Settings, 
  Bell, 
  Palette, 
  Globe, 
  Save, 
  Moon, 
  Sun, 
  Monitor,
  Mail,
  Smartphone,
  AlertTriangle
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
// import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/hooks/useToast'
import { settingsAPI } from '@/lib/api'

interface GeneralSettings {
  businessName: string
  businessAddress: string
  businessPhone: string
  businessEmail: string
  timezone: string
  currency: string
  language: string
}

interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  appointmentReminders: boolean
  orderNotifications: boolean
  inventoryAlerts: boolean
  reminderTime: number
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system'
  primaryColor: string
  sidebarCollapsed: boolean
  compactMode: boolean
}

export default function SettingsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // General settings form
  const generalForm = useForm<GeneralSettings>({
    defaultValues: {
      businessName: 'BeautyBook',
      businessAddress: '',
      businessPhone: '',
      businessEmail: '',
      timezone: 'Asia/Ho_Chi_Minh',
      currency: 'VND',
      language: 'vi',
    }
  })

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    orderNotifications: true,
    inventoryAlerts: true,
    reminderTime: 30,
  })

  // Appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    theme: 'system',
    primaryColor: 'purple',
    sidebarCollapsed: false,
    compactMode: false,
  })

  // Load settings from API
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsAPI.getSettings().then(res => res.data.settings),
  })

  // Update forms when settings data loads
  useEffect(() => {
    if (settingsData) {
      // Update general form
      generalForm.reset({
        businessName: settingsData.businessName || 'BeautyBook',
        businessAddress: settingsData.businessAddress || '',
        businessPhone: settingsData.businessPhone || '',
        businessEmail: settingsData.businessEmail || '',
        timezone: settingsData.timezone || 'Asia/Ho_Chi_Minh',
        currency: settingsData.currency || 'VND',
        language: settingsData.language || 'vi',
      })

      // Update notification settings
      setNotificationSettings({
        emailNotifications: settingsData.emailNotifications ?? true,
        smsNotifications: settingsData.smsNotifications ?? false,
        appointmentReminders: settingsData.appointmentReminders ?? true,
        orderNotifications: settingsData.orderNotifications ?? true,
        inventoryAlerts: settingsData.inventoryAlerts ?? true,
        reminderTime: settingsData.reminderTime ?? 30,
      })

      // Update appearance settings
      setAppearanceSettings({
        theme: settingsData.theme || 'system',
        primaryColor: settingsData.primaryColor || 'purple',
        sidebarCollapsed: settingsData.sidebarCollapsed ?? false,
        compactMode: settingsData.compactMode ?? false,
      })
    }
  }, [settingsData])

  // Save general settings mutation
  const saveGeneralMutation = useMutation({
    mutationFn: (data: GeneralSettings) => settingsAPI.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast({
        title: 'Thành công',
        description: 'Đã lưu cài đặt chung',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Có lỗi xảy ra khi lưu cài đặt',
        variant: 'destructive',
      })
    }
  })

  const onGeneralSubmit = (data: GeneralSettings) => {
    saveGeneralMutation.mutate(data)
  }

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean | number) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleAppearanceChange = (key: keyof AppearanceSettings, value: string | boolean) => {
    setAppearanceSettings(prev => ({ ...prev, [key]: value }))
  }

  // Save notification settings mutation
  const saveNotificationMutation = useMutation({
    mutationFn: (data: NotificationSettings) => settingsAPI.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast({
        title: 'Thành công',
        description: 'Đã lưu cài đặt thông báo',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Có lỗi xảy ra khi lưu cài đặt',
        variant: 'destructive',
      })
    }
  })

  // Save appearance settings mutation
  const saveAppearanceMutation = useMutation({
    mutationFn: (data: AppearanceSettings) => settingsAPI.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast({
        title: 'Thành công',
        description: 'Đã lưu cài đặt giao diện',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Có lỗi xảy ra khi lưu cài đặt',
        variant: 'destructive',
      })
    }
  })

  // Reset settings mutation
  const resetSettingsMutation = useMutation({
    mutationFn: () => settingsAPI.resetSettings(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast({
        title: 'Thành công',
        description: 'Đã reset cài đặt về mặc định',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Có lỗi xảy ra khi reset cài đặt',
        variant: 'destructive',
      })
    }
  })

  const saveNotificationSettings = () => {
    saveNotificationMutation.mutate(notificationSettings)
  }

  const saveAppearanceSettings = () => {
    saveAppearanceMutation.mutate(appearanceSettings)
  }

  // State for dialogs
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)

  const resetSettings = () => {
    setIsResetDialogOpen(true)
  }

  const confirmResetSettings = () => {
    resetSettingsMutation.mutate()
    setIsResetDialogOpen(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cài đặt hệ thống</h1>
          <p className="text-gray-600">Quản lý cài đặt và tùy chỉnh hệ thống</p>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cài đặt hệ thống</h1>
          <p className="text-gray-600">Quản lý cài đặt và tùy chỉnh hệ thống</p>
        </div>
        <Button
          variant="outline"
          onClick={resetSettings}
          disabled={resetSettingsMutation.isPending}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          {resetSettingsMutation.isPending ? 'Đang reset...' : 'Reset về mặc định'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Chung
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="w-4 h-4 mr-2" />
            Thông báo
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center">
            <Palette className="w-4 h-4 mr-2" />
            Giao diện
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Thông tin doanh nghiệp
              </CardTitle>
              <CardDescription>
                Cấu hình thông tin cơ bản của doanh nghiệp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Tên doanh nghiệp *</Label>
                    <Input
                      id="businessName"
                      {...generalForm.register('businessName', { 
                        required: 'Vui lòng nhập tên doanh nghiệp',
                        minLength: {
                          value: 2,
                          message: 'Tên doanh nghiệp phải có ít nhất 2 ký tự'
                        }
                      })}
                      placeholder="Nhập tên doanh nghiệp"
                    />
                    {generalForm.formState.errors.businessName && (
                      <p className="text-sm text-red-500 mt-1">
                        {generalForm.formState.errors.businessName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessPhone">Số điện thoại</Label>
                    <Input
                      id="businessPhone"
                      {...generalForm.register('businessPhone', {
                        pattern: {
                          value: /^[0-9+\-\s()]+$/,
                          message: 'Số điện thoại không hợp lệ'
                        }
                      })}
                      placeholder="Nhập số điện thoại"
                    />
                    {generalForm.formState.errors.businessPhone && (
                      <p className="text-sm text-red-500 mt-1">
                        {generalForm.formState.errors.businessPhone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessAddress">Địa chỉ</Label>
                  <Input
                    id="businessAddress"
                    {...generalForm.register('businessAddress')}
                    placeholder="Nhập địa chỉ doanh nghiệp"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessEmail">Email doanh nghiệp</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    {...generalForm.register('businessEmail', {
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email không hợp lệ'
                      }
                    })}
                    placeholder="Nhập email doanh nghiệp"
                  />
                  {generalForm.formState.errors.businessEmail && (
                    <p className="text-sm text-red-500 mt-1">
                      {generalForm.formState.errors.businessEmail.message}
                    </p>
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Múi giờ</Label>
                    <Select onValueChange={(value) => generalForm.setValue('timezone', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn múi giờ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">America/New_York</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Tiền tệ</Label>
                    <Select onValueChange={(value) => generalForm.setValue('currency', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn tiền tệ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VND">VND (₫)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Ngôn ngữ</Label>
                    <Select onValueChange={(value) => generalForm.setValue('language', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn ngôn ngữ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vi">Tiếng Việt</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={saveGeneralMutation.isPending}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveGeneralMutation.isPending ? 'Đang lưu...' : 'Lưu cài đặt'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Cài đặt thông báo
              </CardTitle>
              <CardDescription>
                Quản lý các loại thông báo và cách thức nhận thông báo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notification Types */}
              <div className="space-y-4">
                <h4 className="font-medium">Loại thông báo</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-blue-500" />
                      <div>
                        <Label htmlFor="emailNotifications">Thông báo qua email</Label>
                        <p className="text-sm text-gray-500">Nhận thông báo qua email</p>
                      </div>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-4 h-4 text-green-500" />
                      <div>
                        <Label htmlFor="smsNotifications">Thông báo qua SMS</Label>
                        <p className="text-sm text-gray-500">Nhận thông báo qua tin nhắn</p>
                      </div>
                    </div>
                    <Switch
                      id="smsNotifications"
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={(checked) => handleNotificationChange('smsNotifications', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Specific Notifications */}
              <div className="space-y-4">
                <h4 className="font-medium">Thông báo cụ thể</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="appointmentReminders">Nhắc nhở lịch hẹn</Label>
                      <p className="text-sm text-gray-500">Nhắc nhở khách hàng về lịch hẹn</p>
                    </div>
                    <Switch
                      id="appointmentReminders"
                      checked={notificationSettings.appointmentReminders}
                      onCheckedChange={(checked) => handleNotificationChange('appointmentReminders', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="orderNotifications">Thông báo đơn hàng</Label>
                      <p className="text-sm text-gray-500">Thông báo khi có đơn hàng mới</p>
                    </div>
                    <Switch
                      id="orderNotifications"
                      checked={notificationSettings.orderNotifications}
                      onCheckedChange={(checked) => handleNotificationChange('orderNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="inventoryAlerts">Cảnh báo tồn kho</Label>
                      <p className="text-sm text-gray-500">Thông báo khi sản phẩm sắp hết</p>
                    </div>
                    <Switch
                      id="inventoryAlerts"
                      checked={notificationSettings.inventoryAlerts}
                      onCheckedChange={(checked) => handleNotificationChange('inventoryAlerts', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Reminder Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Cài đặt nhắc nhở</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="reminderTime">Thời gian nhắc nhở trước (phút)</Label>
                  <Select 
                    value={notificationSettings.reminderTime.toString()} 
                    onValueChange={(value) => handleNotificationChange('reminderTime', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 phút</SelectItem>
                      <SelectItem value="30">30 phút</SelectItem>
                      <SelectItem value="60">1 giờ</SelectItem>
                      <SelectItem value="120">2 giờ</SelectItem>
                      <SelectItem value="1440">1 ngày</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={saveNotificationSettings}
                disabled={saveNotificationMutation.isPending}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveNotificationMutation.isPending ? 'Đang lưu...' : 'Lưu cài đặt thông báo'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Cài đặt giao diện
              </CardTitle>
              <CardDescription>
                Tùy chỉnh giao diện và trải nghiệm người dùng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Chủ đề</h4>
                
                <div className="space-y-3">
                  {[
                    { value: 'light', label: 'Chế độ sáng', icon: Sun, description: 'Giao diện sáng', color: 'text-yellow-500' },
                    { value: 'dark', label: 'Chế độ tối', icon: Moon, description: 'Giao diện tối', color: 'text-blue-500' },
                    { value: 'system', label: 'Hệ thống', icon: Monitor, description: 'Theo cài đặt hệ thống', color: 'text-gray-500' }
                  ].map((theme) => {
                    const Icon = theme.icon
                    const isSelected = appearanceSettings.theme === theme.value
                    return (
                      <div 
                        key={theme.value}
                        className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-purple-500 ring-2 ring-purple-200 bg-purple-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleAppearanceChange('theme', theme.value)}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-4 h-4 ${theme.color}`} />
                          <div>
                            <Label className="cursor-pointer">{theme.label}</Label>
                            <p className="text-sm text-gray-500">{theme.description}</p>
                          </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          isSelected ? 'bg-purple-500' : 'bg-gray-300'
                        }`}></div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <Separator />

              {/* Color Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Màu chủ đạo</h4>
                
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { name: 'Tím', value: 'purple', color: 'bg-purple-500' },
                    { name: 'Xanh', value: 'blue', color: 'bg-blue-500' },
                    { name: 'Hồng', value: 'pink', color: 'bg-pink-500' },
                    { name: 'Xanh lá', value: 'green', color: 'bg-green-500' },
                  ].map((color) => (
                    <div
                      key={color.value}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        appearanceSettings.primaryColor === color.value
                          ? 'border-purple-500 ring-2 ring-purple-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleAppearanceChange('primaryColor', color.value)}
                    >
                      <div className={`w-8 h-8 rounded-full ${color.color} mx-auto mb-2`}></div>
                      <p className="text-sm text-center">{color.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Layout Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Bố cục</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sidebarCollapsed">Thu gọn sidebar</Label>
                      <p className="text-sm text-gray-500">Thu gọn thanh điều hướng bên trái</p>
                    </div>
                    <Switch
                      id="sidebarCollapsed"
                      checked={appearanceSettings.sidebarCollapsed}
                      onCheckedChange={(checked) => handleAppearanceChange('sidebarCollapsed', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="compactMode">Chế độ compact</Label>
                      <p className="text-sm text-gray-500">Hiển thị nhiều thông tin hơn trong không gian nhỏ</p>
                    </div>
                    <Switch
                      id="compactMode"
                      checked={appearanceSettings.compactMode}
                      onCheckedChange={(checked) => handleAppearanceChange('compactMode', checked)}
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={saveAppearanceSettings}
                disabled={saveAppearanceMutation.isPending}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveAppearanceMutation.isPending ? 'Đang lưu...' : 'Lưu cài đặt giao diện'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reset Settings Confirmation Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
              Xác nhận reset cài đặt
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn reset tất cả cài đặt về mặc định? 
              Hành động này không thể hoàn tác và sẽ xóa tất cả cài đặt hiện tại.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsResetDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmResetSettings}
              disabled={resetSettingsMutation.isPending}
            >
              {resetSettingsMutation.isPending ? 'Đang reset...' : 'Reset cài đặt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
