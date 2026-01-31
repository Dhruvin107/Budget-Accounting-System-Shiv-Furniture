'use client'

import { useEffect, useState } from 'react'
import { vendorBillsApi, contactsApi, productsApi } from '@/lib/api'
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
import { Plus, Search, Eye, FileText, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { VendorBill, Contact, Product } from '@/types'

interface BillItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  tax_rate: number
  amount: number
}

interface BillForm {
  vendor_id: string
  bill_date: string
  due_date: string
  items: BillItem[]
  notes: string
}

const initialFormState: BillForm = {
  vendor_id: '',
  bill_date: new Date().toISOString().split('T')[0],
  due_date: '',
  items: [],
  notes: '',
}

export default function VendorBillsPage() {
  const [bills, setBills] = useState<VendorBill[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState<BillForm>(initialFormState)
  const [saving, setSaving] = useState(false)
  const [vendors, setVendors] = useState<Contact[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const fetchBills = async () => {
    try {
      setLoading(true)
      const response = await vendorBillsApi.getAll({
        page,
        per_page: 20,
        search,
        status: statusFilter === 'all' ? '' : statusFilter,
        payment_status: paymentFilter === 'all' ? '' : paymentFilter,
      })
      setBills(response.data.vendor_bills || [])
      setTotal(response.data.total || 0)
    } catch (error) {
      toast.error('Failed to fetch vendor bills')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBills()
  }, [page, search, statusFilter, paymentFilter])

  const handlePost = async (id: string) => {
    try {
      await vendorBillsApi.post(id)
      toast.success('Bill posted successfully')
      fetchBills()
    } catch (error) {
      toast.error('Failed to post bill')
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this bill?')) return
    try {
      await vendorBillsApi.cancel(id)
      toast.success('Bill cancelled')
      fetchBills()
    } catch (error) {
      toast.error('Failed to cancel bill')
    }
  }

  const handleGeneratePdf = async (id: string) => {
    try {
      const response = await vendorBillsApi.generatePdf(id)
      if (response.data.url) {
        window.open(response.data.url, '_blank')
      }
    } catch (error) {
      toast.error('Failed to generate PDF')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bill?')) return
    try {
      await vendorBillsApi.delete(id)
      toast.success('Bill deleted')
      fetchBills()
    } catch (error) {
      toast.error('Failed to delete bill')
    }
  }

  const fetchVendorsAndProducts = async () => {
    try {
      const [vendorsRes, productsRes] = await Promise.all([
        contactsApi.getVendors(),
        productsApi.getAll({ per_page: 100 })
      ])
      setVendors(vendorsRes.data.vendors || [])
      setProducts(productsRes.data.products || [])
    } catch (error) {
      console.error('Failed to fetch vendors/products')
    }
  }

  const openCreateDialog = () => {
    setFormData(initialFormState)
    fetchVendorsAndProducts()
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
        newItems[index].unit_price = product.purchase_price
        newItems[index].tax_rate = product.tax_rate
      }
    }
    newItems[index].amount = newItems[index].quantity * newItems[index].unit_price
    setFormData({ ...formData, items: newItems })
  }

  const removeItem = (index: number) => {
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) })
  }

  const handleSubmit = async () => {
    if (!formData.vendor_id || formData.items.length === 0) {
      toast.error('Vendor and at least one item are required')
      return
    }
    
    setSaving(true)
    try {
      await vendorBillsApi.create(formData)
      toast.success('Vendor bill created')
      setDialogOpen(false)
      fetchBills()
    } catch (error) {
      toast.error('Failed to create vendor bill')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <Header
        title="Vendor Bills"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Vendor Bills' }]}
      />

      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search bills..."
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
                Create Bill
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
                    <TableHead>Bill #</TableHead>
                    <TableHead>Vendor</TableHead>
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
                  {bills.map((bill) => (
                    <TableRow key={bill._id}>
                      <TableCell className="font-medium">{bill.bill_number}</TableCell>
                      <TableCell>{bill.vendor?.name || '-'}</TableCell>
                      <TableCell>{formatDate(bill.bill_date)}</TableCell>
                      <TableCell>{bill.due_date ? formatDate(bill.due_date) : '-'}</TableCell>
                      <TableCell className="text-right">{formatCurrency(bill.total_amount)}</TableCell>
                      <TableCell className="text-right font-semibold text-red-600">
                        {formatCurrency(bill.amount_due)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(bill.status)}>{bill.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(bill.payment_status)}>
                          {getPaymentStatusLabel(bill.payment_status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" title="View">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleGeneratePdf(bill._id)}
                            title="PDF"
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          {bill.status === 'draft' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handlePost(bill._id)}
                                title="Post"
                              >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(bill._id)}
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </>
                          )}
                          {bill.status === 'posted' && bill.payment_status === 'not_paid' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCancel(bill._id)}
                              title="Cancel"
                            >
                              <XCircle className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {bills.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500">
                No vendor bills found.
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Showing {bills.length} of {total} bills
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
                  disabled={bills.length < 20}
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
            <DialogTitle>Create Vendor Bill</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor_id">Vendor *</Label>
                <Select value={formData.vendor_id} onValueChange={(value) => setFormData({ ...formData, vendor_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor._id} value={vendor._id}>{vendor.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bill_date">Bill Date</Label>
                <Input
                  id="bill_date"
                  type="date"
                  value={formData.bill_date}
                  onChange={(e) => setFormData({ ...formData, bill_date: e.target.value })}
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
                          {formatCurrency(item.amount)}
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

            <div className="text-right font-semibold text-lg">
              Total: {formatCurrency(formData.items.reduce((sum, item) => sum + item.amount, 0))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Creating...' : 'Create Bill'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
