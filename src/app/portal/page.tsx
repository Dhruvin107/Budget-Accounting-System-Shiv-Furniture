'use client'

import { useEffect, useState } from 'react'
import { portalApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import Header from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, ShoppingCart, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

interface PortalSummary {
  pending_invoices: number
  total_amount_due: number
  active_orders: number
}

export default function PortalDashboard() {
  const [summary, setSummary] = useState<PortalSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await portalApi.getSummary()
        setSummary(response.data)
      } catch (error) {
        toast.error('Failed to fetch summary')
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <Header title="Customer Portal" />

      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Welcome to your Portal</h2>
          <p className="text-gray-500">View your invoices, orders, and account details.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending Invoices</p>
                  <p className="text-2xl font-bold">{summary?.pending_invoices || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount Due</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(summary?.total_amount_due || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Orders</p>
                  <p className="text-2xl font-bold">{summary?.active_orders || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <a
                  href="/portal/invoices"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>View My Invoices</span>
                </a>
                <a
                  href="/portal/orders"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5 text-green-600" />
                  <span>View My Orders</span>
                </a>
                <a
                  href="/portal/profile"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <span>Update Profile</span>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                If you have any questions about your invoices or orders, please contact our support team.
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> support@shivfurniture.com</p>
                <p><strong>Phone:</strong> +91 98765 43210</p>
                <p><strong>Hours:</strong> Mon-Sat, 9:00 AM - 6:00 PM</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
