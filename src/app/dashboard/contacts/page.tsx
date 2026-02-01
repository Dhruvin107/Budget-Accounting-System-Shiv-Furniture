'use client'

import { useEffect, useState } from 'react'
import { contactsApi } from '@/lib/api'
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
import { Plus, Search, Edit, Trash2, Archive } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Contact } from '@/types'

interface ContactForm {
  name: string
  contact_type: string
  email: string
  phone: string
  company_name: string
  billing_address: string
  shipping_address: string
  gstin: string
  pan: string
  credit_limit: number
  payment_terms: number
}

const initialFormState: ContactForm = {
  name: '',
  contact_type: 'customer',
  email: '',
  phone: '',
  company_name: '',
  billing_address: '',
  shipping_address: '',
  gstin: '',
  pan: '',
  credit_limit: 0,
  payment_terms: 30,
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [formData, setFormData] = useState<ContactForm>(initialFormState)
  const [saving, setSaving] = useState(false)

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const response = await contactsApi.getAll({
        page,
        per_page: 20,
        search,
        type: typeFilter === 'all' ? '' : typeFilter,
      })
      setContacts(response.data.contacts)
      setTotal(response.data.total)
    } catch (error) {
      toast.error('Failed to fetch contacts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [page, search, typeFilter])

  const handleArchive = async (id: string) => {
    try {
      await contactsApi.archive(id)
      toast.success('Contact archived')
      fetchContacts()
    } catch (error) {
      toast.error('Failed to archive contact')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return
    try {
      await contactsApi.delete(id)
      toast.success('Contact deleted')
      fetchContacts()
    } catch (error) {
      toast.error('Failed to delete contact')
    }
  }

  const openCreateDialog = () => {
    setEditingContact(null)
    setFormData(initialFormState)
    setDialogOpen(true)
  }

  const openEditDialog = (contact: Contact) => {
    setEditingContact(contact)
    setFormData({
      name: contact.name || '',
      contact_type: contact.contact_type || 'customer',
      email: contact.email || '',
      phone: contact.phone || '',
      company_name: contact.company_name || '',
      billing_address: contact.billing_address ? `${contact.billing_address.street || ''}, ${contact.billing_address.city || ''}, ${contact.billing_address.state || ''} ${contact.billing_address.pincode || ''}`.trim() : '',
      shipping_address: contact.shipping_address ? `${contact.shipping_address.street || ''}, ${contact.shipping_address.city || ''}, ${contact.shipping_address.state || ''} ${contact.shipping_address.pincode || ''}`.trim() : '',
      gstin: contact.gstin || '',
      pan: contact.pan || '',
      credit_limit: contact.credit_limit || 0,
      payment_terms: contact.payment_terms || 30,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('Name is required')
      return
    }
    
    setSaving(true)
    try {
      if (editingContact) {
        await contactsApi.update(editingContact._id, formData)
        toast.success('Contact updated')
      } else {
        await contactsApi.create(formData)
        toast.success('Contact created')
      }
      setDialogOpen(false)
      fetchContacts()
    } catch (error) {
      toast.error(editingContact ? 'Failed to update contact' : 'Failed to create contact')
    } finally {
      setSaving(false)
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'customer':
        return <Badge variant="default">Customer</Badge>
      case 'vendor':
        return <Badge variant="secondary">Vendor</Badge>
      case 'both':
        return <Badge variant="outline">Both</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  return (
    <div>
      <Header
        title="Contacts"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Contacts' }]}
      />

      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search contacts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="customer">Customers</SelectItem>
                    <SelectItem value="vendor">Vendors</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
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
                    <TableHead>Type</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact._id}>
                      <TableCell className="font-medium">{contact.name}</TableCell>
                      <TableCell>{getTypeBadge(contact.contact_type)}</TableCell>
                      <TableCell>{contact.email || '-'}</TableCell>
                      <TableCell>{contact.phone || '-'}</TableCell>
                      <TableCell>{contact.company_name || '-'}</TableCell>
                      <TableCell>{formatDate(contact.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(contact)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleArchive(contact._id)}
                          >
                            <Archive className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(contact._id)}
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

            {contacts.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500">
                No contacts found. Add your first contact to get started.
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Showing {contacts.length} of {total} contacts
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
                  disabled={contacts.length < 20}
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
            <DialogTitle>{editingContact ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contact name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_type">Type *</Label>
              <Select value={formData.contact_type} onValueChange={(value) => setFormData({ ...formData, contact_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gstin">GSTIN</Label>
              <Input
                id="gstin"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                placeholder="GSTIN number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pan">PAN</Label>
              <Input
                id="pan"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                placeholder="PAN number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credit_limit">Credit Limit</Label>
              <Input
                id="credit_limit"
                type="number"
                value={formData.credit_limit}
                onChange={(e) => setFormData({ ...formData, credit_limit: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="billing_address">Billing Address</Label>
              <Input
                id="billing_address"
                value={formData.billing_address}
                onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                placeholder="Street, City, State, Pincode"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="shipping_address">Shipping Address</Label>
              <Input
                id="shipping_address"
                value={formData.shipping_address}
                onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                placeholder="Street, City, State, Pincode"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : (editingContact ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
