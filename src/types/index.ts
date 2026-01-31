export interface User {
  _id: string
  email: string
  full_name: string
  role: 'admin' | 'portal_user'
  contact_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
  last_login?: string
}

export interface Contact {
  _id: string
  name: string
  email?: string
  phone?: string
  contact_type: 'customer' | 'vendor' | 'both'
  company_name?: string
  gstin?: string
  pan?: string
  billing_address?: Address
  shipping_address?: Address
  credit_limit: number
  payment_terms: number
  notes?: string
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface Address {
  street?: string
  city?: string
  state?: string
  pincode?: string
  country?: string
}

export interface Product {
  _id: string
  name: string
  sku: string
  description?: string
  product_type: 'goods' | 'service'
  category?: string
  unit: string
  purchase_price: number
  sale_price: number
  tax_rate: number
  hsn_code?: string
  default_analytical_account_id?: string
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface AnalyticalAccount {
  _id: string
  code: string
  name: string
  description?: string
  account_type: 'income' | 'expense' | 'both'
  parent_id?: string
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface Budget {
  _id: string
  name: string
  analytical_account_id: string
  analytical_account?: AnalyticalAccount
  budget_type: 'income' | 'expense'
  period_start: string
  period_end: string
  budgeted_amount: number
  description?: string
  is_archived: boolean
  actual_amount?: number
  remaining_balance?: number
  achievement_percentage?: number
  created_at: string
  updated_at: string
}

export interface BudgetRevision {
  _id: string
  budget_id: string
  previous_amount: number
  new_amount: number
  reason?: string
  revised_by: string
  created_at: string
}

export interface AutoAnalyticalModel {
  _id: string
  name: string
  description?: string
  rule_type: 'product_category' | 'product' | 'contact' | 'amount_range'
  rule_value: string
  analytical_account_id: string
  analytical_account?: AnalyticalAccount
  priority: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface OrderItem {
  product_id: string
  product_name: string
  product_sku: string
  quantity: number
  unit: string
  unit_price: number
  tax_rate: number
  subtotal: number
  tax_amount: number
  total: number
}

export interface PurchaseOrder {
  _id: string
  po_number: string
  vendor_id: string
  vendor?: Contact
  order_date: string
  expected_date?: string
  status: 'draft' | 'confirmed' | 'received' | 'cancelled'
  items: OrderItem[]
  subtotal: number
  tax_amount: number
  total_amount: number
  notes?: string
  analytical_account_id?: string
  analytical_account?: AnalyticalAccount
  document_url?: string
  created_at: string
  updated_at: string
}

export interface VendorBill {
  _id: string
  bill_number: string
  vendor_bill_number?: string
  vendor_id: string
  vendor?: Contact
  purchase_order_id?: string
  bill_date: string
  due_date?: string
  status: 'draft' | 'posted' | 'cancelled'
  payment_status: 'not_paid' | 'partially_paid' | 'paid'
  items: OrderItem[]
  subtotal: number
  tax_amount: number
  total_amount: number
  amount_paid: number
  amount_due: number
  notes?: string
  analytical_account_id?: string
  analytical_account?: AnalyticalAccount
  document_url?: string
  created_at: string
  updated_at: string
}

export interface SalesOrder {
  _id: string
  so_number: string
  customer_id: string
  customer?: Contact
  order_date: string
  delivery_date?: string
  expected_delivery_date?: string
  status: 'draft' | 'confirmed' | 'delivered' | 'cancelled'
  items: OrderItem[]
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  shipping_address?: Address
  notes?: string
  analytical_account_id?: string
  analytical_account?: AnalyticalAccount
  document_url?: string
  created_at: string
  updated_at: string
}

export interface CustomerInvoice {
  _id: string
  invoice_number: string
  customer_id: string
  customer?: Contact
  sales_order_id?: string
  invoice_date: string
  due_date?: string
  status: 'draft' | 'posted' | 'cancelled'
  payment_status: 'not_paid' | 'partially_paid' | 'paid'
  items: OrderItem[]
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  amount_paid: number
  amount_due: number
  notes?: string
  analytical_account_id?: string
  analytical_account?: AnalyticalAccount
  document_url?: string
  created_at: string
  updated_at: string
}

export interface Payment {
  _id: string
  payment_number: string
  payment_type: 'incoming' | 'outgoing'
  payment_method: string
  contact_id?: string
  contact?: Contact
  invoice_id?: string
  bill_id?: string
  payment_date: string
  amount: number
  reference_number?: string
  notes?: string
  is_reconciled: boolean
  created_at: string
  updated_at: string
}

export interface DashboardSummary {
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

export interface BudgetPerformance {
  budget_id: string
  budget_name: string
  budget_type: string
  analytical_account_id?: string
  analytical_account_name?: string
  analytical_account_code?: string
  period_start: string
  period_end: string
  budgeted_amount: number
  actual_amount: number
  remaining_balance: number
  achievement_percentage: number
  variance: number
}

export interface PaginatedResponse<T> {
  total: number
  page: number
  per_page: number
  total_pages: number
  [key: string]: T[] | number
}
