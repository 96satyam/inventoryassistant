/**
 * Notification Utility Functions
 * Handles all notification-related functionality for the dashboard
 */

export interface NotificationItem {
  id: string
  type: 'low_stock' | 'forecast_alert' | 'procurement' | 'system' | 'warning'
  title: string
  message: string
  timestamp: Date
  read: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
  icon?: string
  actionUrl?: string
}

export interface InventoryRow {
  name: string
  available: number
  required: number
}

export interface ForecastRow {
  model: string
  qty: number
}

export interface LogEntry {
  timestamp: string
  items: Record<string, number>
}

/**
 * Generate notifications from dashboard data
 */
export function generateDashboardNotifications(
  inventory: InventoryRow[],
  forecast: ForecastRow[],
  logs: LogEntry[]
): NotificationItem[] {
  const notifications: NotificationItem[] = []

  // 1. Low Stock Notifications
  const lowStockItems = inventory.filter(item => item.available < item.required)
  if (lowStockItems.length > 0) {
    notifications.push({
      id: `low-stock-${Date.now()}`,
      type: 'low_stock',
      title: `${lowStockItems.length} Low Stock Alert${lowStockItems.length > 1 ? 's' : ''}`,
      message: `${lowStockItems.slice(0, 3).map(item => item.name).join(', ')}${lowStockItems.length > 3 ? ` and ${lowStockItems.length - 3} more` : ''} running low`,
      timestamp: new Date(),
      read: false,
      priority: lowStockItems.length > 5 ? 'critical' : lowStockItems.length > 2 ? 'high' : 'medium',
      icon: '📦',
      actionUrl: '/inventory'
    })
  }

  // 2. Forecast Demand Notifications
  const highDemandItems = forecast.filter(item => item.qty > 10)
  if (highDemandItems.length > 0) {
    notifications.push({
      id: `forecast-${Date.now()}`,
      type: 'forecast_alert',
      title: `High Demand Forecast`,
      message: `${highDemandItems.length} items have high upcoming demand (${highDemandItems.reduce((sum, item) => sum + item.qty, 0)} total units)`,
      timestamp: new Date(),
      read: false,
      priority: 'medium',
      icon: '📈',
      actionUrl: '/forecast'
    })
  }

  // 3. Recent Procurement Activity
  const recentLogs = logs.slice(0, 5)
  if (recentLogs.length > 0) {
    const totalRecentItems = recentLogs.reduce((sum, log) => 
      sum + Object.values(log.items).reduce((logSum, qty) => logSum + Number(qty), 0), 0
    )
    
    notifications.push({
      id: `procurement-${Date.now()}`,
      type: 'procurement',
      title: 'Recent Procurement Activity',
      message: `${totalRecentItems} items processed across ${recentLogs.length} recent transactions`,
      timestamp: new Date(),
      read: false,
      priority: 'low',
      icon: '🛒',
      actionUrl: '/procurement'
    })
  }

  // 4. System Health Notification
  const healthyItems = inventory.filter(item => item.available >= item.required)
  const healthPercentage = Math.round((healthyItems.length / inventory.length) * 100)
  
  if (healthPercentage < 70) {
    notifications.push({
      id: `health-${Date.now()}`,
      type: 'warning',
      title: 'Inventory Health Warning',
      message: `Only ${healthPercentage}% of inventory items are adequately stocked`,
      timestamp: new Date(),
      read: false,
      priority: healthPercentage < 50 ? 'critical' : 'high',
      icon: '⚠️',
      actionUrl: '/dashboard'
    })
  }

  // Sort by priority and timestamp
  return notifications.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
    if (priorityDiff !== 0) return priorityDiff
    return b.timestamp.getTime() - a.timestamp.getTime()
  })
}

/**
 * Get notification count by priority
 */
export function getNotificationCounts(notifications: NotificationItem[]) {
  const unread = notifications.filter(n => !n.read)
  return {
    total: unread.length,
    critical: unread.filter(n => n.priority === 'critical').length,
    high: unread.filter(n => n.priority === 'high').length,
    medium: unread.filter(n => n.priority === 'medium').length,
    low: unread.filter(n => n.priority === 'low').length
  }
}

/**
 * Get priority color for UI display
 */
export function getPriorityColor(priority: NotificationItem['priority']): string {
  switch (priority) {
    case 'critical': return 'text-red-600 bg-red-50 border-red-200'
    case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
    default: return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

/**
 * Get type icon for notification
 */
export function getTypeIcon(type: NotificationItem['type']): string {
  switch (type) {
    case 'low_stock': return '📦'
    case 'forecast_alert': return '📈'
    case 'procurement': return '🛒'
    case 'system': return '⚙️'
    case 'warning': return '⚠️'
    default: return '🔔'
  }
}

/**
 * Format notification timestamp
 */
export function formatNotificationTime(timestamp: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - timestamp.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return timestamp.toLocaleDateString()
}

/**
 * Mark notification as read
 */
export function markAsRead(notifications: NotificationItem[], notificationId: string): NotificationItem[] {
  return notifications.map(notification =>
    notification.id === notificationId
      ? { ...notification, read: true }
      : notification
  )
}

/**
 * Mark all notifications as read
 */
export function markAllAsRead(notifications: NotificationItem[]): NotificationItem[] {
  return notifications.map(notification => ({ ...notification, read: true }))
}

/**
 * Inventory Assistant Modal Types and Utilities
 */
export interface InventoryModalData {
  totalSKUs: InventoryRow[]
  healthyStock: InventoryRow[]
  lowStock: InventoryRow[]
  forecastedItems: ForecastRow[]
}

/**
 * Get inventory modal data organized by category
 */
export function getInventoryModalData(
  inventory: InventoryRow[],
  forecast: ForecastRow[]
): InventoryModalData {
  const healthyStock = inventory.filter(item => item.available >= item.required)
  const lowStock = inventory.filter(item => item.available < item.required)

  return {
    totalSKUs: inventory,
    healthyStock,
    lowStock,
    forecastedItems: forecast
  }
}

/**
 * Get stock status for an item
 */
export function getStockStatus(available: number, required: number): {
  status: 'healthy' | 'low' | 'critical'
  color: string
  icon: string
} {
  const ratio = required > 0 ? available / required : 1

  if (ratio >= 1) {
    return {
      status: 'healthy',
      color: 'text-green-600 bg-green-50 border-green-200',
      icon: '✅'
    }
  } else if (ratio >= 0.5) {
    return {
      status: 'low',
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      icon: '⚠️'
    }
  } else {
    return {
      status: 'critical',
      color: 'text-red-600 bg-red-50 border-red-200',
      icon: '🚨'
    }
  }
}
