import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    return Promise.reject(error)
  }
)

export default api

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; full_name: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    }),
}

export const usersApi = {
  getAll: (params?: any) => api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  toggleActive: (id: string) => api.post(`/users/${id}/toggle-active`),
  resetPassword: (id: string) => api.post(`/users/${id}/reset-password`),
}

export const contactsApi = {
  getAll: (params?: any) => api.get('/contacts', { params }),
  getById: (id: string) => api.get(`/contacts/${id}`),
  create: (data: any) => api.post('/contacts', data),
  update: (id: string, data: any) => api.put(`/contacts/${id}`, data),
  delete: (id: string) => api.delete(`/contacts/${id}`),
  archive: (id: string) => api.post(`/contacts/${id}/archive`),
  getCustomers: () => api.get('/contacts/customers'),
  getVendors: () => api.get('/contacts/vendors'),
}

export const productsApi = {
  getAll: (params?: any) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  archive: (id: string) => api.post(`/products/${id}/archive`),
  getCategories: () => api.get('/products/categories'),
}

export const analyticalAccountsApi = {
  getAll: (params?: any) => api.get('/analytical-accounts', { params }),
  getById: (id: string) => api.get(`/analytical-accounts/${id}`),
  create: (data: any) => api.post('/analytical-accounts', data),
  update: (id: string, data: any) => api.put(`/analytical-accounts/${id}`, data),
  delete: (id: string) => api.delete(`/analytical-accounts/${id}`),
  archive: (id: string) => api.post(`/analytical-accounts/${id}/archive`),
  getTree: () => api.get('/analytical-accounts/tree'),
}

export const budgetsApi = {
  getAll: (params?: any) => api.get('/budgets', { params }),
  getById: (id: string) => api.get(`/budgets/${id}`),
  create: (data: any) => api.post('/budgets', data),
  update: (id: string, data: any) => api.put(`/budgets/${id}`, data),
  delete: (id: string) => api.delete(`/budgets/${id}`),
  archive: (id: string) => api.post(`/budgets/${id}/archive`),
  getPerformance: (id: string) => api.get(`/budgets/${id}/performance`),
  getAllPerformance: (params?: any) => api.get('/budgets/performance', { params }),
}

export const autoAnalyticalModelsApi = {
  getAll: (params?: any) => api.get('/auto-analytical-models', { params }),
  getById: (id: string) => api.get(`/auto-analytical-models/${id}`),
  create: (data: any) => api.post('/auto-analytical-models', data),
  update: (id: string, data: any) => api.put(`/auto-analytical-models/${id}`, data),
  delete: (id: string) => api.delete(`/auto-analytical-models/${id}`),
  toggleActive: (id: string) => api.post(`/auto-analytical-models/${id}/toggle-active`),
  getRuleTypes: () => api.get('/auto-analytical-models/rule-types'),
}

export const purchaseOrdersApi = {
  getAll: (params?: any) => api.get('/purchase-orders', { params }),
  getById: (id: string) => api.get(`/purchase-orders/${id}`),
  create: (data: any) => api.post('/purchase-orders', data),
  update: (id: string, data: any) => api.put(`/purchase-orders/${id}`, data),
  delete: (id: string) => api.delete(`/purchase-orders/${id}`),
  confirm: (id: string) => api.post(`/purchase-orders/${id}/confirm`),
  receive: (id: string) => api.post(`/purchase-orders/${id}/receive`),
  cancel: (id: string) => api.post(`/purchase-orders/${id}/cancel`),
  generatePdf: (id: string) => api.get(`/purchase-orders/${id}/pdf`),
}

export const vendorBillsApi = {
  getAll: (params?: any) => api.get('/vendor-bills', { params }),
  getById: (id: string) => api.get(`/vendor-bills/${id}`),
  create: (data: any) => api.post('/vendor-bills', data),
  update: (id: string, data: any) => api.put(`/vendor-bills/${id}`, data),
  delete: (id: string) => api.delete(`/vendor-bills/${id}`),
  post: (id: string) => api.post(`/vendor-bills/${id}/post`),
  cancel: (id: string) => api.post(`/vendor-bills/${id}/cancel`),
  generatePdf: (id: string) => api.get(`/vendor-bills/${id}/pdf`),
}

export const salesOrdersApi = {
  getAll: (params?: any) => api.get('/sales-orders', { params }),
  getById: (id: string) => api.get(`/sales-orders/${id}`),
  create: (data: any) => api.post('/sales-orders', data),
  update: (id: string, data: any) => api.put(`/sales-orders/${id}`, data),
  delete: (id: string) => api.delete(`/sales-orders/${id}`),
  confirm: (id: string) => api.post(`/sales-orders/${id}/confirm`),
  deliver: (id: string) => api.post(`/sales-orders/${id}/deliver`),
  cancel: (id: string) => api.post(`/sales-orders/${id}/cancel`),
  generatePdf: (id: string) => api.get(`/sales-orders/${id}/pdf`),
}

export const customerInvoicesApi = {
  getAll: (params?: any) => api.get('/customer-invoices', { params }),
  getById: (id: string) => api.get(`/customer-invoices/${id}`),
  create: (data: any) => api.post('/customer-invoices', data),
  update: (id: string, data: any) => api.put(`/customer-invoices/${id}`, data),
  delete: (id: string) => api.delete(`/customer-invoices/${id}`),
  post: (id: string) => api.post(`/customer-invoices/${id}/post`),
  cancel: (id: string) => api.post(`/customer-invoices/${id}/cancel`),
  generatePdf: (id: string) => api.get(`/customer-invoices/${id}/pdf`),
  sendEmail: (id: string) => api.post(`/customer-invoices/${id}/send-email`),
}

export const paymentsApi = {
  getAll: (params?: any) => api.get('/payments', { params }),
  getById: (id: string) => api.get(`/payments/${id}`),
  create: (data: any) => api.post('/payments', data),
  update: (id: string, data: any) => api.put(`/payments/${id}`, data),
  delete: (id: string) => api.delete(`/payments/${id}`),
  reconcile: (id: string) => api.post(`/payments/${id}/reconcile`),
  getMethods: () => api.get('/payments/methods'),
}

export const reportsApi = {
  getDashboard: () => api.get('/reports/dashboard'),
  getBudgetPerformance: (params?: any) => api.get('/reports/budget-performance', { params }),
  getMonthlyTrends: (year?: number) => api.get('/reports/monthly-trends', { params: { year } }),
  getSalesSummary: (params?: any) => api.get('/reports/sales-summary', { params }),
  getPurchaseSummary: (params?: any) => api.get('/reports/purchase-summary', { params }),
  getAnalyticalAccountSummary: (params?: any) => api.get('/reports/analytical-account-summary', { params }),
  getReceivablesAging: () => api.get('/reports/receivables-aging'),
  getPayablesAging: () => api.get('/reports/payables-aging'),
}

export const portalApi = {
  getInvoices: (params?: any) => api.get('/portal/invoices', { params }),
  getInvoice: (id: string) => api.get(`/portal/invoices/${id}`),
  downloadInvoice: (id: string) => api.get(`/portal/invoices/${id}/download`),
  getBills: (params?: any) => api.get('/portal/bills', { params }),
  downloadBill: (id: string) => api.get(`/portal/bills/${id}/download`),
  getSalesOrders: (params?: any) => api.get('/portal/sales-orders', { params }),
  downloadSalesOrder: (id: string) => api.get(`/portal/sales-orders/${id}/download`),
  getPurchaseOrders: (params?: any) => api.get('/portal/purchase-orders', { params }),
  downloadPurchaseOrder: (id: string) => api.get(`/portal/purchase-orders/${id}/download`),
  getProfile: () => api.get('/portal/profile'),
  updateProfile: (data: any) => api.put('/portal/profile', data),
  getSummary: () => api.get('/portal/summary'),
  // Razorpay payment
  getRazorpayKey: () => api.get('/portal/payments/razorpay-key'),
  createPaymentOrder: (invoiceId: string) => api.post(`/portal/invoices/${invoiceId}/create-payment-order`),
  verifyPayment: (invoiceId: string, data: any) => api.post(`/portal/invoices/${invoiceId}/verify-payment`, data),
}

export const filesApi = {
  upload: (file: File, folder?: string) => {
    const formData = new FormData()
    formData.append('file', file)
    if (folder) formData.append('folder', folder)
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  delete: (blobName: string) => api.delete('/files/delete', { data: { blob_name: blobName } }),
}

export const notificationsApi = {
  getAll: (params?: any) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: string) => api.post(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
}

export const aiApi = {
  suggestRuleValue: (name: string, rule_type: string) => 
    api.post('/auto-analytical-models/suggest-rule-value', { name, rule_type }),
}
