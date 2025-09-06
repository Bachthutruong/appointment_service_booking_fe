import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, isValid } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0 ₫'
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return '-'
    return format(dateObj, 'dd/MM/yyyy')
  } catch (error) {
    console.warn('Invalid date format:', date, error)
    return '-'
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-'
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return '-'
    return format(dateObj, 'dd/MM/yyyy HH:mm')
  } catch (error) {
    console.warn('Invalid date format:', date, error)
    return '-'
  }
}

export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return '-'
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return '-'
    return format(dateObj, 'HH:mm')
  } catch (error) {
    console.warn('Invalid date format:', date, error)
    return '-'
  }
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'booked': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'skipped': 'bg-gray-100 text-gray-800',
    'active': 'bg-green-100 text-green-800',
    'inactive': 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

