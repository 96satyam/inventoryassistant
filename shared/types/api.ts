// Shared API types for both frontend and backend

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  brand: string;
  quantity: number;
  unit: string;
  price?: number;
  vendor?: string;
  lastUpdated: string;
}

export interface ForecastData {
  item: string;
  predicted_quantity: number;
  confidence: number;
  urgency: 'high' | 'medium' | 'low';
  brand: string;
}

export interface ProcurementActivity {
  id: string;
  item: string;
  quantity: number;
  vendor: string;
  status: 'pending' | 'ordered' | 'delivered' | 'cancelled';
  date: string;
  cost?: number;
}

export interface VendorData {
  name: string;
  items: string[];
  contact?: string;
  email?: string;
  rating?: number;
}

export interface ProjectData {
  id: string;
  name: string;
  status: 'planning' | 'in-progress' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  components: InventoryItem[];
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  lastLogin?: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
  expiresIn: number;
}

export interface ChangeLogEntry {
  id: string;
  timestamp: string;
  field: string;
  oldValue: any;
  newValue: any;
  user?: string;
  source: 'manual' | 'system' | 'import';
}
