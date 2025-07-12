// Shared configuration constants

export const APP_CONFIG = {
  NAME: 'Solar Installer AI',
  VERSION: '2.0.0',
  DESCRIPTION: 'Professional Solar Installation Management System',
  COMPANY: 'WattMonk',
  CONTACT: {
    EMAIL: 'procurement@wattmonk.com',
    PHONE: '+1 (555) 123-4567',
    WEBSITE: 'https://www.wattmonk.com/',
    ADDRESS: 'The Green Suite R, Dover, DE 19901, United States',
  },
} as const;

export const INVENTORY_CATEGORIES = [
  'modules',
  'optimizers', 
  'inverters',
  'batteries',
  'rails',
  'clamps',
  'disconnects',
  'conduits',
] as const;

export const URGENCY_LEVELS = ['high', 'medium', 'low'] as const;

export const PROJECT_STATUSES = [
  'planning',
  'in-progress', 
  'completed',
  'cancelled'
] as const;

export const PROCUREMENT_STATUSES = [
  'pending',
  'ordered',
  'delivered', 
  'cancelled'
] as const;

export const USER_ROLES = ['admin', 'user', 'viewer'] as const;

export const NOTIFICATION_TYPES = [
  'info',
  'success',
  'warning',
  'error'
] as const;

export const REFRESH_INTERVALS = {
  DASHBOARD: 20 * 1000, // 20 seconds (matches current dashboard)
  SHEETS: 5 * 60 * 1000, // 5 minutes (matches current sheets)
  INVENTORY: 10 * 60 * 1000, // 10 minutes
  NOTIFICATIONS: 60 * 60 * 1000, // 1 hour (matches current notification delay)
} as const;

export const CHART_COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#6366f1',
  SUCCESS: '#22c55e',
} as const;

export const GOOGLE_SHEETS_CONFIG = {
  SCOPES: ['https://www.googleapis.com/auth/spreadsheets'],
  DISCOVERY_DOC: 'https://sheets.googleapis.com/$discovery/rest?version=v4',
} as const;

// Display limits for data tables and charts
export const DISPLAY_LIMITS = {
  URGENT_ITEMS: 3, // Top urgent items to show
  FORECAST_CHART: 10, // Items in forecast chart
  FORECAST_TABLE: 10, // Items in forecast table
  PROCUREMENT_LOGS: 20, // Recent procurement logs
  HISTORY_CHART: 8, // Items in history vs forecast chart
  RECENT_ACTIVITY: 10, // Recent activity items
  OVERSTOCKED_ITEMS: 3, // Overstocked items to show
  ANALYTICS_DAYS: 10, // Days to show in analytics
} as const;

// Business logic thresholds
export const BUSINESS_THRESHOLDS = {
  OVERSTOCKED_MULTIPLIER: 2, // 200% of required = overstocked
  FUTURE_INSTALLATIONS: 10, // Number of future installations to forecast
  TOP_URGENT_COUNT: 5, // Top urgent items in forecast
  DEFAULT_ETA_DAYS: 10, // Default ETA for unknown vendors
} as const;
