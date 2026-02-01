'use client'

import { useEffect, useState } from 'react'
import { portalApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import Header from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Mail, Phone, Building, MapPin, Save } from 'lucide-react'
import toast from 'react-hot-toast'

interface ProfileData {
  name: string
  email: string
  phone: string
  company_name: string
  billing_address: {
    street: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  shipping_address: {
    street: string
    city: string
    state: string
    postal_code: string
    country: string
  }
}

export default function PortalProfilePage() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    billing_address: {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'India',
    },
    shipping_address: {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'India',
    },
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await portalApi.getProfile()
        if (response.data) {
          setProfile({
            name: response.data.name || '',
            email: response.data.email || '',
            phone: response.data.phone || '',
            company_name: response.data.company_name || '',
            billing_address: response.data.billing_address || {
              street: '',
              city: '',
              state: '',
              postal_code: '',
              country: 'India',
            },
            shipping_address: response.data.shipping_address || {
              street: '',
              city: '',
              state: '',
              postal_code: '',
              country: 'India',
            },
          })
        }
      } catch (error) {
        toast.error('Failed to fetch profile')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      await portalApi.updateProfile(profile)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

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
        title="My Profile"
        breadcrumbs={[{ label: 'Portal', href: '/portal' }, { label: 'Profile' }]}
      />

      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                value={profile.company_name}
                onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Billing Address
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="billing_street">Street Address</Label>
              <Input
                id="billing_street"
                value={profile.billing_address.street}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    billing_address: { ...profile.billing_address, street: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="billing_city">City</Label>
              <Input
                id="billing_city"
                value={profile.billing_address.city}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    billing_address: { ...profile.billing_address, city: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="billing_state">State</Label>
              <Input
                id="billing_state"
                value={profile.billing_address.state}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    billing_address: { ...profile.billing_address, state: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="billing_postal">Postal Code</Label>
              <Input
                id="billing_postal"
                value={profile.billing_address.postal_code}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    billing_address: { ...profile.billing_address, postal_code: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="billing_country">Country</Label>
              <Input
                id="billing_country"
                value={profile.billing_address.country}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    billing_address: { ...profile.billing_address, country: e.target.value },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="shipping_street">Street Address</Label>
              <Input
                id="shipping_street"
                value={profile.shipping_address.street}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    shipping_address: { ...profile.shipping_address, street: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="shipping_city">City</Label>
              <Input
                id="shipping_city"
                value={profile.shipping_address.city}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    shipping_address: { ...profile.shipping_address, city: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="shipping_state">State</Label>
              <Input
                id="shipping_state"
                value={profile.shipping_address.state}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    shipping_address: { ...profile.shipping_address, state: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="shipping_postal">Postal Code</Label>
              <Input
                id="shipping_postal"
                value={profile.shipping_address.postal_code}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    shipping_address: { ...profile.shipping_address, postal_code: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="shipping_country">Country</Label>
              <Input
                id="shipping_country"
                value={profile.shipping_address.country}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    shipping_address: { ...profile.shipping_address, country: e.target.value },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
