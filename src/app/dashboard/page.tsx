'use client'

import { useEffect, useState } from 'react'
import { reportsApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import Header from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  Package,
  FileText,
  Receipt,
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'

interface DashboardData {
  total_customers: number
  total_vendors: number
  total_products: number
  pending_invoices: number
  pending_bills: number
  total_sales_this_month: number
  total_purchases_this_month: number
  total_receivable: number
  total_payable: number
  budgets_on_track: number
  budgets_over: number
  net_position: number
}

interface MonthlyTrend {
  month_name: string
  sales: number
  purchases: number
  profit: number
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [trends, setTrends] = useState<MonthlyTrend[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, trendsRes] = await Promise.all([
          reportsApi.getDashboard(),
          reportsApi.getMonthlyTrends(),
        ])
        setData(dashboardRes.data)
        setTrends(trendsRes.data.trends)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const stats = [
    {
      title: 'Total Customers',
      value: data?.total_customers || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Vendors',
      value: data?.total_vendors || 0,
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Products',
      value: data?.total_products || 0,
      icon: Package,
      color: 'bg-green-500',
    },
    {
      title: 'Pending Invoices',
      value: data?.pending_invoices || 0,
      icon: FileText,
      color: 'bg-yellow-500',
    },
  ]

  const financialStats = [
    {
      title: 'Sales This Month',
      value: formatCurrency(data?.total_sales_this_month || 0),
      icon: TrendingUp,
      trend: 'up',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Purchases This Month',
      value: formatCurrency(data?.total_purchases_this_month || 0),
      icon: TrendingDown,
      trend: 'down',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Total Receivable',
      value: formatCurrency(data?.total_receivable || 0),
      icon: ArrowUpRight,
      trend: 'up',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Payable',
      value: formatCurrency(data?.total_payable || 0),
      icon: ArrowDownRight,
      trend: 'down',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div>
      <Header title="Dashboard" />
      
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {financialStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Sales vs Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month_name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="sales" fill="#3b82f6" name="Sales" />
                    <Bar dataKey="purchases" fill="#ef4444" name="Purchases" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profit Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month_name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Profit"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Budget Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Budgets On Track</span>
                  <span className="text-lg font-semibold text-green-600">
                    {data?.budgets_on_track || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Budgets Over</span>
                  <span className="text-lg font-semibold text-red-600">
                    {data?.budgets_over || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Net Position
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className={`text-3xl font-bold ${(data?.net_position || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(data?.net_position || 0)}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Receivables - Payables
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Pending Bills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-orange-600">
                  {data?.pending_bills || 0}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Bills awaiting payment
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
