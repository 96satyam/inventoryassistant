/**
 * Fallback data for when backend is not available
 * Used during development or when API is unreachable
 */

export const FALLBACK_STATS = {
  total_skus: 156,
  healthy_stock: 89,
  low_stock: 45,
  forecasted: 22,
  total_value: 2450000,
  avg_lead_time: 14,
  procurement_efficiency: 87.5,
  stock_turnover: 4.2
}

export const FALLBACK_INVENTORY = [
  { name: "SolarMax Pro 450W", available: 150, required: 200 },
  { name: "PowerInverter Elite 6kW", available: 45, required: 80 },
  { name: "EnergyStore Plus 12kWh", available: 25, required: 60 },
  { name: "MountSecure Pro Rails", available: 300, required: 250 },
  { name: "SafeConnect DC Box", available: 12, required: 35 },
  { name: "GridTie AC Switch", available: 8, required: 40 },
  { name: "GroundShield Kit", available: 55, required: 50 },
  { name: "SmartMonitor Pro", available: 18, required: 30 },
  { name: "CableGuard System", available: 200, required: 180 },
  { name: "SafetyFirst Kit", available: 75, required: 100 }
]

export const FALLBACK_FORECAST = [
  { model: "SolarMax Pro 450W", qty: 120 },
  { model: "PowerInverter Elite 6kW", qty: 85 },
  { model: "EnergyStore Plus 12kWh", qty: 65 },
  { model: "MountSecure Pro Rails", qty: 200 },
  { model: "SafeConnect DC Box", qty: 45 },
  { model: "GridTie AC Switch", qty: 55 },
  { model: "GroundShield Kit", qty: 40 },
  { model: "SmartMonitor Pro", qty: 35 },
  { model: "CableGuard System", qty: 150 },
  { model: "SafetyFirst Kit", qty: 60 }
]

export const FALLBACK_LOGS = [
  {
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    items: {
      "Solar Panel 400W": 50,
      "Inverter 5kW": 20,
      "Battery 10kWh": 15
    }
  },
  {
    timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    items: {
      "Mounting Rails": 100,
      "DC Combiner Box": 25,
      "Monitoring System": 10
    }
  },
  {
    timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    items: {
      "AC Disconnect Switch": 30,
      "Grounding Equipment": 40,
      "Cable Management": 80
    }
  }
]

/**
 * Check if backend is available
 * @param baseUrl - The API base URL to check
 * @returns Promise<boolean> - true if backend is available
 */
export async function isBackendAvailable(baseUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      timeout: 5000, // 5 second timeout
    } as any)
    return response.ok
  } catch (error) {
    console.log('Backend not available, using fallback data')
    return false
  }
}

/**
 * Get data with fallback
 * @param apiCall - Function that makes the API call
 * @param fallbackData - Fallback data to use if API fails
 * @returns Promise with either API data or fallback data
 */
export async function getDataWithFallback<T>(
  apiCall: () => Promise<T>,
  fallbackData: T
): Promise<T> {
  try {
    return await apiCall()
  } catch (error) {
    console.log('API call failed, using fallback data:', error)
    return fallbackData
  }
}
