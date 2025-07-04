'use client'

import { motion } from "framer-motion"
import {
  Menu,
  Bell,
  Search,
  Settings,
  User,
  Sun,
  Moon,
  Zap,
  Activity,
  Wifi,
  Database,
  Brain,
  ChevronDown,
  ExternalLink,
  Clock,
  AlertTriangle,
  Package,
  ShoppingCart
} from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  generateDashboardNotifications,
  getNotificationCounts,
  getPriorityColor,
  getTypeIcon,
  formatNotificationTime,
  markAsRead,
  markAllAsRead,
  type NotificationItem
} from "@/lib/notifications"

interface TopbarProps {
  onSidebarToggle: () => void
}

export function Topbar({ onSidebarToggle }: TopbarProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [notificationOpen, setNotificationOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Fetch dashboard data for notifications
  const [dashboardData, setDashboardData] = useState({
    inventory: [],
    forecast: [],
    logs: []
  })

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch dashboard data for notifications
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [invRes, forecastRes, logsRes] = await Promise.all([
          fetch('http://localhost:8000/inventory/').then(r => r.json()).catch(() => []),
          fetch('http://localhost:8000/forecast/').then(r => r.json()).catch(() => []),
          fetch('http://localhost:8000/logs/').then(r => r.json()).catch(() => [])
        ])

        setDashboardData({
          inventory: Array.isArray(invRes) ? invRes.map((r: any) => ({
            name: String(r.name ?? r.model ?? 'Unknown'),
            available: Number(r.available ?? r.available_qty ?? 0),
            required: Number(r.required ?? r.required_qty ?? 0)
          })) : [],
          forecast: Array.isArray(forecastRes) ? forecastRes.map((o: any) => ({
            model: String(o.model ?? o.name ?? 'Unknown'),
            qty: Number(o.qty ?? o.quantity ?? 0)
          })) : [],
          logs: Array.isArray(logsRes) ? logsRes : []
        })
      } catch (error) {
        console.error('Failed to fetch dashboard data for notifications:', error)
      }
    }

    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  // Generate notifications from dashboard data
  useEffect(() => {
    if (dashboardData.inventory.length > 0) {
      const newNotifications = generateDashboardNotifications(
        dashboardData.inventory,
        dashboardData.forecast,
        dashboardData.logs
      )
      setNotifications(newNotifications)
    }
  }, [dashboardData])

  if (!mounted) return null

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 shadow-lg"
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSidebarToggle}
            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 min-w-[300px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Search className="h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search across all modules..."
              className="bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-300 placeholder-slate-500 flex-1"
            />
            <Badge variant="secondary" className="text-xs">
              ⌘K
            </Badge>
          </motion.div>
        </div>

        {/* Center Section - Status Indicators */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="hidden lg:flex items-center gap-4"
        >
          {/* System Status */}
          <div className="flex items-center gap-3 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-green-500 rounded-full"
            />
            <span className="text-xs font-medium text-green-700 dark:text-green-300">
              All Systems Online
            </span>
          </div>

          {/* AI Status */}
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <Brain className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
              AI Active
            </span>
          </div>

          {/* Time Display */}
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {currentTime.toLocaleTimeString()}
          </div>
        </motion.div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <DropdownMenu open={notificationOpen} onOpenChange={setNotificationOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Bell className="h-5 w-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <span className="text-xs text-white font-bold">
                        {Math.min(notifications.filter(n => !n.read).length, 9)}
                      </span>
                    </motion.div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-96 max-h-[500px] p-0"
                sideOffset={8}
              >
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Notifications
                    </h3>
                    {notifications.filter(n => !n.read).length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setNotifications(markAllAsRead(notifications))}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Mark all read
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {notifications.filter(n => !n.read).length} unread notifications
                  </p>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <Bell className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No notifications yet
                      </p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                            notification.read
                              ? 'bg-slate-50 dark:bg-slate-800/50'
                              : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                          } hover:bg-slate-100 dark:hover:bg-slate-700`}
                          onClick={() => {
                            setNotifications(markAsRead(notifications, notification.id))
                            if (notification.actionUrl) {
                              router.push(notification.actionUrl)
                              setNotificationOpen(false)
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-lg">{getTypeIcon(notification.type)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className={`text-sm font-medium ${
                                  notification.read
                                    ? 'text-slate-600 dark:text-slate-400'
                                    : 'text-slate-900 dark:text-white'
                                }`}>
                                  {notification.title}
                                </p>
                                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(notification.priority)}`}>
                                  {notification.priority}
                                </span>
                              </div>
                              <p className={`text-xs mt-1 ${
                                notification.read
                                  ? 'text-slate-500 dark:text-slate-500'
                                  : 'text-slate-600 dark:text-slate-300'
                              }`}>
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-slate-400">
                                  {formatNotificationTime(notification.timestamp)}
                                </span>
                                {notification.actionUrl && (
                                  <ExternalLink className="h-3 w-3 text-slate-400" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>

          {/* Theme Toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-slate-600" />
              )}
            </Button>
          </motion.div>

          {/* User Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Solar Admin
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      System Administrator
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  System Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Activity Log
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                  <Zap className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        </div>
      </div>
    </motion.header>
  )
}
