'use client'

import { useEffect, useState } from 'react'
import { salesOrdersApi, contactsApi, productsApi } from '@/lib/api'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import Header from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, Eye, FileText, CheckCircle, Truck, XCircle, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { SalesOrder, Contact, Product } from '@/types'

interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  tax_rate: number
  amount: number
}

interface OrderForm {
  customer_id: string
  order_date: string
  delivery_date: string
  items: OrderItem[]
  notes: string
}

const initialFormState: OrderForm = {
  customer_id: '',
  order_date: new Date().toISOString().split('T')[0],
  delivery_date: '',
  items: [],
  notes: '',
}

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState<OrderForm>(initialFormState)
  const [saving, setSaving] = useState(false)
  const [customers, setCustomers] = useState<Contact[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await salesOrdersApi.getAll({
        page,
        per_page: 20,
        search,
        status: statusFilter === 'all' ? '' : statusFilter,
      })
      setOrders(response.data.sales_orders || [])
      setTotal(response.data.total || 0)
    } catch (error) {
      toast.error('Failed to fetch sales orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [page, search, statusFilter])

  const handleConfirm = async (id: string) => {
    try {
      await salesOrdersApi.confirm(id)
      toast.success('Sales order confirmed')
      fetchOrders()
    } catch (error) {
      toast.error('Failed to confirm order')
    }
  }

  const handleDeliver = async (id: string) => {
    try {
      await salesOrdersApi.deliver(id)
      toast.success('Order marked as delivered')
      fetchOrders()
    } catch (error) {
      toast.error('Failed to mark as delivered')
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    try {
      await salesOrdersApi.cancel(id)
      toast.success('Sales order cancelled')
      fetchOrders()
    } catch (error) {
      toast.error('Failed to cancel order')
    }
  }

  const handleGeneratePdf = async (id: string) => {
    try {
      const response = await salesOrdersApi.generatePdf(id)
      if (response.data.url) {
        window.open(response.data.url, '_blank')
      }
    } catch (error) {
      toast.error('Failed to generate PDF')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return
    try {
      await salesOrdersApi.delete(id)
      toast.success('Sales order deleted')
      fetchOrders()
    } catch (error) {
      toast.error('Failed to delete order')
    }
  }

  const fetchCustomersAndProducts = async () => {
    try {
      const [customersRes, productsRes] = await Promise.all([
        contactsApi.getCustomers(),
        productsApi.getAll({ per_page: 100 })
      ])
      setCustomers(customersRes.data.customers || [])
      setProducts(productsRes.data.products || [])
    } catch (error) {
      console.error('Failed to fetch customers/products')
    }
  }

  const openCreateDialog = () => {
    setFormData(initialFormState)
    fetchCustomersAndProducts()
    setDialogOpen(true)
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: '', product_name: '', quantity: 1, unit_price: 0, tax_rate: 18, amount: 0 }]
    })
  }

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    if (field === 'product_id') {
      const product = products.find(p => p._id === value)
      if (product) {
        newItems[index].product_name = product.name
        newItems[index].unit_price = product.sale_price
        newItems[index].tax_rate = product.tax_rate
      }
    }
    const baseAmount = newItems[index].quantity * newItems[index].unit_price
    const taxAmount = baseAmount * (newItems[index].tax_rate / 100)
    newItems[index].amount = baseAmount + taxAmount
    setFormData({ ...formData, items: newItems })
  }

  const removeItem = (index: number) => {
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) })
  }

  const handleSubmit = async () => {
    if (!formData.customer_id || formData.items.length === 0) {
      toast.error('Customer and at least one item are required')
      return
    }
    
    setSaving(true)
    try {
      await salesOrdersApi.create(formData)
      toast.success('Sales order created')
      setDialogOpen(false)
      fetchOrders()
    } catch (error) {
      toast.error('Failed to create sales order')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <Header
        title="Sales Orders"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Sales Orders' }]}
      />

      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search orders..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Create Order
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SO Number</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">{order.so_number}</TableCell>
                      <TableCell>{order.customer?.name || '-'}</TableCell>
                      <TableCell>{formatDate(order.order_date)}</TableCell>
                      <TableCell>{order.delivery_date ? formatDate(order.delivery_date) : '-'}</TableCell>
                      <TableCell className="text-right">{formatCurrency(order.total_amount)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" title="View" onClick={() => handleGeneratePdf(order._id)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleGeneratePdf(order._id)}
                            title="PDF"
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          {order.status === 'draft' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleConfirm(order._id)}
                                title="Confirm"
                              >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(order._id)}
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </>
                          )}
                          {order.status === 'confirmed' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeliver(order._id)}
                                title="Mark Delivered"
                              >
                                <Truck className="w-4 h-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCancel(order._id)}
                                title="Cancel"
                              >
                                <XCircle className="w-4 h-4 text-red-500" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {orders.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500">
                No sales orders found.
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Showing {orders.length} of {total} orders
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={orders.length < 20}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Sales Order</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_id">Customer *</Label>
                <Select value={formData.customer_id} onValueChange={(value) => setFormData({ ...formData, customer_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer._id} value={customer._id}>{customer.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="order_date">Order Date</Label>
                <Input
                  id="order_date"
                  type="date"
                  value={formData.order_date}
                  onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery_date">Delivery Date</Label>
                <Input
                  id="delivery_date"
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Items *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="w-4 h-4 mr-1" /> Add Item
                </Button>
              </div>
              {formData.items.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="w-24">Qty</TableHead>
                      <TableHead className="w-32">Unit Price</TableHead>
                      <TableHead className="w-24">Tax %</TableHead>
                      <TableHead className="w-32">Amount</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Select value={item.product_id} onValueChange={(value) => updateItem(index, 'product_id', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product._id} value={product._id}>{product.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            min="1"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.tax_rate}
                            onChange={(e) => updateItem(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div>{formatCurrency(item.amount)}</div>
                          <div className="text-xs text-gray-500">
                            ({formatCurrency(item.quantity * item.unit_price)} + {item.tax_rate}% tax)
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {formData.items.length === 0 && (
                <p className="text-center py-4 text-gray-500 text-sm">No items added. Click "Add Item" to add products.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes"
              />
            </div>

            <div className="text-right space-y-1">
              <div className="text-sm text-gray-600">
                Subtotal: {formatCurrency(formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0))}
              </div>
              <div className="text-sm text-gray-600">
                Tax: {formatCurrency(formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price * item.tax_rate / 100), 0))}
              </div>
              <div className="font-semibold text-lg">
                Total: {formatCurrency(formData.items.reduce((sum, item) => sum + item.amount, 0))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Creating...' : 'Create Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
