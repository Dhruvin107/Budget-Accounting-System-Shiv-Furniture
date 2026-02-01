'use client'

import { useEffect, useState } from 'react'
import { customerInvoicesApi, contactsApi, productsApi } from '@/lib/api'
import { formatCurrency, formatDate, getStatusColor, getPaymentStatusLabel } from '@/lib/utils'
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
import { Plus, Search, Eye, FileText, Mail, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { CustomerInvoice, Contact, Product } from '@/types'

interface InvoiceItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  tax_rate: number
  amount: number
}

interface InvoiceForm {
  customer_id: string
  invoice_date: string
  due_date: string
  items: InvoiceItem[]
  notes: string
}

const initialFormState: InvoiceForm = {
  customer_id: '',
  invoice_date: new Date().toISOString().split('T')[0],
  due_date: '',
  items: [],
  notes: '',
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState<InvoiceForm>(initialFormState)
  const [saving, setSaving] = useState(false)
  const [customers, setCustomers] = useState<Contact[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await customerInvoicesApi.getAll({
        page,
        per_page: 20,
        search,
        status: statusFilter === 'all' ? '' : statusFilter,
        payment_status: paymentFilter === 'all' ? '' : paymentFilter,
      })
      setInvoices(response.data.customer_invoices)
      setTotal(response.data.total)
    } catch (error) {
      toast.error('Failed to fetch invoices')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [page, search, statusFilter, paymentFilter])

  const handlePost = async (id: string) => {
    try {
      await customerInvoicesApi.post(id)
      toast.success('Invoice posted successfully')
      fetchInvoices()
    } catch (error) {
      toast.error('Failed to post invoice')
    }
  }

  const handleSendEmail = async (id: string) => {
    try {
      await customerInvoicesApi.sendEmail(id)
      toast.success('Invoice email sent')
    } catch (error) {
      toast.error('Failed to send email')
    }
  }

  const handleGeneratePdf = async (id: string) => {
    try {
      const response = await customerInvoicesApi.generatePdf(id)
      window.open(response.data.url, '_blank')
    } catch (error) {
      toast.error('Failed to generate PDF')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return
    try {
      await customerInvoicesApi.delete(id)
      toast.success('Invoice deleted')
      fetchInvoices()
    } catch (error) {
      toast.error('Failed to delete invoice')
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
      await customerInvoicesApi.create(formData)
      toast.success('Invoice created')
      setDialogOpen(false)
      fetchInvoices()
    } catch (error) {
      toast.error('Failed to create invoice')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <Header
        title="Customer Invoices"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Invoices' }]}
      />

      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search invoices..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="posted">Posted</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="not_paid">Not Paid</SelectItem>
                    <SelectItem value="partially_paid">Partially Paid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
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
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice._id}>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>{invoice.customer?.name || '-'}</TableCell>
                      <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                      <TableCell>{invoice.due_date ? formatDate(invoice.due_date) : '-'}</TableCell>
                      <TableCell className="text-right">{formatCurrency(invoice.total_amount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(invoice.amount_due)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(invoice.payment_status)}>
                          {getPaymentStatusLabel(invoice.payment_status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" title="View" onClick={() => handleGeneratePdf(invoice._id)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleGeneratePdf(invoice._id)}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          {invoice.status === 'posted' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSendEmail(invoice._id)}
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                          )}
                          {invoice.status === 'draft' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(invoice._id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {invoices.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500">
                No invoices found.
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Showing {invoices.length} of {total} invoices
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
                  disabled={invoices.length < 20}
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
            <DialogTitle>Create Invoice</DialogTitle>
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
                <Label htmlFor="invoice_date">Invoice Date</Label>
                <Input
                  id="invoice_date"
                  type="date"
                  value={formData.invoice_date}
                  onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
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
              {saving ? 'Creating...' : 'Create Invoice'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
