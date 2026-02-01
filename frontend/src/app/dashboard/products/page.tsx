'use client'

import { useEffect, useState } from 'react'
import { productsApi } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
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
import { Plus, Search, Edit, Trash2, Archive } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

interface ProductForm {
  name: string
  sku: string
  description: string
  product_type: string
  category: string
  unit: string
  purchase_price: number
  sale_price: number
  tax_rate: number
  hsn_code: string
}

const initialFormState: ProductForm = {
  name: '',
  sku: '',
  description: '',
  product_type: 'goods',
  category: '',
  unit: 'pcs',
  purchase_price: 0,
  sale_price: 0,
  tax_rate: 18,
  hsn_code: '',
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [categories, setCategories] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductForm>(initialFormState)
  const [saving, setSaving] = useState(false)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await productsApi.getAll({
        page,
        per_page: 20,
        search,
        category: categoryFilter === 'all' ? '' : categoryFilter,
      })
      setProducts(response.data.products || [])
      setTotal(response.data.total || 0)
    } catch (error) {
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await productsApi.getCategories()
      setCategories(response.data.categories || [])
    } catch (error) {
      console.error('Failed to fetch categories')
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [page, search, categoryFilter])

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleArchive = async (id: string) => {
    try {
      await productsApi.archive(id)
      toast.success('Product archived')
      fetchProducts()
    } catch (error) {
      toast.error('Failed to archive product')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await productsApi.delete(id)
      toast.success('Product deleted')
      fetchProducts()
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  const openCreateDialog = () => {
    setEditingProduct(null)
    setFormData(initialFormState)
    setDialogOpen(true)
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name || '',
      sku: product.sku || '',
      description: product.description || '',
      product_type: product.product_type || 'goods',
      category: product.category || '',
      unit: product.unit || 'pcs',
      purchase_price: product.purchase_price || 0,
      sale_price: product.sale_price || 0,
      tax_rate: product.tax_rate || 18,
      hsn_code: product.hsn_code || '',
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.sku) {
      toast.error('Name and SKU are required')
      return
    }
    
    setSaving(true)
    try {
      if (editingProduct) {
        await productsApi.update(editingProduct._id, formData)
        toast.success('Product updated')
      } else {
        await productsApi.create(formData)
        toast.success('Product created')
      }
      setDialogOpen(false)
      fetchProducts()
    } catch (error) {
      toast.error(editingProduct ? 'Failed to update product' : 'Failed to create product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <Header
        title="Products"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Products' }]}
      />

      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
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
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Purchase Price</TableHead>
                    <TableHead className="text-right">Sale Price</TableHead>
                    <TableHead>Tax Rate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant={product.product_type === 'goods' ? 'default' : 'secondary'}>
                          {product.product_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{product.category || '-'}</TableCell>
                      <TableCell className="text-right">{formatCurrency(product.purchase_price)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(product.sale_price)}</TableCell>
                      <TableCell>{product.tax_rate}%</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleArchive(product._id)}
                          >
                            <Archive className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product._id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {products.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500">
                No products found. Add your first product to get started.
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Showing {products.length} of {total} products
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
                  disabled={products.length < 20}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Product name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="SKU code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product_type">Type *</Label>
              <Select value={formData.product_type} onValueChange={(value) => setFormData({ ...formData, product_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="goods">Goods</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Category"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="pcs, kg, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hsn_code">HSN Code</Label>
              <Input
                id="hsn_code"
                value={formData.hsn_code}
                onChange={(e) => setFormData({ ...formData, hsn_code: e.target.value })}
                placeholder="HSN code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchase_price">Purchase Price</Label>
              <Input
                id="purchase_price"
                type="number"
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale_price">Sale Price</Label>
              <Input
                id="sale_price"
                type="number"
                value={formData.sale_price}
                onChange={(e) => setFormData({ ...formData, sale_price: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_rate">Tax Rate (%)</Label>
              <Input
                id="tax_rate"
                type="number"
                value={formData.tax_rate}
                onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : (editingProduct ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
