'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Building2, Mail, CreditCard, Bell, Shield, Palette } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [companySettings, setCompanySettings] = useState({
    name: 'Shiv Furniture',
    email: 'contact@shivfurniture.com',
    phone: '+91 98765 43210',
    address: '123 Furniture Lane, Mumbai, India',
    gst_number: 'GSTIN1234567890',
    pan_number: 'ABCDE1234F',
  })

  const [emailSettings, setEmailSettings] = useState({
    smtp_server: 'smtp.gmail.com',
    smtp_port: '587',
    email_address: '',
    email_password: '',
  })

  const [notificationSettings, setNotificationSettings] = useState({
    email_on_new_order: true,
    email_on_payment: true,
    email_on_low_budget: true,
    email_daily_summary: false,
  })

  const handleSaveCompany = () => {
    toast.success('Company settings saved')
  }

  const handleSaveEmail = () => {
    toast.success('Email settings saved')
  }

  const handleSaveNotifications = () => {
    toast.success('Notification settings saved')
  }

  return (
    <div>
      <Header
        title="Settings"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings' }]}
      />

      <div className="p-6">
        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Company
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  Update your company details that appear on invoices and documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      value={companySettings.name}
                      onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_email">Email</Label>
                    <Input
                      id="company_email"
                      type="email"
                      value={companySettings.email}
                      onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_phone">Phone</Label>
                    <Input
                      id="company_phone"
                      value={companySettings.phone}
                      onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gst_number">GST Number</Label>
                    <Input
                      id="gst_number"
                      value={companySettings.gst_number}
                      onChange={(e) => setCompanySettings({ ...companySettings, gst_number: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pan_number">PAN Number</Label>
                    <Input
                      id="pan_number"
                      value={companySettings.pan_number}
                      onChange={(e) => setCompanySettings({ ...companySettings, pan_number: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_address">Address</Label>
                  <Input
                    id="company_address"
                    value={companySettings.address}
                    onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                  />
                </div>
                <Button onClick={handleSaveCompany}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>
                  Configure SMTP settings for sending emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp_server">SMTP Server</Label>
                    <Input
                      id="smtp_server"
                      value={emailSettings.smtp_server}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtp_server: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp_port">SMTP Port</Label>
                    <Input
                      id="smtp_port"
                      value={emailSettings.smtp_port}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtp_port: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email_address">Email Address</Label>
                    <Input
                      id="email_address"
                      type="email"
                      value={emailSettings.email_address}
                      onChange={(e) => setEmailSettings({ ...emailSettings, email_address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email_password">Email Password</Label>
                    <Input
                      id="email_password"
                      type="password"
                      value={emailSettings.email_password}
                      onChange={(e) => setEmailSettings({ ...emailSettings, email_password: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleSaveEmail}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Order Notifications</p>
                    <p className="text-sm text-gray-500">Receive email when a new order is placed</p>
                  </div>
                  <Switch
                    checked={notificationSettings.email_on_new_order}
                    onCheckedChange={(checked: boolean) =>
                      setNotificationSettings({ ...notificationSettings, email_on_new_order: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Payment Notifications</p>
                    <p className="text-sm text-gray-500">Receive email when a payment is received</p>
                  </div>
                  <Switch
                    checked={notificationSettings.email_on_payment}
                    onCheckedChange={(checked: boolean) =>
                      setNotificationSettings({ ...notificationSettings, email_on_payment: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Low Budget Alerts</p>
                    <p className="text-sm text-gray-500">Receive email when budget utilization exceeds 80%</p>
                  </div>
                  <Switch
                    checked={notificationSettings.email_on_low_budget}
                    onCheckedChange={(checked: boolean) =>
                      setNotificationSettings({ ...notificationSettings, email_on_low_budget: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Daily Summary</p>
                    <p className="text-sm text-gray-500">Receive a daily summary of all activities</p>
                  </div>
                  <Switch
                    checked={notificationSettings.email_daily_summary}
                    onCheckedChange={(checked: boolean) =>
                      setNotificationSettings({ ...notificationSettings, email_daily_summary: checked })
                    }
                  />
                </div>
                <Button onClick={handleSaveNotifications}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Change Password</h3>
                  <div className="grid grid-cols-1 gap-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="current_password">Current Password</Label>
                      <Input id="current_password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new_password">New Password</Label>
                      <Input id="new_password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">Confirm New Password</Label>
                      <Input id="confirm_password" type="password" />
                    </div>
                  </div>
                  <Button>Update Password</Button>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium text-red-600">Danger Zone</h3>
                  <p className="text-sm text-gray-500 mt-1 mb-4">
                    These actions are irreversible. Please be careful.
                  </p>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
