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
  DASHBOARD: 5 * 60 * 1000, // 5 minutes
  INVENTORY: 10 * 60 * 1000, // 10 minutes
  NOTIFICATIONS: 60 * 60 * 1000, // 1 hour
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
