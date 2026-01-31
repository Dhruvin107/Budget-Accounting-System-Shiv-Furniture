'use client'

import { useEffect, useState } from 'react'
import { budgetsApi, analyticalAccountsApi } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import Header from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Plus, Search, Edit, Trash2, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Budget, AnalyticalAccount } from '@/types'

interface BudgetForm {
  name: string
  analytical_account_id: string
  budget_type: string
  period_start: string
  period_end: string
  budgeted_amount: number
  description: string
}

const initialFormState: BudgetForm = {
  name: '',
  analytical_account_id: '',
  budget_type: 'expense',
  period_start: new Date().toISOString().split('T')[0],
  period_end: new Date(new Date().setMonth(new Date().getMonth() + 12)).toISOString().split('T')[0],
  budgeted_amount: 0,
  description: '',
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [formData, setFormData] = useState<BudgetForm>(initialFormState)
  const [saving, setSaving] = useState(false)
  const [analyticalAccounts, setAnalyticalAccounts] = useState<AnalyticalAccount[]>([])

  const fetchBudgets = async () => {
    try {
      setLoading(true)
      const response = await budgetsApi.getAll({
        page,
        per_page: 20,
        search,
      })
      setBudgets(response.data.budgets)
      setTotal(response.data.total)
    } catch (error) {
      toast.error('Failed to fetch budgets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBudgets()
  }, [page, search])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return
    try {
      await budgetsApi.delete(id)
      toast.success('Budget deleted')
      fetchBudgets()
    } catch (error) {
      toast.error('Failed to delete budget')
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
    setEditingBudget(null)
    setFormData(initialFormState)
    fetchAnalyticalAccounts()
    setDialogOpen(true)
  }

  const openEditDialog = (budget: Budget) => {
    setEditingBudget(budget)
    setFormData({
      name: budget.name || '',
      analytical_account_id: budget.analytical_account_id || '',
      budget_type: budget.budget_type || 'expense',
      period_start: budget.period_start?.split('T')[0] || '',
      period_end: budget.period_end?.split('T')[0] || '',
      budgeted_amount: budget.budgeted_amount || 0,
      description: budget.description || '',
    })
    fetchAnalyticalAccounts()
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.analytical_account_id || formData.budgeted_amount <= 0) {
      toast.error('Name, analytical account, and amount are required')
      return
    }
    
    setSaving(true)
    try {
      if (editingBudget) {
        await budgetsApi.update(editingBudget._id, formData)
        toast.success('Budget updated')
      } else {
        await budgetsApi.create(formData)
        toast.success('Budget created')
      }
      setDialogOpen(false)
      fetchBudgets()
    } catch (error) {
      toast.error(editingBudget ? 'Failed to update budget' : 'Failed to create budget')
    } finally {
      setSaving(false)
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage <= 75) return 'bg-green-500'
    if (percentage <= 90) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getStatusBadge = (percentage: number) => {
    if (percentage <= 75) return <Badge variant="success">On Track</Badge>
    if (percentage <= 100) return <Badge variant="warning">Warning</Badge>
    return <Badge variant="destructive">Over Budget</Badge>
  }

  return (
    <div>
      <Header
        title="Budgets"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Budgets' }]}
      />

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">On Track</p>
                  <p className="text-2xl font-bold text-green-600">
                    {budgets.filter(b => (b.achievement_percentage || 0) <= 75).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Warning</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {budgets.filter(b => (b.achievement_percentage || 0) > 75 && (b.achievement_percentage || 0) <= 100).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Over Budget</p>
                  <p className="text-2xl font-bold text-red-600">
                    {budgets.filter(b => (b.achievement_percentage || 0) > 100).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search budgets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Create Budget
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
                    <TableHead>Budget Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Analytical Account</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Budgeted</TableHead>
                    <TableHead className="text-right">Actual</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgets.map((budget) => (
                    <TableRow key={budget._id}>
                      <TableCell className="font-medium">{budget.name}</TableCell>
                      <TableCell>
                        <Badge variant={budget.budget_type === 'expense' ? 'destructive' : 'success'}>
                          {budget.budget_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {budget.analytical_account?.code} - {budget.analytical_account?.name}
                      </TableCell>
                      <TableCell>
                        {formatDate(budget.period_start)} - {formatDate(budget.period_end)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(budget.budgeted_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(budget.actual_amount || 0)}
                      </TableCell>
                      <TableCell>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(budget.achievement_percentage || 0)}`}
                            style={{ width: `${Math.min(budget.achievement_percentage || 0, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {(budget.achievement_percentage || 0).toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(budget.achievement_percentage || 0)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(budget)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(budget._id)}
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

            {budgets.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500">
                No budgets found. Create your first budget to start tracking.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingBudget ? 'Edit Budget' : 'Create Budget'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Budget Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Marketing Q1 2024"
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
              <Label htmlFor="budget_type">Budget Type *</Label>
              <Select value={formData.budget_type} onValueChange={(value) => setFormData({ ...formData, budget_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="period_start">Period Start</Label>
                <Input
                  id="period_start"
                  type="date"
                  value={formData.period_start}
                  onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="period_end">Period End</Label>
                <Input
                  id="period_end"
                  type="date"
                  value={formData.period_end}
                  onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgeted_amount">Budgeted Amount *</Label>
              <Input
                id="budgeted_amount"
                type="number"
                value={formData.budgeted_amount}
                onChange={(e) => setFormData({ ...formData, budgeted_amount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Budget description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : (editingBudget ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
