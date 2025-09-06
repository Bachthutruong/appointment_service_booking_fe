import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './store/authStore'
import { Toaster } from './components/ui/toaster'

// Pages
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CustomersPage from './pages/CustomersPage'
import ServicesPage from './pages/ServicesPage'
import ProductsPage from './pages/ProductsPage'
import CategoriesPage from './pages/CategoriesPage'
import AppointmentsPage from './pages/AppointmentsPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import OrderEditPage from './pages/OrderEditPage'
import OrderCreatePage from './pages/OrderCreatePage'
import RemindersPage from './pages/RemindersPage'
import ReportsPage from './pages/ReportsPage'
import UsersPage from './pages/UsersPage'
import UserDetailPage from './pages/UserDetailPage'
import InventoryPage from './pages/InventoryPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'

// Layout
import Layout from './components/layout/Layout'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }
  
  return <>{children}</>
}

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route 
              path="/login" 
              element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
              } 
            />
            
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="categories" element={<AdminRoute><CategoriesPage /></AdminRoute>} />
              <Route path="inventory" element={<AdminRoute><InventoryPage /></AdminRoute>} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/new" element={<OrderCreatePage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />
              <Route path="orders/:id/edit" element={<OrderEditPage />} />
              <Route path="reminders" element={<RemindersPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              
              {/* Admin only routes */}
              <Route path="reports" element={<AdminRoute><ReportsPage /></AdminRoute>} />
              <Route path="users" element={<AdminRoute><UsersPage /></AdminRoute>} />
              <Route path="users/:id" element={<AdminRoute><UserDetailPage /></AdminRoute>} />
            </Route>
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App
