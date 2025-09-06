import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, MoreHorizontal, Mail, Shield, User, Edit, Trash2, Eye, Key, Lock, Unlock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/useToast'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
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
import { DataTable } from '@/components/ui/data-table'
import { authAPI } from '@/lib/api'
import { getInitials, formatDate } from '@/lib/utils'

export default function UsersPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  // State for dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  
  // Form states
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    isActive: true
  })
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'employee',
    isActive: true
  })
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => authAPI.getUsers().then(res => res.data),
  })

  const users = usersData?.users || []

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: (userData: any) => authAPI.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsCreateDialogOpen(false)
      setCreateForm({ name: '', email: '', password: '', role: 'employee', isActive: true })
      toast({
        title: "Thành công",
        description: "Tạo người dùng thành công!",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || 'Có lỗi xảy ra khi tạo người dùng',
        variant: "destructive",
      })
    }
  })

  const updateUserMutation = useMutation({
    mutationFn: ({ id, userData }: { id: string, userData: any }) => 
      authAPI.updateUser(id, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsEditDialogOpen(false)
      setSelectedUser(null)
      toast({
        title: "Thành công",
        description: "Cập nhật người dùng thành công!",
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

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => authAPI.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsDeleteDialogOpen(false)
      setSelectedUser(null)
      toast({
        title: "Thành công",
        description: "Xóa người dùng thành công!",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || 'Có lỗi xảy ra khi xóa người dùng',
        variant: "destructive",
      })
    }
  })

  const toggleUserStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string, isActive: boolean }) => 
      authAPI.updateUser(id, { isActive }),
    onSuccess: () => {
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
      setSelectedUser(null)
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

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Người dùng",
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" alt={row.getValue("name")} />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              {getInitials(row.getValue("name"))}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.getValue("name")}</div>
            <div className="text-sm text-gray-500">{row.original.email}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="flex items-center text-gray-600">
          <Mail className="w-4 h-4 mr-2" />
          {row.getValue("email")}
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Vai trò",
      cell: ({ row }) => (
        <Badge variant={row.getValue("role") === 'admin' ? 'default' : 'secondary'}>
          <Shield className="w-3 h-3 mr-1" />
          {row.getValue("role") === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
        </Badge>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Trạng thái",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive")
        return (
          <Badge variant={isActive ? "default" : "destructive"}>
            {isActive ? "Hoạt động" : "Tạm khóa"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => (
        <div className="flex items-center text-gray-600">
          <User className="w-4 h-4 mr-2" />
          {formatDate(row.getValue("createdAt"))}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const user = row.original
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
                setSelectedUser(user)
                navigate(`/users/${user._id}`)
              }}>
                <Eye className="mr-2 h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedUser(user)
                setEditForm({
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  isActive: user.isActive
                })
                setIsEditDialogOpen(true)
              }}>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedUser(user)
                setIsChangePasswordDialogOpen(true)
              }}>
                <Key className="mr-2 h-4 w-4" />
                Đổi mật khẩu
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                toggleUserStatusMutation.mutate({
                  id: user._id,
                  isActive: !user.isActive
                })
              }}>
                {user.isActive ? (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Tạm khóa
                  </>
                ) : (
                  <>
                    <Unlock className="mr-2 h-4 w-4" />
                    Kích hoạt
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => {
                  setSelectedUser(user)
                  setIsDeleteDialogOpen(true)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa tài khoản
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
            <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
            <p className="text-gray-600">Quản lý tài khoản và quyền truy cập</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-gray-600">Quản lý tài khoản và quyền truy cập</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm người dùng
        </Button>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={users}
            searchKey="name"
            searchPlaceholder="Tìm kiếm người dùng..."
            showColumnToggle={true}
            showPageSizeSelector={true}
            pageSizeOptions={[5, 10, 20, 30]}
            defaultPageSize={10}
          />
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tạo người dùng mới</DialogTitle>
            <DialogDescription>
              Thêm người dùng mới vào hệ thống. Điền thông tin bên dưới.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-name" className="text-right">
                Tên
              </Label>
              <Input
                id="create-name"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="col-span-3"
                placeholder="Nhập tên người dùng"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-email" className="text-right">
                Email
              </Label>
              <Input
                id="create-email"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="col-span-3"
                placeholder="Nhập email"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-password" className="text-right">
                Mật khẩu
              </Label>
              <Input
                id="create-password"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                className="col-span-3"
                placeholder="Nhập mật khẩu"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-role" className="text-right">
                Vai trò
              </Label>
              <Select
                value={createForm.role}
                onValueChange={(value) => setCreateForm({ ...createForm, role: value })}
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
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={() => createUserMutation.mutate(createForm)}
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? 'Đang tạo...' : 'Tạo người dùng'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
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
              onClick={() => selectedUser && updateUserMutation.mutate({ 
                id: selectedUser._id, 
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
              Đặt mật khẩu mới cho {selectedUser?.name}
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
                selectedUser && changePasswordMutation.mutate({ 
                  id: selectedUser._id, 
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

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa người dùng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa người dùng "{selectedUser?.name}"? 
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => selectedUser && deleteUserMutation.mutate(selectedUser._id)}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? 'Đang xóa...' : 'Xóa người dùng'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}