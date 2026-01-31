'use client'

import { useEffect, useState } from 'react'
import { autoAnalyticalModelsApi, analyticalAccountsApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
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
import { Plus, Search, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'
import type { AutoAnalyticalModel, AnalyticalAccount } from '@/types'

interface ModelForm {
  name: string
  rule_type: string
  rule_value: string
  analytical_account_id: string
  priority: number
  is_active: boolean
}

const initialFormState: ModelForm = {
  name: '',
  rule_type: 'product_category',
  rule_value: '',
  analytical_account_id: '',
  priority: 10,
  is_active: true,
}

export default function AutoAnalyticalModelsPage() {
  const [models, setModels] = useState<AutoAnalyticalModel[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<AutoAnalyticalModel | null>(null)
  const [formData, setFormData] = useState<ModelForm>(initialFormState)
  const [saving, setSaving] = useState(false)
  const [analyticalAccounts, setAnalyticalAccounts] = useState<AnalyticalAccount[]>([])

  const fetchModels = async () => {
    try {
      setLoading(true)
      const response = await autoAnalyticalModelsApi.getAll({
        page,
        per_page: 20,
        search,
      })
      setModels(response.data.auto_analytical_models || [])
      setTotal(response.data.total || 0)
    } catch (error) {
      toast.error('Failed to fetch models')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchModels()
  }, [page, search])

  const handleToggleActive = async (id: string) => {
    try {
      await autoAnalyticalModelsApi.toggleActive(id)
      toast.success('Model status updated')
      fetchModels()
    } catch (error) {
      toast.error('Failed to update model status')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this model?')) return
    try {
      await autoAnalyticalModelsApi.delete(id)
      toast.success('Model deleted')
      fetchModels()
    } catch (error) {
      toast.error('Failed to delete model')
    }
  }

  const fetchAnalyticalAccounts = async () => {
    try {
      const response = await analyticalAccountsApi.getAll({ per_page: 100 })
      setAnalyticalAccounts(response.data.analytical_accounts || [])
    } catch (error) {
      console.error('Failed to fetch analytical accounts')
    }
  }

  const openCreateDialog = () => {
    setEditingModel(null)
    setFormData(initialFormState)
    fetchAnalyticalAccounts()
    setDialogOpen(true)
  }

  const openEditDialog = (model: AutoAnalyticalModel) => {
    setEditingModel(model)
    setFormData({
      name: model.name || '',
      rule_type: model.rule_type || 'product_category',
      rule_value: model.rule_value || '',
      analytical_account_id: model.analytical_account_id || '',
      priority: model.priority || 10,
      is_active: model.is_active ?? true,
    })
    fetchAnalyticalAccounts()
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.rule_value || !formData.analytical_account_id) {
      toast.error('Name, rule value, and analytical account are required')
      return
    }
    
    setSaving(true)
    try {
      if (editingModel) {
        await autoAnalyticalModelsApi.update(editingModel._id, formData)
        toast.success('Model updated')
      } else {
        await autoAnalyticalModelsApi.create(formData)
        toast.success('Model created')
      }
      setDialogOpen(false)
      fetchModels()
    } catch (error) {
      toast.error(editingModel ? 'Failed to update model' : 'Failed to create model')
    } finally {
      setSaving(false)
    }
  }

  const getRuleTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      product_category: 'bg-purple-100 text-purple-800',
      product: 'bg-blue-100 text-blue-800',
      contact: 'bg-green-100 text-green-800',
      amount_range: 'bg-orange-100 text-orange-800',
    }
    return <Badge className={colors[type] || 'bg-gray-100 text-gray-800'}>{type.replace('_', ' ')}</Badge>
  }

  return (
    <div>
      <Header
        title="Auto Analytical Models"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Auto Analytical Models' }]}
      />

      <div className="p-6">
        <Card className="mb-6">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">
              <strong>Auto Analytical Models</strong> automatically assign analytical accounts (cost centers) to transactions 
              based on predefined rules. This reduces manual effort and ensures consistent cost tracking.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search models..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Create Model
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
                    <TableHead>Name</TableHead>
                    <TableHead>Rule Type</TableHead>
                    <TableHead>Rule Value</TableHead>
                    <TableHead>Analytical Account</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {models.map((model) => (
                    <TableRow key={model._id}>
                      <TableCell className="font-medium">{model.name}</TableCell>
                      <TableCell>{getRuleTypeBadge(model.rule_type)}</TableCell>
                      <TableCell className="max-w-xs truncate">{model.rule_value}</TableCell>
                      <TableCell>
                        {model.analytical_account ? (
                          <span className="text-sm">
                            {model.analytical_account.code} - {model.analytical_account.name}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{model.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={model.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {model.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(model)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(model._id)}
                            title={model.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {model.is_active ? (
                              <ToggleRight className="w-4 h-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-gray-400" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(model._id)}
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

            {models.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500">
                No auto analytical models found. Create your first model to automate cost center assignment.
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Showing {models.length} of {total} models
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
                  disabled={models.length < 20}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingModel ? 'Edit Model' : 'Create Model'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Marketing Expenses"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rule_type">Rule Type *</Label>
              <Select value={formData.rule_type} onValueChange={(value) => setFormData({ ...formData, rule_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product_category">Product Category</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="contact">Contact</SelectItem>
                  <SelectItem value="amount_range">Amount Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rule_value">Rule Value *</Label>
              <Input
                id="rule_value"
                value={formData.rule_value}
                onChange={(e) => setFormData({ ...formData, rule_value: e.target.value })}
                placeholder="e.g., Marketing, Electronics, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="analytical_account_id">Analytical Account *</Label>
              <Select value={formData.analytical_account_id} onValueChange={(value) => setFormData({ ...formData, analytical_account_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {analyticalAccounts.map((account) => (
                    <SelectItem key={account._id} value={account._id}>{account.code} - {account.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 10 })}
                placeholder="10"
              />
              <p className="text-xs text-gray-500">Lower numbers have higher priority</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : (editingModel ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
