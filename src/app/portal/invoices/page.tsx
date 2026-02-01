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
import { Search, Eye, Download, CreditCard, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { CustomerInvoice } from '@/types'

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function PortalInvoicesPage() {
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null)

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

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

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

  const handlePayNow = async (invoice: CustomerInvoice) => {
    if (payingInvoiceId) return
    
    setPayingInvoiceId(invoice._id)
    
    try {
      // Get Razorpay key
      const keyResponse = await portalApi.getRazorpayKey()
      const razorpayKey = keyResponse.data.key_id
      
      // Create payment order
      const orderResponse = await portalApi.createPaymentOrder(invoice._id)
      const { order_id, amount, currency, invoice_number, amount_due } = orderResponse.data
      
      // Open Razorpay checkout
      const options = {
        key: razorpayKey,
        amount: amount,
        currency: currency,
        name: 'Shiv Furniture',
        description: `Payment for Invoice ${invoice_number}`,
        order_id: order_id,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await portalApi.verifyPayment(invoice._id, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            
            toast.success(`Payment successful! ${verifyResponse.data.payment_number}`)
            fetchInvoices()
          } catch (error) {
            toast.error('Payment verification failed')
          }
        },
        prefill: {
          name: '',
          email: '',
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: () => {
            setPayingInvoiceId(null)
          }
        }
      }
      
      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to initiate payment')
    } finally {
      setPayingInvoiceId(null)
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
                          <Button variant="ghost" size="icon" title="View" onClick={() => handleDownload(invoice._id)}>
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
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white ml-2 px-3"
                              title="Pay Now"
                              onClick={() => handlePayNow(invoice)}
                              disabled={payingInvoiceId === invoice._id}
                            >
                              {payingInvoiceId === invoice._id ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-1" />
                              ) : (
                                <CreditCard className="w-4 h-4 mr-1" />
                              )}
                              Pay
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
