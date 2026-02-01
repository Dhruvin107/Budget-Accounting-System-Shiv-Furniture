'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { notificationsApi } from '@/lib/api'
import { Bell, Search, User, Check, CheckCheck } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Notification {
  _id: string
  title: string
  message: string
  type: string
  link?: string
  is_read: boolean
  created_at: string
}

interface HeaderProps {
  title: string
  breadcrumbs?: { label: string; href?: string }[]
}

export default function Header({ title, breadcrumbs }: HeaderProps) {
  const { user } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    try {
      const response = await notificationsApi.getAll({ limit: 10 })
      setNotifications(response.data.notifications || [])
      setUnreadCount(response.data.unread_count || 0)
    } catch (error) {
      console.error('Failed to fetch notifications')
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id)
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, is_read: true } : n
      ))
      setUnreadCount(Math.max(0, unreadCount - 1))
    } catch (error) {
      console.error('Failed to mark notification as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead()
      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read')
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className="flex items-center gap-2">
                  {index > 0 && <span>›</span>}
                  {crumb.href ? (
                    <a href={crumb.href} className="hover:text-blue-600">
                      {crumb.label}
                    </a>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          <div className="relative" ref={notificationRef}>
            <button 
              className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <CheckCheck className="w-3 h-3" />
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div 
                        key={notification._id}
                        className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          !notification.is_read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => {
                          if (!notification.is_read) handleMarkAsRead(notification._id)
                          if (notification.link) window.location.href = notification.link
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm ${!notification.is_read ? 'font-semibold' : ''} text-gray-900`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatTime(notification.created_at)}</p>
                          </div>
                          {!notification.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMarkAsRead(notification._id)
                              }}
                              className="p-1 hover:bg-gray-200 rounded"
                              title="Mark as read"
                            >
                              <Check className="w-3 h-3 text-gray-400" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
