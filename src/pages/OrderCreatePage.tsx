import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { ArrowLeft, Save, X, Plus, Trash2, Package, User, DollarSign } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { orderAPI, customerAPI, productAPI, serviceAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'

export default function OrderCreatePage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    customer: '',
    items: [] as any[],
    discountType: 'none' as 'percentage' | 'fixed' | 'none',
    discountValue: 0,
    shippingFee: 0,
    notes: ''
  })

  const [newItem, setNewItem] = useState({
    type: 'product' as 'product' | 'service',
    item: '',
    quantity: 1,
    unitPrice: 0
  })

  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerAPI.getCustomers().then(res => res.data),
  })

  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: () => productAPI.getProducts().then(res => res.data),
  })

  const { data: servicesData } = useQuery({
    queryKey: ['services'],
    queryFn: () => serviceAPI.getServices().then(res => res.data),
  })

  const customers = customersData?.customers || []
  const products = productsData?.products || []
  const services = servicesData?.services || []

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: orderAPI.createOrder,
    onSuccess: (response) => {
      toast({
        title: "Thành công!",
        description: "Đơn hàng đã được tạo",
      })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      navigate(`/orders/${response.data.order._id}`)
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng',
      })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.customer) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng chọn khách hàng",
      })
      return
    }

    if (formData.items.length === 0) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng thêm ít nhất một sản phẩm hoặc dịch vụ",
      })
      return
    }
    
    // Calculate totals
    const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const discountAmount = formData.discountType === 'percentage' 
      ? (subtotal * formData.discountValue) / 100
      : formData.discountType === 'fixed' 
        ? formData.discountValue 
        : 0
    const totalAmount = subtotal - discountAmount + formData.shippingFee

    const orderData = {
      ...formData,
      subtotal,
      discountAmount,
      totalAmount
    }

    createOrderMutation.mutate(orderData)
  }

  const addItem = () => {
    if (newItem.item && newItem.quantity > 0 && newItem.unitPrice > 0) {
      const selectedItem = newItem.type === 'product' 
        ? products.find((p: any) => p._id === newItem.item)
        : services.find((s: any) => s._id === newItem.item)
      
      if (selectedItem) {
        const item = {
          ...newItem,
          item: selectedItem._id,
          unitPrice: selectedItem.price || selectedItem.sellingPrice || 0,
          totalPrice: newItem.quantity * (selectedItem.price || selectedItem.sellingPrice || 0)
        }
        
        setFormData(prev => ({
          ...prev,
          items: [...prev.items, item]
        }))
        
        setNewItem({
          type: 'product',
          item: '',
          quantity: 1,
          unitPrice: 0
        })
      }
    }
  }

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const updateItemQuantity = (index: number, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index 
          ? { ...item, quantity, totalPrice: quantity * item.unitPrice }
          : item
      )
    }))
  }

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.totalPrice, 0)
    const discountAmount = formData.discountType === 'percentage' 
      ? (subtotal * formData.discountValue) / 100
      : formData.discountType === 'fixed' 
        ? formData.discountValue 
        : 0
    const totalAmount = subtotal - discountAmount + formData.shippingFee

    return { subtotal, discountAmount, totalAmount }
  }

  const { subtotal, discountAmount, totalAmount } = calculateTotals()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/orders')}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tạo đơn hàng mới
            </h1>
            <p className="text-gray-600">
              Tạo đơn hàng mới cho khách hàng
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-500" />
                  Khách hàng
                </CardTitle>
                <CardDescription>
                  Chọn khách hàng cho đơn hàng này
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customer">Chọn khách hàng *</Label>
                    <Select
                      value={formData.customer}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, customer: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn khách hàng" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer: any) => (
                          <SelectItem key={customer._id} value={customer._id}>
                            {customer.name} - {customer.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2 text-green-500" />
                  Sản phẩm/Dịch vụ
                </CardTitle>
                <CardDescription>
                  Thêm sản phẩm hoặc dịch vụ vào đơn hàng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Add New Item */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2 p-4 border rounded-lg">
                    <Select
                      value={newItem.type}
                      onValueChange={(value: 'product' | 'service') => 
                        setNewItem(prev => ({ ...prev, type: value, item: '', unitPrice: 0 }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product">Sản phẩm</SelectItem>
                        <SelectItem value="service">Dịch vụ</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={newItem.item}
                      onValueChange={(value) => {
                        const selectedItem = newItem.type === 'product' 
                          ? products.find((p: any) => p._id === value)
                          : services.find((s: any) => s._id === value)
                        setNewItem(prev => ({ 
                          ...prev, 
                          item: value, 
                          unitPrice: selectedItem?.price || selectedItem?.sellingPrice || 0 
                        }))
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn sản phẩm/dịch vụ" />
                      </SelectTrigger>
                      <SelectContent>
                        {(newItem.type === 'product' ? products : services).map((item: any) => (
                          <SelectItem key={item._id} value={item._id}>
                            {item.name} - {formatCurrency(item.price || item.sellingPrice || 0)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Input
                      type="number"
                      placeholder="Số lượng"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                      min="1"
                    />
                    
                    <Input
                      type="number"
                      placeholder="Đơn giá"
                      value={newItem.unitPrice}
                      onChange={(e) => setNewItem(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                      min="0"
                    />
                    
                    <Button type="button" onClick={addItem} className="flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm
                    </Button>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2">
                    {formData.items.map((item, index) => {
                      const itemData = item.type === 'product' 
                        ? products.find((p: any) => p._id === item.item)
                        : services.find((s: any) => s._id === item.item)
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="w-4 h-4 text-gray-500" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {itemData?.name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.type === 'product' ? 'Sản phẩm' : 'Dịch vụ'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 0)}
                              className="w-20"
                              min="1"
                            />
                            <span className="text-sm text-gray-500">x</span>
                            <span className="text-sm font-medium w-24 text-right">
                              {formatCurrency(item.unitPrice)}
                            </span>
                            <span className="text-sm font-bold w-24 text-right">
                              = {formatCurrency(item.totalPrice)}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Ghi chú</CardTitle>
                <CardDescription>
                  Thêm ghi chú cho đơn hàng (tùy chọn)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ghi chú về đơn hàng..."
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Discount */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-purple-500" />
                  Giảm giá
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="discountType">Loại giảm giá</Label>
                    <Select
                      value={formData.discountType}
                      onValueChange={(value: 'percentage' | 'fixed' | 'none') => 
                        setFormData(prev => ({ ...prev, discountType: value, discountValue: 0 }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Không giảm giá</SelectItem>
                        <SelectItem value="percentage">Theo phần trăm</SelectItem>
                        <SelectItem value="fixed">Theo số tiền</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {formData.discountType !== 'none' && (
                    <div>
                      <Label htmlFor="discountValue">
                        {formData.discountType === 'percentage' ? 'Phần trăm (%)' : 'Số tiền (₫)'}
                      </Label>
                      <Input
                        type="number"
                        value={formData.discountValue}
                        onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                        min="0"
                        max={formData.discountType === 'percentage' ? 100 : undefined}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Shipping */}
            <Card>
              <CardHeader>
                <CardTitle>Phí vận chuyển</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="number"
                  value={formData.shippingFee}
                  onChange={(e) => setFormData(prev => ({ ...prev, shippingFee: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  placeholder="0"
                />
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Tổng kết</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Giảm giá:</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  {formData.shippingFee > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <span>Phí ship:</span>
                      <span>+{formatCurrency(formData.shippingFee)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-green-600">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/orders')}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={createOrderMutation.isPending}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                {createOrderMutation.isPending ? 'Đang tạo...' : 'Tạo đơn hàng'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
