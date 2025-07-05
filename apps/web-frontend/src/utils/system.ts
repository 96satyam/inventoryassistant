/* --------------------  SYSTEM SETTINGS UTILITIES  -------------------- */

export interface SystemInfo {
  appName: string
  version: string
  buildDate: string
  environment: 'development' | 'staging' | 'production'
  apiVersion: string
  databaseVersion: string
  nodeVersion: string
  lastUpdated: string
}

export interface SystemConfiguration {
  id: string
  category: 'general' | 'security' | 'notifications' | 'integrations' | 'performance'
  name: string
  description: string
  value: any
  type: 'boolean' | 'string' | 'number' | 'select' | 'json'
  options?: string[]
  isEditable: boolean
  requiresRestart: boolean
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical'
  uptime: string
  lastHealthCheck: string
  services: {
    name: string
    status: 'online' | 'offline' | 'degraded'
    responseTime: number
    lastCheck: string
  }[]
  alerts: {
    id: string
    level: 'info' | 'warning' | 'error'
    message: string
    timestamp: string
    resolved: boolean
  }[]
}

export interface BackupInfo {
  lastBackup: string
  backupSize: string
  backupLocation: string
  autoBackupEnabled: boolean
  retentionDays: number
  nextScheduledBackup: string
}

// Mock system data
const SYSTEM_INFO: SystemInfo = {
  appName: 'Solar Installer AI',
  version: '2.1.0',
  buildDate: '2024-07-04',
  environment: 'production',
  apiVersion: 'v2.1',
  databaseVersion: 'PostgreSQL 15.3',
  nodeVersion: 'Node.js 18.17.0',
  lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
}

const SYSTEM_CONFIGURATIONS: SystemConfiguration[] = [
  {
    id: 'app_name',
    category: 'general',
    name: 'Application Name',
    description: 'The display name of the application',
    value: 'Solar Installer AI',
    type: 'string',
    isEditable: true,
    requiresRestart: false
  },
  {
    id: 'auto_refresh',
    category: 'general',
    name: 'Auto Refresh Interval',
    description: 'How often to refresh dashboard data (seconds)',
    value: 20,
    type: 'number',
    isEditable: true,
    requiresRestart: false
  },
  {
    id: 'theme_mode',
    category: 'general',
    name: 'Default Theme',
    description: 'Default theme for new users',
    value: 'system',
    type: 'select',
    options: ['light', 'dark', 'system'],
    isEditable: true,
    requiresRestart: false
  },
  {
    id: 'session_timeout',
    category: 'security',
    name: 'Session Timeout',
    description: 'User session timeout in minutes',
    value: 480,
    type: 'number',
    isEditable: true,
    requiresRestart: false
  },
  {
    id: 'password_policy',
    category: 'security',
    name: 'Enforce Strong Passwords',
    description: 'Require strong passwords for user accounts',
    value: true,
    type: 'boolean',
    isEditable: true,
    requiresRestart: false
  },
  {
    id: 'two_factor_auth',
    category: 'security',
    name: 'Two-Factor Authentication',
    description: 'Enable 2FA for all user accounts',
    value: false,
    type: 'boolean',
    isEditable: true,
    requiresRestart: false
  },
  {
    id: 'email_notifications',
    category: 'notifications',
    name: 'Email Notifications',
    description: 'Send email notifications for important events',
    value: true,
    type: 'boolean',
    isEditable: true,
    requiresRestart: false
  },
  {
    id: 'low_stock_threshold',
    category: 'notifications',
    name: 'Low Stock Alert Threshold',
    description: 'Percentage threshold for low stock alerts',
    value: 20,
    type: 'number',
    isEditable: true,
    requiresRestart: false
  },
  {
    id: 'notification_frequency',
    category: 'notifications',
    name: 'Notification Frequency',
    description: 'How often to send notification summaries',
    value: 'hourly',
    type: 'select',
    options: ['immediate', 'hourly', 'daily', 'weekly'],
    isEditable: true,
    requiresRestart: false
  },
  {
    id: 'api_rate_limit',
    category: 'performance',
    name: 'API Rate Limit',
    description: 'Maximum API requests per minute per user',
    value: 100,
    type: 'number',
    isEditable: true,
    requiresRestart: true
  },
  {
    id: 'cache_duration',
    category: 'performance',
    name: 'Cache Duration',
    description: 'How long to cache API responses (minutes)',
    value: 5,
    type: 'number',
    isEditable: true,
    requiresRestart: false
  },
  {
    id: 'max_file_size',
    category: 'performance',
    name: 'Maximum File Upload Size',
    description: 'Maximum file size for uploads (MB)',
    value: 10,
    type: 'number',
    isEditable: true,
    requiresRestart: true
  }
]

/* ---------- System Information Functions ---------- */

export const getSystemInfo = async (): Promise<SystemInfo> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  return SYSTEM_INFO
}

export const getSystemHealth = async (): Promise<SystemHealth> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const services = [
    {
      name: 'Database',
      status: 'online' as const,
      responseTime: 15 + Math.random() * 10,
      lastCheck: new Date().toISOString()
    },
    {
      name: 'API Server',
      status: 'online' as const,
      responseTime: 25 + Math.random() * 15,
      lastCheck: new Date().toISOString()
    },
    {
      name: 'File Storage',
      status: 'online' as const,
      responseTime: 35 + Math.random() * 20,
      lastCheck: new Date().toISOString()
    },
    {
      name: 'Email Service',
      status: Math.random() > 0.1 ? 'online' as const : 'degraded' as const,
      responseTime: 100 + Math.random() * 50,
      lastCheck: new Date().toISOString()
    },
    {
      name: 'Backup Service',
      status: 'online' as const,
      responseTime: 200 + Math.random() * 100,
      lastCheck: new Date().toISOString()
    }
  ]
  
  const alerts = [
    {
      id: '1',
      level: 'info' as const,
      message: 'System backup completed successfully',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      resolved: true
    },
    {
      id: '2',
      level: 'warning' as const,
      message: 'High memory usage detected (85%)',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      resolved: false
    }
  ]
  
  const hasWarnings = services.some(s => s.status === 'degraded') || alerts.some(a => !a.resolved && a.level === 'warning')
  const hasCritical = services.some(s => s.status === 'offline') || alerts.some(a => !a.resolved && a.level === 'error')
  
  return {
    status: hasCritical ? 'critical' : hasWarnings ? 'warning' : 'healthy',
    uptime: '15 days, 8 hours, 23 minutes',
    lastHealthCheck: new Date().toISOString(),
    services,
    alerts
  }
}

export const getBackupInfo = async (): Promise<BackupInfo> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200))
  
  return {
    lastBackup: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    backupSize: '2.4 GB',
    backupLocation: 'AWS S3 - us-east-1',
    autoBackupEnabled: true,
    retentionDays: 30,
    nextScheduledBackup: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString()
  }
}

/* ---------- Configuration Functions ---------- */

export const getSystemConfigurations = async (category?: string): Promise<SystemConfiguration[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  if (category) {
    return SYSTEM_CONFIGURATIONS.filter(config => config.category === category)
  }
  
  return SYSTEM_CONFIGURATIONS
}

export const updateSystemConfiguration = async (
  id: string, 
  value: any
): Promise<{ success: boolean; message: string; requiresRestart?: boolean }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const config = SYSTEM_CONFIGURATIONS.find(c => c.id === id)
  if (!config) {
    return { success: false, message: 'Configuration not found' }
  }
  
  if (!config.isEditable) {
    return { success: false, message: 'This configuration is not editable' }
  }
  
  // Validate value based on type
  if (config.type === 'boolean' && typeof value !== 'boolean') {
    return { success: false, message: 'Value must be a boolean' }
  }
  
  if (config.type === 'number' && (typeof value !== 'number' || isNaN(value))) {
    return { success: false, message: 'Value must be a valid number' }
  }
  
  if (config.type === 'select' && config.options && !config.options.includes(value)) {
    return { success: false, message: `Value must be one of: ${config.options.join(', ')}` }
  }
  
  // Update the configuration
  config.value = value
  
  return {
    success: true,
    message: 'Configuration updated successfully',
    requiresRestart: config.requiresRestart
  }
}

export const resetSystemConfiguration = async (id: string): Promise<{ success: boolean; message: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const config = SYSTEM_CONFIGURATIONS.find(c => c.id === id)
  if (!config) {
    return { success: false, message: 'Configuration not found' }
  }
  
  // Reset to default value (this would come from a defaults object in a real app)
  const defaults: Record<string, any> = {
    app_name: 'Solar Installer AI',
    auto_refresh: 20,
    theme_mode: 'system',
    session_timeout: 480,
    password_policy: true,
    two_factor_auth: false,
    email_notifications: true,
    low_stock_threshold: 20,
    notification_frequency: 'hourly',
    api_rate_limit: 100,
    cache_duration: 5,
    max_file_size: 10
  }
  
  config.value = defaults[id]
  
  return { success: true, message: 'Configuration reset to default value' }
}

/* ---------- System Actions ---------- */

export const restartSystem = async (): Promise<{ success: boolean; message: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // In a real app, this would trigger a system restart
  console.log('🔄 System restart initiated')
  
  return { success: true, message: 'System restart initiated. Please wait a few moments.' }
}

export const createBackup = async (): Promise<{ success: boolean; message: string; backupId?: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  const backupId = `backup_${Date.now()}`
  console.log('💾 Backup created:', backupId)
  
  return {
    success: true,
    message: 'Backup created successfully',
    backupId
  }
}

export const clearCache = async (): Promise<{ success: boolean; message: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  console.log('🧹 Cache cleared')
  
  return { success: true, message: 'System cache cleared successfully' }
}

/* ---------- Utility Functions ---------- */

export const formatUptime = (uptime: string): string => {
  return uptime
}

export const getHealthStatusColor = (status: SystemHealth['status']): string => {
  switch (status) {
    case 'healthy': return 'text-green-600 bg-green-50 border-green-200'
    case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'critical': return 'text-red-600 bg-red-50 border-red-200'
    default: return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export const getServiceStatusColor = (status: string): string => {
  switch (status) {
    case 'online': return 'text-green-600 bg-green-50'
    case 'degraded': return 'text-yellow-600 bg-yellow-50'
    case 'offline': return 'text-red-600 bg-red-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}

export const getAlertLevelColor = (level: string): string => {
  switch (level) {
    case 'info': return 'text-blue-600 bg-blue-50'
    case 'warning': return 'text-yellow-600 bg-yellow-50'
    case 'error': return 'text-red-600 bg-red-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}
