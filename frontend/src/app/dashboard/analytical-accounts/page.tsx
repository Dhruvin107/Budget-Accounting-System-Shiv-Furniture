'use client'

import { useEffect, useState } from 'react'
import { analyticalAccountsApi } from '@/lib/api'
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
import { Plus, Search, Edit, Trash2, Archive, FolderTree } from 'lucide-react'
import toast from 'react-hot-toast'
import type { AnalyticalAccount } from '@/types'

interface AccountForm {
  code: string
  name: string
  description: string
  account_type: string
  parent_id: string
}

const initialFormState: AccountForm = {
  code: '',
  name: '',
  description: '',
  account_type: 'expense',
  parent_id: '',
}

export default function AnalyticalAccountsPage() {
  const [accounts, setAccounts] = useState<AnalyticalAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<AnalyticalAccount | null>(null)
  const [formData, setFormData] = useState<AccountForm>(initialFormState)
  const [saving, setSaving] = useState(false)

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const response = await analyticalAccountsApi.getAll({
        page,
        per_page: 20,
        search,
      })
      setAccounts(response.data.analytical_accounts || [])
      setTotal(response.data.total || 0)
    } catch (error) {
      toast.error('Failed to fetch analytical accounts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [page, search])

  const handleArchive = async (id: string) => {
    try {
      await analyticalAccountsApi.archive(id)
      toast.success('Account archived')
      fetchAccounts()
    } catch (error) {
      toast.error('Failed to archive account')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return
    try {
      await analyticalAccountsApi.delete(id)
      toast.success('Account deleted')
      fetchAccounts()
    } catch (error) {
      toast.error('Failed to delete account')
    }
  }

  const openCreateDialog = () => {
    setEditingAccount(null)
    setFormData(initialFormState)
    setDialogOpen(true)
  }

  const openEditDialog = (account: AnalyticalAccount) => {
    setEditingAccount(account)
    setFormData({
      code: account.code || '',
      name: account.name || '',
      description: account.description || '',
      account_type: account.account_type || 'expense',
      parent_id: account.parent_id || '',
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.code || !formData.name) {
      toast.error('Code and name are required')
      return
    }
    
    setSaving(true)
    try {
      if (editingAccount) {
        await analyticalAccountsApi.update(editingAccount._id, formData)
        toast.success('Account updated')
      } else {
        await analyticalAccountsApi.create(formData)
        toast.success('Account created')
      }
      setDialogOpen(false)
      fetchAccounts()
    } catch (error) {
      toast.error(editingAccount ? 'Failed to update account' : 'Failed to create account')
    } finally {
      setSaving(false)
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'income':
        return <Badge className="bg-green-100 text-green-800">Income</Badge>
      case 'expense':
        return <Badge className="bg-red-100 text-red-800">Expense</Badge>
      case 'both':
        return <Badge className="bg-blue-100 text-blue-800">Both</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  return (
    <div>
      <Header
        title="Analytical Accounts"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Analytical Accounts' }]}
      />

      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search accounts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Account
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
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account._id}>
                      <TableCell className="font-mono font-medium">{account.code}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FolderTree className="w-4 h-4 text-gray-400" />
                          {account.name}
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(account.account_type)}</TableCell>
                      <TableCell className="max-w-xs truncate">{account.description || '-'}</TableCell>
                      <TableCell>{formatDate(account.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(account)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleArchive(account._id)}
                          >
                            <Archive className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(account._id)}
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

            {accounts.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500">
                No analytical accounts found. Add your first account to start tracking costs.
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Showing {accounts.length} of {total} accounts
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
                  disabled={accounts.length < 20}
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
            <DialogTitle>{editingAccount ? 'Edit Account' : 'Add Account'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., MKT-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Account name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_type">Account Type *</Label>
              <Select value={formData.account_type} onValueChange={(value) => setFormData({ ...formData, account_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Account description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : (editingAccount ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
