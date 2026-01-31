'use client'

import { useEffect, useState } from 'react'
import { portalApi } from '@/lib/api'
import { formatCurrency, formatDate, getStatusColor, getPaymentStatusLabel } from '@/lib/utils'
import Header from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Eye, Download, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import type { CustomerInvoice } from '@/types'

export default function PortalInvoicesPage() {
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await portalApi.getInvoices({ search })
      setInvoices(response.data.invoices || [])
    } catch (error) {
      toast.error('Failed to fetch invoices')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [search])

  const handleDownload = async (id: string) => {
    try {
      toast.loading('Generating PDF...')
      const response = await portalApi.downloadInvoice(id)
      if (response.data.url) {
        window.open(response.data.url, '_blank')
      }
      toast.dismiss()
      toast.success('PDF generated')
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to download invoice')
    }
  }

  return (
    <div>
      <Header
        title="My Invoices"
        breadcrumbs={[{ label: 'Portal', href: '/portal' }, { label: 'Invoices' }]}
      />

      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search invoices..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
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
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Amount Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice._id}>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                      <TableCell>{invoice.due_date ? formatDate(invoice.due_date) : '-'}</TableCell>
                      <TableCell className="text-right">{formatCurrency(invoice.total_amount)}</TableCell>
                      <TableCell className="text-right font-semibold text-red-600">
                        {formatCurrency(invoice.amount_due)}
                      </TableCell>
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
                          <Button variant="ghost" size="icon" title="View">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(invoice._id)}
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          {invoice.payment_status !== 'paid' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600"
                              title="Pay Now"
                            >
                              <CreditCard className="w-4 h-4" />
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
