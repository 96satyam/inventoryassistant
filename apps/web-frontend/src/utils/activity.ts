/* --------------------  ACTIVITY TRACKING UTILITIES  -------------------- */

export interface ActivityEvent {
  id: string
  userId: string
  type: 'login' | 'logout' | 'page_view' | 'action' | 'error' | 'system'
  action: string
  description: string
  metadata?: Record<string, any>
  timestamp: string
  ip?: string
  userAgent?: string
  duration?: number
}

export interface ActivityStats {
  totalEvents: number
  todayEvents: number
  weeklyEvents: number
  monthlyEvents: number
  topActions: { action: string; count: number }[]
  userActivity: { hour: number; count: number }[]
  errorRate: number
  averageSessionDuration: number
}

export interface SystemMetrics {
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  networkLatency: number
  activeUsers: number
  systemUptime: string
  lastBackup: string
  databaseSize: string
}

// Mock activity data for demonstration
let MOCK_ACTIVITIES: ActivityEvent[] = [
  {
    id: '1',
    userId: '1',
    type: 'login',
    action: 'user_login',
    description: 'User logged in successfully',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0...'
  },
  {
    id: '2',
    userId: '1',
    type: 'page_view',
    action: 'dashboard_view',
    description: 'Viewed dashboard page',
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    metadata: { page: '/dashboard', loadTime: 1200 }
  },
  {
    id: '3',
    userId: '1',
    type: 'action',
    action: 'inventory_export',
    description: 'Exported inventory data to CSV',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    metadata: { format: 'csv', recordCount: 150 }
  },
  {
    id: '4',
    userId: '1',
    type: 'system',
    action: 'data_sync',
    description: 'Synchronized inventory data',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    metadata: { source: 'api', recordsUpdated: 25 }
  },
  {
    id: '5',
    userId: '1',
    type: 'error',
    action: 'api_error',
    description: 'Failed to fetch forecast data',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    metadata: { error: 'Network timeout', endpoint: '/api/forecast' }
  }
]

// Generate more mock data for charts
const generateMockActivities = (): void => {
  const actions = [
    'dashboard_view', 'inventory_check', 'forecast_generate', 'procurement_create',
    'user_login', 'data_export', 'settings_update', 'notification_read'
  ]
  
  const types: ActivityEvent['type'][] = ['page_view', 'action', 'login', 'system']
  
  for (let i = 0; i < 100; i++) {
    const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    const action = actions[Math.floor(Math.random() * actions.length)]
    const type = types[Math.floor(Math.random() * types.length)]
    
    MOCK_ACTIVITIES.push({
      id: `mock_${i}`,
      userId: '1',
      type,
      action,
      description: `${action.replace('_', ' ')} performed`,
      timestamp: timestamp.toISOString(),
      metadata: { generated: true }
    })
  }
}

// Initialize mock data
generateMockActivities()

/* ---------- Activity Tracking Functions ---------- */

export const trackActivity = async (event: Omit<ActivityEvent, 'id' | 'timestamp'>): Promise<void> => {
  const newEvent: ActivityEvent = {
    ...event,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString()
  }
  
  MOCK_ACTIVITIES.unshift(newEvent)
  
  // Keep only last 1000 events
  if (MOCK_ACTIVITIES.length > 1000) {
    MOCK_ACTIVITIES = MOCK_ACTIVITIES.slice(0, 1000)
  }
  
  console.log('📊 Activity tracked:', newEvent)
}

export const getActivities = async (
  limit: number = 50,
  offset: number = 0,
  filters?: {
    userId?: string
    type?: ActivityEvent['type']
    action?: string
    startDate?: string
    endDate?: string
  }
): Promise<{ activities: ActivityEvent[]; total: number }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  let filteredActivities = [...MOCK_ACTIVITIES]
  
  if (filters) {
    if (filters.userId) {
      filteredActivities = filteredActivities.filter(a => a.userId === filters.userId)
    }
    if (filters.type) {
      filteredActivities = filteredActivities.filter(a => a.type === filters.type)
    }
    if (filters.action) {
      filteredActivities = filteredActivities.filter(a => a.action.includes(filters.action))
    }
    if (filters.startDate) {
      filteredActivities = filteredActivities.filter(a => a.timestamp >= filters.startDate!)
    }
    if (filters.endDate) {
      filteredActivities = filteredActivities.filter(a => a.timestamp <= filters.endDate!)
    }
  }
  
  const total = filteredActivities.length
  const activities = filteredActivities.slice(offset, offset + limit)
  
  return { activities, total }
}

export const getActivityStats = async (): Promise<ActivityStats> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  const todayEvents = MOCK_ACTIVITIES.filter(a => new Date(a.timestamp) >= today).length
  const weeklyEvents = MOCK_ACTIVITIES.filter(a => new Date(a.timestamp) >= weekAgo).length
  const monthlyEvents = MOCK_ACTIVITIES.filter(a => new Date(a.timestamp) >= monthAgo).length
  
  // Calculate top actions
  const actionCounts: Record<string, number> = {}
  MOCK_ACTIVITIES.forEach(a => {
    actionCounts[a.action] = (actionCounts[a.action] || 0) + 1
  })
  
  const topActions = Object.entries(actionCounts)
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
  
  // Calculate hourly activity
  const hourlyActivity: Record<number, number> = {}
  MOCK_ACTIVITIES.forEach(a => {
    const hour = new Date(a.timestamp).getHours()
    hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1
  })
  
  const userActivity = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: hourlyActivity[hour] || 0
  }))
  
  // Calculate error rate
  const errorEvents = MOCK_ACTIVITIES.filter(a => a.type === 'error').length
  const errorRate = MOCK_ACTIVITIES.length > 0 ? (errorEvents / MOCK_ACTIVITIES.length) * 100 : 0
  
  // Mock average session duration
  const averageSessionDuration = 45 // minutes
  
  return {
    totalEvents: MOCK_ACTIVITIES.length,
    todayEvents,
    weeklyEvents,
    monthlyEvents,
    topActions,
    userActivity,
    errorRate,
    averageSessionDuration
  }
}

export const getSystemMetrics = async (): Promise<SystemMetrics> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400))
  
  // Mock system metrics
  return {
    cpuUsage: Math.random() * 100,
    memoryUsage: 65 + Math.random() * 20,
    diskUsage: 45 + Math.random() * 30,
    networkLatency: 20 + Math.random() * 50,
    activeUsers: Math.floor(Math.random() * 10) + 1,
    systemUptime: '15 days, 8 hours',
    lastBackup: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    databaseSize: '2.4 GB'
  }
}

/* ---------- Chart Data Functions ---------- */

export const getActivityChartData = async (period: 'day' | 'week' | 'month' = 'week') => {
  const now = new Date()
  let startDate: Date
  let groupBy: 'hour' | 'day'
  
  switch (period) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      groupBy = 'hour'
      break
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      groupBy = 'day'
      break
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      groupBy = 'day'
      break
  }
  
  const filteredActivities = MOCK_ACTIVITIES.filter(a => new Date(a.timestamp) >= startDate)
  
  const groupedData: Record<string, number> = {}
  
  filteredActivities.forEach(activity => {
    const date = new Date(activity.timestamp)
    let key: string
    
    if (groupBy === 'hour') {
      key = `${date.getHours()}:00`
    } else {
      key = date.toLocaleDateString()
    }
    
    groupedData[key] = (groupedData[key] || 0) + 1
  })
  
  return Object.entries(groupedData).map(([time, count]) => ({
    time,
    count
  }))
}

export const getActivityTypeDistribution = async () => {
  const typeCounts: Record<string, number> = {}
  
  MOCK_ACTIVITIES.forEach(activity => {
    typeCounts[activity.type] = (typeCounts[activity.type] || 0) + 1
  })
  
  return Object.entries(typeCounts).map(([type, count]) => ({
    type: type.replace('_', ' ').toUpperCase(),
    count,
    percentage: Math.round((count / MOCK_ACTIVITIES.length) * 100)
  }))
}

/* ---------- Utility Functions ---------- */

export const formatActivityTime = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString()
}

export const getActivityIcon = (type: ActivityEvent['type']): string => {
  switch (type) {
    case 'login': return '🔐'
    case 'logout': return '🚪'
    case 'page_view': return '👁️'
    case 'action': return '⚡'
    case 'error': return '❌'
    case 'system': return '⚙️'
    default: return '📊'
  }
}

export const getActivityColor = (type: ActivityEvent['type']): string => {
  switch (type) {
    case 'login': return 'text-green-600 bg-green-50'
    case 'logout': return 'text-gray-600 bg-gray-50'
    case 'page_view': return 'text-blue-600 bg-blue-50'
    case 'action': return 'text-purple-600 bg-purple-50'
    case 'error': return 'text-red-600 bg-red-50'
    case 'system': return 'text-orange-600 bg-orange-50'
    default: return 'text-slate-600 bg-slate-50'
  }
}
