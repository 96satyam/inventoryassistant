/**
 * Data Normalization Utility
 * Ensures consistent data formats across local and public URL deployments
 * Handles different API response formats and field name variations
 */

export interface NormalizedInventoryItem {
  name: string;
  available: number;
  required: number;
  category?: string;
}

export interface NormalizedForecastItem {
  model: string;
  qty: number;
  urgency?: number;
  is_urgent?: boolean;
  confidence?: number;
}

export interface NormalizedStats {
  total_skus: number;
  healthy_stock: number;
  low_stock: number;
  forecasted: number;
  total_value: number;
  avg_lead_time: number;
  procurement_efficiency: number;
  stock_turnover: number;
}

export interface NormalizedProcurementLog {
  timestamp: string;
  items: Record<string, number>;
  vendor?: string;
  status?: string;
  total_cost?: number;
}

/**
 * Normalize inventory data from various API formats
 */
export function normalizeInventoryData(data: any[]): NormalizedInventoryItem[] {
  if (!Array.isArray(data)) {
    console.warn('⚠️ Invalid inventory data format, expected array:', data);
    return [];
  }

  return data.map((item: any) => ({
    name: String(item.name || item.model || item.component || 'Unknown'),
    available: Number(item.available || item.available_qty || item.stock || item.quantity || 0),
    required: Number(item.required || item.required_qty || item.demand || item.needed || 0),
    category: String(item.category || item.type || '').trim() || undefined
  })).filter(item => item.name !== 'Unknown' && item.name.trim() !== '');
}

/**
 * Normalize forecast data from various API formats
 */
export function normalizeForecastData(data: any): NormalizedForecastItem[] {
  console.log('🔄 Normalizing forecast data:', data);

  // Handle different response formats
  let items: any[] = [];

  if (Array.isArray(data)) {
    items = data;
  } else if (data && typeof data === 'object') {
    // Handle object format like {urgent: [...], normal: [...]}
    if (data.urgent && data.normal) {
      items = [...(data.urgent || []), ...(data.normal || [])];
    } else if (data.items) {
      items = data.items;
    } else {
      // Handle key-value object format
      items = Object.entries(data).map(([model, qty]) => ({
        model: String(model),
        qty: Number(qty) || 0
      }));
    }
  }

  const normalized = items.map((item: any) => ({
    model: String(item.model || item.name || item.component || 'Unknown'),
    qty: Number(item.qty || item.quantity || item.demand || item.shortage || 0),
    urgency: item.urgency ? Number(item.urgency) : undefined,
    is_urgent: item.is_urgent ? Boolean(item.is_urgent) : undefined,
    confidence: item.confidence ? Number(item.confidence) : undefined
  })).filter(item => item.model !== 'Unknown' && item.model.trim() !== '' && item.qty > 0);

  console.log('✅ Normalized forecast data:', normalized);
  return normalized;
}

/**
 * Normalize stats data from various API formats
 */
export function normalizeStatsData(data: any): NormalizedStats {
  console.log('🔄 Normalizing stats data:', data);

  // Handle different API response formats
  const normalized: NormalizedStats = {
    total_skus: Number(data.total_skus || data.total_items || data.totalItems || 0),
    healthy_stock: Number(data.healthy_stock || data.healthy_stock_items || data.healthyStock || 0),
    low_stock: Number(data.low_stock || data.low_stock_items || data.lowStock || 0),
    forecasted: Number(data.forecasted || data.forecasted_items || data.forecastedItems || 0),
    total_value: Number(data.total_value || data.totalValue || data.value || 0),
    avg_lead_time: Number(data.avg_lead_time || data.avgLeadTime || data.leadTime || 14),
    procurement_efficiency: Number(data.procurement_efficiency || data.efficiency || data.procurementEfficiency || 85),
    stock_turnover: Number(data.stock_turnover || data.stockTurnover || data.turnover || 4.0)
  };

  console.log('✅ Normalized stats data:', normalized);
  return normalized;
}

/**
 * Normalize procurement logs from various API formats
 */
export function normalizeProcurementLogs(data: any): NormalizedProcurementLog[] {
  console.log('🔄 Normalizing procurement logs:', data);

  let logs: any[] = [];

  if (Array.isArray(data)) {
    logs = data;
  } else if (data && data.logs && Array.isArray(data.logs)) {
    logs = data.logs;
  } else if (data && typeof data === 'object') {
    // Single log object
    logs = [data];
  }

  const normalized = logs.map((log: any) => ({
    timestamp: log.timestamp || log.date || new Date().toISOString(),
    items: log.items || log.components || {},
    vendor: log.vendor || log.supplier || undefined,
    status: log.status || log.state || undefined,
    total_cost: log.total_cost || log.totalCost || log.cost || undefined
  })).filter(log => log.items && Object.keys(log.items).length > 0);

  console.log('✅ Normalized procurement logs:', normalized);
  return normalized;
}

/**
 * Detect data source and log for debugging
 */
export function logDataSource(endpoint: string, data: any, source: 'api' | 'fallback' = 'api') {
  const usingFallback = (window as any).__USING_FALLBACK;
  const environmentType = (window as any).__ENVIRONMENT_TYPE || 'local';
  
  console.log(`📊 Data Source [${environmentType}]:`, {
    endpoint,
    source: usingFallback ? 'fallback' : source,
    dataType: Array.isArray(data) ? 'array' : typeof data,
    itemCount: Array.isArray(data) ? data.length : Object.keys(data || {}).length,
    sampleKeys: Array.isArray(data) && data.length > 0 ? Object.keys(data[0]) : Object.keys(data || {})
  });
}

/**
 * Validate data consistency across environments
 */
export function validateDataConsistency(data: any, expectedType: 'inventory' | 'forecast' | 'stats' | 'logs'): boolean {
  if (!data) {
    console.warn(`⚠️ No data provided for ${expectedType} validation`);
    return false;
  }

  switch (expectedType) {
    case 'inventory':
      return Array.isArray(data) && data.every(item => 
        item && typeof item === 'object' && 
        (item.name || item.model) && 
        typeof (item.available || item.stock) === 'number'
      );
    
    case 'forecast':
      const items = Array.isArray(data) ? data : 
                   (data.urgent && data.normal) ? [...data.urgent, ...data.normal] :
                   data.items ? data.items : [];
      return Array.isArray(items) && items.every(item =>
        item && typeof item === 'object' &&
        (item.model || item.name) &&
        typeof (item.qty || item.quantity) === 'number'
      );
    
    case 'stats':
      return data && typeof data === 'object' && 
             (data.total_skus || data.total_items || data.efficiency);
    
    case 'logs':
      const logs = Array.isArray(data) ? data : data.logs ? data.logs : [];
      return Array.isArray(logs) && logs.every(log =>
        log && typeof log === 'object' && 
        (log.timestamp || log.date) && 
        (log.items || log.components)
      );
    
    default:
      return false;
  }
}
