// Shared API constants

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    PROFILE: '/api/auth/profile',
  },
  
  // Inventory
  INVENTORY: {
    LIST: '/api/inventory',
    ITEM: (id: string) => `/api/inventory/${id}`,
    SEARCH: '/api/inventory/search',
    EXPORT: '/api/inventory/export',
  },
  
  // Forecasting
  FORECAST: {
    GENERATE: '/api/forecast/generate',
    LIST: '/api/forecast',
    TOP_URGENT: '/api/forecast/top-urgent',
  },
  
  // Procurement
  PROCUREMENT: {
    LIST: '/api/procurement',
    CREATE: '/api/procurement',
    UPDATE: (id: string) => `/api/procurement/${id}`,
    ACTIVITY: '/api/procurement/activity',
    SUGGESTIONS: '/api/procurement/suggestions',
  },
  
  // Vendors
  VENDORS: {
    LIST: '/api/vendors',
    DETAILS: (id: string) => `/api/vendors/${id}`,
    ITEMS: (id: string) => `/api/vendors/${id}/items`,
  },
  
  // Projects
  PROJECTS: {
    LIST: '/api/projects',
    CREATE: '/api/projects',
    DETAILS: (id: string) => `/api/projects/${id}`,
    UPDATE: (id: string) => `/api/projects/${id}`,
    DELETE: (id: string) => `/api/projects/${id}`,
  },
  
  // Google Sheets
  SHEETS: {
    SYNC: '/api/sheets/sync',
    CHANGES: '/api/sheets/changes',
    EXPORT: '/api/sheets/export',
  },
  
  // Analytics
  ANALYTICS: {
    DASHBOARD: '/api/analytics/dashboard',
    CHARTS: '/api/analytics/charts',
    REPORTS: '/api/analytics/reports',
  },
  
  // Health
  HEALTH: '/api/health',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const API_ERRORS = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
