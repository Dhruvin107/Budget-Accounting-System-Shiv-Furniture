'use client'

import { useEffect, useState } from 'react'
import { reportsApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import Header from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Download, TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

interface BudgetPerformance {
  budget_name: string
  budgeted_amount: number
  actual_amount: number
  achievement_percentage: number
}

interface AgingData {
  aging: {
    current: { count: number; amount: number }
    '1_30': { count: number; amount: number }
    '31_60': { count: number; amount: number }
    '61_90': { count: number; amount: number }
    over_90: { count: number; amount: number }
  }
  total_receivable?: number
  total_payable?: number
}

export default function ReportsPage() {
  const [budgetPerformance, setBudgetPerformance] = useState<BudgetPerformance[]>([])
  const [receivablesAging, setReceivablesAging] = useState<AgingData | null>(null)
  const [payablesAging, setPayablesAging] = useState<AgingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [budgetRes, receivablesRes, payablesRes] = await Promise.all([
          reportsApi.getBudgetPerformance(),
          reportsApi.getReceivablesAging(),
          reportsApi.getPayablesAging(),
        ])
        setBudgetPerformance(budgetRes.data.budgets)
        setReceivablesAging(receivablesRes.data)
        setPayablesAging(payablesRes.data)
      } catch (error) {
        toast.error('Failed to fetch reports')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

  const handleExportReports = async () => {
    try {
      // Create CSV content
      let csvContent = "Report Type,Category,Amount\n"
      
      // Add receivables aging data
      if (receivablesAging) {
        csvContent += `Receivables,Current,${receivablesAging.aging.current.amount}\n`
        csvContent += `Receivables,1-30 Days,${receivablesAging.aging['1_30'].amount}\n`
        csvContent += `Receivables,31-60 Days,${receivablesAging.aging['31_60'].amount}\n`
        csvContent += `Receivables,61-90 Days,${receivablesAging.aging['61_90'].amount}\n`
        csvContent += `Receivables,90+ Days,${receivablesAging.aging.over_90.amount}\n`
        csvContent += `Receivables,Total,${receivablesAging.total_receivable}\n`
      }
      
      // Add payables aging data
      if (payablesAging) {
        csvContent += `Payables,Current,${payablesAging.aging.current.amount}\n`
        csvContent += `Payables,1-30 Days,${payablesAging.aging['1_30'].amount}\n`
        csvContent += `Payables,31-60 Days,${payablesAging.aging['31_60'].amount}\n`
        csvContent += `Payables,61-90 Days,${payablesAging.aging['61_90'].amount}\n`
        csvContent += `Payables,90+ Days,${payablesAging.aging.over_90.amount}\n`
        csvContent += `Payables,Total,${payablesAging.total_payable || 0}\n`
      }
      
      // Add budget performance data
      csvContent += "\nBudget Name,Budgeted Amount,Actual Amount,Achievement %\n"
      budgetPerformance.forEach(budget => {
        csvContent += `${budget.budget_name},${budget.budgeted_amount},${budget.actual_amount},${budget.achievement_percentage}\n`
      })
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `reports_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Reports exported successfully!')
    } catch (error) {
      toast.error('Failed to export reports')
    }
  }

  const agingChartData = receivablesAging ? [
    { name: 'Current', value: receivablesAging.aging.current.amount },
    { name: '1-30 Days', value: receivablesAging.aging['1_30'].amount },
    { name: '31-60 Days', value: receivablesAging.aging['31_60'].amount },
    { name: '61-90 Days', value: receivablesAging.aging['61_90'].amount },
    { name: '90+ Days', value: receivablesAging.aging.over_90.amount },
  ] : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <Header
        title="Reports & Analytics"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Reports' }]}
      />

      <div className="p-6 space-y-6">
        <div className="flex justify-end">
          <Button variant="outline" onClick={handleExportReports}>
            <Download className="w-4 h-4 mr-2" />
            Export Reports
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Receivables</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(receivablesAging?.total_receivable || 0)}
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
                  <p className="text-sm text-gray-500">Total Payables</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(payablesAging?.total_payable || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Net Position</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency((receivablesAging?.total_receivable || 0) - (payablesAging?.total_payable || 0))}
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
                  <p className="text-sm text-gray-500">Overdue (90+ days)</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {formatCurrency(receivablesAging?.aging.over_90.amount || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetPerformance.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="budget_name" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="budgeted_amount" fill="#3b82f6" name="Budgeted" />
                    <Bar dataKey="actual_amount" fill="#ef4444" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Receivables Aging</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={agingChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {agingChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Budget Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Budget</th>
                    <th className="text-right py-3 px-4">Budgeted</th>
                    <th className="text-right py-3 px-4">Actual</th>
                    <th className="text-right py-3 px-4">Variance</th>
                    <th className="text-right py-3 px-4">Achievement</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetPerformance.map((budget, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{budget.budget_name}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(budget.budgeted_amount)}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(budget.actual_amount)}</td>
                      <td className={`py-3 px-4 text-right ${budget.budgeted_amount - budget.actual_amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(budget.budgeted_amount - budget.actual_amount)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          budget.achievement_percentage <= 75 ? 'bg-green-100 text-green-800' :
                          budget.achievement_percentage <= 100 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {budget.achievement_percentage.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
