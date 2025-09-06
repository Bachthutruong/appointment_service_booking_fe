import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { ShoppingCart, Plus, Minus, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/useToast'
import { customerAPI, serviceAPI, productAPI, orderAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

interface OrderFormProps {
  open: boolean
  onClose: () => void
  order?: any
  onSuccess?: () => void
}

interface OrderItem {
  type: 'product' | 'service'
  item: string
  quantity: number
  unitPrice: number
}

interface OrderFormData {
  customer: string
  items: OrderItem[]
  discountType: 'none' | 'percentage' | 'fixed'
  discountValue: number
  shippingFee: number
}

export default function OrderForm({ open, onClose, onSuccess }: OrderFormProps) {
  const [images, setImages] = useState<File[]>([])
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    // formState,
  } = useForm<OrderFormData>({
    defaultValues: {
      items: [{ type: 'service', item: '', quantity: 1, unitPrice: 0 }],
      discountType: 'none',
      discountValue: 0,
      shippingFee: 0,
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  })

  const watchedItems = watch('items')
  const discountType = watch('discountType')
  const discountValue = watch('discountValue')
  const shippingFee = watch('shippingFee')

  // Fetch data
  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerAPI.getCustomers({ limit: 100 }).then(res => res.data),
  })

  const { data: servicesData } = useQuery({
    queryKey: ['services'],
    queryFn: () => serviceAPI.getServices({ isActive: true }).then(res => res.data),
  })

  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: () => productAPI.getProducts({ isActive: true }).then(res => res.data),
  })

  const customers = customersData?.customers || []
  const services = servicesData?.services || []
  const products = productsData?.products || []

  // Calculate totals
  const subtotal = watchedItems.reduce((sum, item) => {
    return sum + (item.quantity * item.unitPrice)
  }, 0)

  const discountAmount = discountType === 'percentage' 
    ? (subtotal * discountValue) / 100
    : discountType === 'fixed' ? discountValue : 0

  const totalAmount = subtotal - discountAmount + shippingFee

  // Auto-fill price when item is selected
  const handleItemChange = (index: number, itemId: string, type: 'product' | 'service') => {
    const itemData = type === 'product' 
      ? products.find((p: any) => p._id === itemId)
      : services.find((s: any) => s._id === itemId)
    
    if (itemData) {
      const price = type === 'product' ? itemData.sellingPrice : itemData.price
      setValue(`items.${index}.unitPrice`, price)
    }
  }

  // Create order mutation
  const createMutation = useMutation({
    mutationFn: orderAPI.createOrder,
    onSuccess: (response) => {
      // Upload images if any
      if (images.length > 0) {
        const formData = new FormData()
        images.forEach(image => {
          formData.append('images', image)
        })
        orderAPI.uploadOrderImages(response.data.order._id, formData)
      }
      
      toast({
        title: "Thành công!",
        description: "Đơn hàng đã được tạo",
      })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      reset()
      setImages([])
      onClose()
      onSuccess?.()
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || "Có lỗi xảy ra",
      })
    },
  })

  const onSubmit = (data: OrderFormData) => {
    const orderData = {
      customer: data.customer,
      items: data.items.map(item => ({
        type: item.type,
        item: item.item,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })),
      discountType: data.discountType,
      discountValue: data.discountValue,
      shippingFee: data.shippingFee,
    }

    createMutation.mutate(orderData)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages(prev => [...prev, ...files])
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2 text-orange-500" />
            Tạo đơn hàng mới
          </DialogTitle>
          <DialogDescription>
            Tạo đơn hàng cho khách hàng với sản phẩm và dịch vụ
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label htmlFor="customer">Khách hàng *</Label>
            <Select onValueChange={(value) => setValue('customer', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn khách hàng..." />
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

          {/* Order Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Sản phẩm/Dịch vụ *</Label>
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ type: 'service', item: '', quantity: 1, unitPrice: 0 })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm
              </Button>
            </div>

            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-12 gap-4 items-end">
                    {/* Type */}
                    <div className="col-span-2">
                      <Label>Loại</Label>
                      <Select 
                        onValueChange={(value: 'product' | 'service') => {
                          setValue(`items.${index}.type`, value)
                          setValue(`items.${index}.item`, '')
                          setValue(`items.${index}.unitPrice`, 0)
                        }}
                        defaultValue={field.type}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="service">Dịch vụ</SelectItem>
                          <SelectItem value="product">Sản phẩm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Item */}
                    <div className="col-span-4">
                      <Label>Tên</Label>
                      <Select 
                        onValueChange={(value) => {
                          setValue(`items.${index}.item`, value)
                          handleItemChange(index, value, watchedItems[index]?.type || 'service')
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn..." />
                        </SelectTrigger>
                        <SelectContent>
                          {(watchedItems[index]?.type === 'product' ? products : services).map((item: any) => (
                            <SelectItem key={item._id} value={item._id}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-2">
                      <Label>Số lượng</Label>
                      <Input
                        type="number"
                        min="1"
                        {...register(`items.${index}.quantity`, { 
                          required: true, 
                          min: 1,
                          valueAsNumber: true 
                        })}
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="col-span-2">
                      <Label>Đơn giá</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1000"
                        {...register(`items.${index}.unitPrice`, { 
                          required: true, 
                          min: 0,
                          valueAsNumber: true 
                        })}
                      />
                    </div>

                    {/* Total */}
                    <div className="col-span-1">
                      <Label>Thành tiền</Label>
                      <div className="text-sm font-medium text-green-600">
                        {formatCurrency((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.unitPrice || 0))}
                      </div>
                    </div>

                    {/* Remove */}
                    <div className="col-span-1">
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Discount and Shipping */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Loại giảm giá</Label>
              <Select onValueChange={(value: 'none' | 'percentage' | 'fixed') => setValue('discountType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không giảm giá</SelectItem>
                  <SelectItem value="percentage">Giảm theo %</SelectItem>
                  <SelectItem value="fixed">Giảm cố định</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Giá trị giảm giá</Label>
              <Input
                type="number"
                min="0"
                step={discountType === 'percentage' ? '1' : '1000'}
                max={discountType === 'percentage' ? '100' : undefined}
                {...register('discountValue', { valueAsNumber: true })}
                disabled={discountType === 'none'}
              />
            </div>

            <div className="space-y-2">
              <Label>Phí ship</Label>
              <Input
                type="number"
                min="0"
                step="1000"
                {...register('shippingFee', { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Hình ảnh đơn hàng</Label>
            <div className="space-y-4">
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="cursor-pointer"
              />
              
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Giảm giá:</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                {shippingFee > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Phí ship:</span>
                    <span>+{formatCurrency(shippingFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {createMutation.isPending ? 'Đang tạo...' : 'Tạo đơn hàng'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

