'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import {
  LayoutDashboard,
  Users,
  FileText,
  ShoppingCart,
  Package,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  Sofa,
  Building2,
  PieChart,
  Receipt,
  CreditCard,
  FolderTree,
  Cog,
} from 'lucide-react'

const adminNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { 
    name: 'Master Data',
    items: [
      { name: 'Contacts', href: '/dashboard/contacts', icon: Building2 },
      { name: 'Products', href: '/dashboard/products', icon: Package },
      { name: 'Analytical Accounts', href: '/dashboard/analytical-accounts', icon: FolderTree },
      { name: 'Budgets', href: '/dashboard/budgets', icon: PieChart },
      { name: 'Auto Analytical Models', href: '/dashboard/auto-analytical-models', icon: Cog },
    ]
  },
  {
    name: 'Transactions',
    items: [
      { name: 'Purchase Orders', href: '/dashboard/purchase-orders', icon: ShoppingCart },
      { name: 'Vendor Bills', href: '/dashboard/vendor-bills', icon: Receipt },
      { name: 'Sales Orders', href: '/dashboard/sales-orders', icon: FileText },
      { name: 'Customer Invoices', href: '/dashboard/invoices', icon: FileText },
      { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
    ]
  },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

const customerPortalNavItems = [
  { name: 'Dashboard', href: '/portal', icon: LayoutDashboard },
  { name: 'My Invoices', href: '/portal/invoices', icon: FileText },
  { name: 'My Orders', href: '/portal/orders', icon: ShoppingCart },
  { name: 'Profile', href: '/portal/profile', icon: Users },
]

const vendorPortalNavItems = [
  { name: 'Dashboard', href: '/portal', icon: LayoutDashboard },
  { name: 'My Bills', href: '/portal/bills', icon: Receipt },
  { name: 'Purchase Orders', href: '/portal/orders', icon: ShoppingCart },
  { name: 'Profile', href: '/portal/profile', icon: Users },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  
  const isAdmin = user?.role === 'admin'
  const isVendor = user?.role === 'vendor'
  
  let navItems = adminNavItems
  if (!isAdmin) {
    navItems = isVendor ? vendorPortalNavItems : customerPortalNavItems
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <div className="flex flex-col h-full w-64 bg-white border-r border-gray-200">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <Sofa className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-gray-900">Shiv Furniture</h1>
          <p className="text-xs text-gray-500">ERP System</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navItems.map((item, index) => (
          <div key={index}>
            {'items' in item ? (
              <div className="mb-4">
                <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {item.name}
                </p>
                {item.items?.map((subItem) => (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-1',
                      pathname === subItem.href
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <subItem.icon className="w-5 h-5" />
                    {subItem.name}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-1',
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium">
              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-500 uppercase">
              {user?.role === 'admin' ? 'SUPER ADMIN' : user?.role === 'vendor' ? 'VENDOR' : 'CUSTOMER'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  )
}
