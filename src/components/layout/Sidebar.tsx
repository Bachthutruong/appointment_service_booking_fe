import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useState } from 'react'
import {
  CalendarDays,
  Users,
  Package,
  ShoppingCart,
  Bell,
  BarChart3,
  Home,
  Scissors,
  X,
  UserCog,
  Archive,
  Tag,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, adminOnly: false },
  { name: 'Lịch hẹn', href: '/appointments', icon: CalendarDays, adminOnly: false },
  { name: 'Khách hàng', href: '/customers', icon: Users, adminOnly: false },
  { name: 'Dịch vụ', href: '/services', icon: Scissors, adminOnly: false },
  { 
    name: 'Sản phẩm', 
    href: '/products', 
    icon: Package, 
    adminOnly: false,
    children: [
      { name: 'Danh sách sản phẩm', href: '/products', icon: Package },
      { name: 'Quản lý danh mục', href: '/categories', icon: Tag, adminOnly: true }
    ]
  },
  { name: 'Tồn kho', href: '/inventory', icon: Archive, adminOnly: true },
  { name: 'Đơn hàng', href: '/orders', icon: ShoppingCart, adminOnly: false },
  { name: 'Nhắc nhở', href: '/reminders', icon: Bell, adminOnly: false },
  { name: 'Báo cáo', href: '/reports', icon: BarChart3, adminOnly: true },
  { name: 'Nhân viên', href: '/users', icon: UserCog, adminOnly: true },
]

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const location = useLocation()
  const { user } = useAuthStore()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const filteredNavigation = navigation.filter(item => 
    !item.adminOnly || user?.role === 'admin'
  )

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const isItemActive = (item: any) => {
    if (item.href === location.pathname) return true
    if (item.children) {
      return item.children.some((child: any) => child.href === location.pathname)
    }
    return false
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">BeautyBook</span>
          </div>
          
          <button
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = isItemActive(item)
              const isExpanded = expandedItems.includes(item.name)
              const hasChildren = item.children && item.children.length > 0

              if (hasChildren) {
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className={cn(
                        "group w-full flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-colors",
                        isActive
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      )}
                    >
                      <div className="flex items-center">
                        <item.icon
                          className={cn(
                            "mr-3 h-5 w-5 flex-shrink-0",
                            isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"
                          )}
                        />
                        {item.name}
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    
                    {isExpanded && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children
                          ?.filter((child: any) => !child.adminOnly || user?.role === 'admin')
                          .map((child: any) => {
                            const isChildActive = location.pathname === child.href
                            return (
                              <Link
                                key={child.name}
                                to={child.href}
                                className={cn(
                                  "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                  isChildActive
                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                )}
                                onClick={() => setOpen(false)}
                              >
                                <child.icon
                                  className={cn(
                                    "mr-3 h-4 w-4 flex-shrink-0",
                                    isChildActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                                  )}
                                />
                                {child.name}
                              </Link>
                            )
                          })}
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  onClick={() => setOpen(false)}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
