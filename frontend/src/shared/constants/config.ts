/**
 * Application Configuration Constants
 * Centralized configuration for the Solar Installer AI application
 */

// Company Information
export const COMPANY_INFO = {
  NAME: 'WattMonk',
  EMAIL: 'procurement@wattmonk.com',
  PHONE: '+1 (555) 123-4567',
  WEBSITE: 'https://www.wattmonk.com/',
  ADDRESS: 'The Green Suite R, Dover, DE 19901, United States',
} as const;

// Email Configuration
export const EMAIL_CONFIG = {
  RECIPIENTS: [
    'satyam1@wattmonk.com',
    'shivt843@gmail.com', 
    'satyam.tiwari.9695@gmail.com'
  ],
  SENDER: 'procurement@wattmonk.com',
} as const;

// Authentication Configuration
export const AUTH_CONFIG = {
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  REQUIRE_LOGIN_PER_SESSION: true,
} as const;

// Google Sheets Configuration
export const SHEETS_CONFIG = {
  INVENTORY_SHEET_ID: '1aBW1vma8eF1iNzo5_aB3S2a_a7zS4Tp1vWXncvrASls',
  INSTALL_HISTORY_SHEET_ID: '1Pl1eL5jpYZK-QZH3dETWVEfZCW2ASnbEeCuK1V4ZUh8',
  WORKSHEETS: {
    INVENTORY: { name: 'Sheet1', gid: '515566561' },
    INSTALL_HISTORY: { name: 'Sheet2', gid: '390609277' },
  },
} as const;

// API Configuration
export const API_CONFIG = {
  BACKEND_URL: 'http://127.0.0.1:8003',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
} as const;

// Refresh Intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  DASHBOARD: 20 * 1000, // 20 seconds (matches current dashboard)
  SHEETS: 5 * 60 * 1000, // 5 minutes (matches current sheets)
  INVENTORY: 10 * 60 * 1000, // 10 minutes
  NOTIFICATIONS: 60 * 60 * 1000, // 1 hour (matches current notification delay)
} as const;

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#6366f1',
  SUCCESS: '#22c55e',
} as const;

// Google Sheets API Configuration
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

// UI Configuration
export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  TOAST_DURATION: 4000,
} as const;

// Export all configurations as a single object for convenience
export const CONFIG = {
  COMPANY_INFO,
  EMAIL_CONFIG,
  AUTH_CONFIG,
  SHEETS_CONFIG,
  API_CONFIG,
  REFRESH_INTERVALS,
  CHART_COLORS,
  GOOGLE_SHEETS_CONFIG,
  DISPLAY_LIMITS,
  BUSINESS_THRESHOLDS,
  UI_CONFIG,
} as const;

export default CONFIG;
