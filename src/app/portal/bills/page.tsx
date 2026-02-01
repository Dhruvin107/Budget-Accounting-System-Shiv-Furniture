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
import { Search, Eye, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import type { VendorBill } from '@/types'

export default function PortalBillsPage() {
  const [bills, setBills] = useState<VendorBill[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchBills = async () => {
    try {
      setLoading(true)
      const response = await portalApi.getBills({ search })
      setBills(response.data.bills || [])
    } catch (error) {
      toast.error('Failed to fetch bills')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBills()
  }, [search])

  const handleDownload = async (id: string) => {
    try {
      toast.loading('Generating PDF...')
      const response = await portalApi.downloadBill(id)
      if (response.data.url) {
        window.open(response.data.url, '_blank')
      }
      toast.dismiss()
      toast.success('PDF generated')
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to download bill')
    }
  }

  return (
    <div>
      <Header
        title="My Bills"
        breadcrumbs={[{ label: 'Portal', href: '/portal' }, { label: 'Bills' }]}
      />

      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search bills..."
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
                    <TableHead>Bill #</TableHead>
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
                  {bills.map((bill) => (
                    <TableRow key={bill._id}>
                      <TableCell className="font-medium">{bill.bill_number}</TableCell>
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
                            onClick={() => handleDownload(bill._id)}
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {bills.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500">
                No bills found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
