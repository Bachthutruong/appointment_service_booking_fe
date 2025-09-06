import axios from 'axios'

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  getMe: () => api.get('/auth/me'),
  
  getUsers: () => api.get('/auth/users'),
  
  getUser: (id: string) => api.get(`/auth/users/${id}`),
  
  createUser: (userData: any) => api.post('/auth/users', userData),
  
  updateProfile: (data: any) => api.put('/auth/profile', data),
  
  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => 
    api.put('/auth/change-password', data),
  
  changeUserPassword: (id: string, data: { newPassword: string }) => 
    api.put(`/auth/users/${id}/password`, data),
  
  updateUser: (id: string, userData: any) => api.put(`/auth/users/${id}`, userData),
  
  deleteUser: (id: string) => api.delete(`/auth/users/${id}`),
}

// Customer APIs
export const customerAPI = {
  getCustomers: (params?: any) => api.get('/customers', { params }),
  
  getCustomer: (id: string) => api.get(`/customers/${id}`),
  
  getCustomerHistory: (id: string) => api.get(`/customers/${id}/history`),
  
  createCustomer: (customerData: any) => api.post('/customers', customerData),
  
  updateCustomer: (id: string, customerData: any) => 
    api.put(`/customers/${id}`, customerData),
  
  deleteCustomer: (id: string) => api.delete(`/customers/${id}`),
  
  getCustomersByBirthMonth: (month: number) => 
    api.get(`/customers/birthday/${month}`),
}

// Service APIs
export const serviceAPI = {
  getServices: (params?: any) => api.get('/services', { params }),
  
  getService: (id: string) => api.get(`/services/${id}`),
  
  createService: (serviceData: any) => api.post('/services', serviceData),
  
  updateService: (id: string, serviceData: any) => 
    api.put(`/services/${id}`, serviceData),
  
  deleteService: (id: string) => api.delete(`/services/${id}`),
}

// Product APIs
export const productAPI = {
  getProducts: (params?: any) => api.get('/products', { params }),
  
  getProduct: (id: string) => api.get(`/products/${id}`),
  
  getProductStockHistory: (id: string, params?: any) => 
    api.get(`/products/${id}/stock-history`, { params }),
  
  getAllStockMovements: (params?: any) => 
    api.get('/products/stock-movements', { params }),
  
  createProduct: (productData: any) => api.post('/products', productData),
  
  updateProduct: (id: string, productData: any) => 
    api.put(`/products/${id}`, productData),
  
  addStock: (id: string, stockData: any) => 
    api.post(`/products/${id}/stock/add`, stockData),
  
  adjustStock: (id: string, stockData: any) => 
    api.post(`/products/${id}/stock/adjust`, stockData),
  
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
}

// Appointment APIs
export const appointmentAPI = {
  getAppointments: (params?: any) => api.get('/appointments', { params }),
  
  getAppointment: (id: string) => api.get(`/appointments/${id}`),
  
  getAppointmentsCalendar: (params?: any) => 
    api.get('/appointments/calendar', { params }),
  
  createAppointment: (appointmentData: any) => 
    api.post('/appointments', appointmentData),
  
  updateAppointment: (id: string, appointmentData: any) => 
    api.put(`/appointments/${id}`, appointmentData),
  
  deleteAppointment: (id: string) => api.delete(`/appointments/${id}`),
}

// Order APIs
export const orderAPI = {
  getOrders: (params?: any) => api.get('/orders', { params }),
  
  getOrder: (id: string) => api.get(`/orders/${id}`),
  
  createOrder: (orderData: any) => api.post('/orders', orderData),
  
  updateOrder: (id: string, orderData: any) => api.put(`/orders/${id}`, orderData),
  
  updateOrderStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),
  
  uploadOrderImages: (id: string, formData: FormData) => 
    api.post(`/orders/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  deleteOrder: (id: string) => api.delete(`/orders/${id}`),
}

// Reminder APIs
export const reminderAPI = {
  getReminders: (params?: any) => api.get('/reminders', { params }),
  
  getTodayReminders: () => api.get('/reminders/today'),
  
  getWeekReminders: () => api.get('/reminders/week'),
  
  getReminder: (id: string) => api.get(`/reminders/${id}`),
  
  createReminder: (reminderData: any) => api.post('/reminders', reminderData),
  
  createReminderFromOrder: (orderId: string, reminderData: any) => 
    api.post(`/reminders/from-order/${orderId}`, reminderData),
  
  updateReminder: (id: string, reminderData: any) => 
    api.put(`/reminders/${id}`, reminderData),
  
  completeReminder: (id: string) => api.put(`/reminders/${id}/complete`),
  
  skipReminder: (id: string) => api.put(`/reminders/${id}/skip`),
  
  deleteReminder: (id: string) => api.delete(`/reminders/${id}`),
}

// Report APIs
export const reportAPI = {
  getRevenueReport: (params?: any) => api.get('/reports/revenue', { params }),
  
  getTopSellingReport: (params?: any) => api.get('/reports/top-selling', { params }),
  
  getCustomerReport: (params?: any) => api.get('/reports/customers', { params }),
  
  getInventoryReport: () => api.get('/reports/inventory'),
  
  getDashboardOverview: () => api.get('/reports/dashboard'),
}

// Category APIs
export const categoryAPI = {
  getCategories: (params?: any) => api.get('/categories', { params }),
  
  getCategory: (id: string) => api.get(`/categories/${id}`),
  
  createCategory: (data: any) => api.post('/categories', data),
  
  updateCategory: (id: string, data: any) => api.put(`/categories/${id}`, data),
  
  deleteCategory: (id: string) => api.delete(`/categories/${id}`),
}

// Settings APIs
export const settingsAPI = {
  getSettings: () => api.get('/settings'),
  
  updateSettings: (data: any) => api.put('/settings', data),
  
  resetSettings: () => api.post('/settings/reset'),
}

export default api
