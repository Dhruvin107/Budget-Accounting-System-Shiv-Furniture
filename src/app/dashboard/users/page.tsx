'use client'

import { useEffect, useState } from 'react'
import { usersApi } from '@/lib/api'
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
import { Plus, Search, Edit, Trash2, UserCheck, UserX, Shield, User } from 'lucide-react'
import toast from 'react-hot-toast'

interface UserData {
  _id: string
  email: string
  full_name: string
  phone?: string
  role: 'admin' | 'portal_user' | 'vendor'
  is_active: boolean
  created_at: string
  last_login?: string
}

interface UserForm {
  email: string
  full_name: string
  phone: string
  role: string
  password: string
}

const initialFormState: UserForm = {
  email: '',
  full_name: '',
  phone: '',
  role: 'portal_user',
  password: '',
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [formData, setFormData] = useState<UserForm>(initialFormState)
  const [saving, setSaving] = useState(false)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await usersApi.getAll({
        page,
        per_page: 20,
        search,
        role: roleFilter === 'all' ? '' : roleFilter,
      })
      setUsers(response.data.users || [])
      setTotal(response.data.total || 0)
    } catch (error) {
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, search, roleFilter])

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await usersApi.toggleActive(id)
      toast.success(isActive ? 'User deactivated' : 'User activated')
      fetchUsers()
    } catch (error) {
      toast.error('Failed to update user status')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      await usersApi.delete(id)
      toast.success('User deleted')
      fetchUsers()
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  const openCreateDialog = () => {
    setEditingUser(null)
    setFormData(initialFormState)
    setDialogOpen(true)
  }

  const openEditDialog = (user: UserData) => {
    setEditingUser(user)
    setFormData({
      email: user.email || '',
      full_name: user.full_name || '',
      phone: user.phone || '',
      role: user.role || 'portal_user',
      password: '',
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.email || !formData.full_name || !formData.role) {
      toast.error('Email, name, and role are required')
      return
    }
    
    setSaving(true)
    try {
      if (editingUser) {
        await usersApi.update(editingUser._id, {
          email: formData.email,
          full_name: formData.full_name,
          phone: formData.phone,
          role: formData.role,
        })
        toast.success('User updated')
      } else {
        await usersApi.create({
          email: formData.email,
          full_name: formData.full_name,
          phone: formData.phone,
          role: formData.role,
          password: formData.password || undefined,
        })
        toast.success('User created successfully')
      }
      setDialogOpen(false)
      fetchUsers()
    } catch (error: any) {
      toast.error(error.response?.data?.error || (editingUser ? 'Failed to update user' : 'Failed to create user'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <Header
        title="Users"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Users' }]}
      />

      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="portal_user">Portal User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add User
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
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {user.role === 'admin' ? (
                            <Shield className="w-4 h-4 text-blue-600" />
                          ) : (
                            <User className="w-4 h-4 text-gray-400" />
                          )}
                          {user.full_name}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                          {user.role === 'admin' ? 'Admin' : 'Portal User'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.last_login ? formatDate(user.last_login) : 'Never'}</TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(user._id, user.is_active)}
                            title={user.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {user.is_active ? (
                              <UserX className="w-4 h-4 text-orange-500" />
                            ) : (
                              <UserCheck className="w-4 h-4 text-green-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(user._id)}
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

            {users.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500">
                No users found.
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Showing {users.length} of {total} users
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
                  disabled={users.length < 20}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add User'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 9876543210"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portal_user">Portal User (Customer)</SelectItem>
                  <SelectItem value="vendor">Portal User (Vendor)</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!editingUser && (
              <div className="space-y-2">
                <Label htmlFor="password">Password (optional)</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Leave empty to auto-generate"
                />
                <p className="text-xs text-gray-500">If left empty, a temporary password will be generated and emailed to the user.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : (editingUser ? 'Update' : 'Create User')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
