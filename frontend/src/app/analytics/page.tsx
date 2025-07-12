"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import {
  Activity,
  TrendingUp,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Zap,
  Target,
  Warehouse,
  ShoppingCart
} from 'lucide-react'
import { apiFetch, API_ENDPOINTS } from '@/lib/api-config'
import { DISPLAY_LIMITS } from '@/shared/constants/config'

// Types - Using same interfaces as dashboard for consistency
interface InventoryRow {
  name: string
  available: number
  required: number
}

interface ForecastRow {
  model: string
  qty: number
  urgency?: number
  is_urgent?: boolean
}

interface ProcurementLog {
  timestamp: string
  items: Record<string, number>
  vendor?: string
  status?: string
}

interface AnalyticsData {
  inventory: InventoryRow[]
  forecast: ForecastRow[]
  logs: ProcurementLog[]
}

// Chart color schemes
const COLORS = {
  primary: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
  gradient: ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981']
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({
    inventory: [],
    forecast: [],
    logs: []
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Fetch analytics data with simplified processing
  const fetchAnalyticsData = async () => {
    try {
      const [inventoryRes, forecastRes, logsRes] = await Promise.all([
        apiFetch(API_ENDPOINTS.INVENTORY).then(r => r.json()).catch(() => []),
        apiFetch(API_ENDPOINTS.FORECAST).then(r => r.json()).catch(() => []),
        apiFetch(API_ENDPOINTS.PROCUREMENT_LOGS).then(r => r.json()).catch(() => [])
      ])

      console.log('📊 Raw API responses:', { inventoryRes, forecastRes, logsRes })

      // Simple inventory processing - just use modules data
      const processedInventory: InventoryRow[] = []

      if (Array.isArray(inventoryRes)) {
        inventoryRes.forEach((row: any, index: number) => {
          try {
            // Use the correct field names from the frontend API
            if (row && typeof row === 'object' && row.available !== undefined && row.required !== undefined && row.name) {
              processedInventory.push({
                name: row.name,
                available: Number(row.available) || 0,
                required: Number(row.required) || 0
              })
            }
          } catch (err) {
            console.warn(`Error processing inventory row ${index}:`, err)
          }
        })
      }

      // Simple forecast processing
      const processedForecast = Array.isArray(forecastRes) ? forecastRes.slice(0, DISPLAY_LIMITS.FORECAST_TABLE) : []

      // Simple logs processing
      const processedLogs = Array.isArray(logsRes) ? logsRes.slice(0, DISPLAY_LIMITS.PROCUREMENT_LOGS) : []

      console.log('✅ Processed data:', {
        inventory: processedInventory,
        forecast: processedForecast,
        logs: processedLogs
      })

      setData({
        inventory: processedInventory,
        forecast: processedForecast,
        logs: processedLogs
      })
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)

      // Use simple fallback data
      setData({
        inventory: [
          { name: "Hanwa Qcell", available: 11, required: 15 },
          { name: "Maxeon 7 Series", available: 10, required: 13 },
          { name: "TOPHiKu6 Series", available: 25, required: 30 }
        ],
        forecast: [
          { model: "SolarEdge S-Series", qty: 39 },
          { model: "SolarEdge P-Series", qty: 38 }
        ],
        logs: [
          { timestamp: "2025-07-07T10:00:00", items: { "Hanwa Qcell": 11 } }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
    const interval = setInterval(fetchAnalyticsData, 20000) // Refresh every 20 seconds
    return () => clearInterval(interval)
  }, [])

  // Simplified chart data preparation - only 3 essential charts

  // 1. Inventory vs Demand Chart Data
  const inventoryDemandData = (data.inventory || []).map(item => ({
    name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
    inventory: item.available || 0,
    demand: item.required || 0
  })).filter(item => item.inventory > 0)

  // 2. History vs Forecasting Chart Data (using procurement logs as history)
  const historyForecastData = (data.forecast || []).slice(0, DISPLAY_LIMITS.HISTORY_CHART).map(item => {
    const modelName = item.model || 'Unknown'
    const displayName = modelName.length > 12 ? modelName.substring(0, 12) + '...' : modelName

    // Find historical data from logs
    const historicalQty = (data.logs || []).reduce((sum, log) => {
      const logItems = log.items || {}
      const matchingItem = Object.keys(logItems).find(key =>
        key.includes(modelName) || modelName.includes(key.split(' ')[0])
      )
      return sum + (matchingItem ? Number(logItems[matchingItem]) || 0 : 0)
    }, 0)

    return {
      name: displayName,
      history: historicalQty,
      forecast: item.qty || 0
    }
  }).filter(item => item.forecast > 0)

  // 3. Procurement History Chart Data (using real procurement logs)
  const procurementHistoryData = (() => {
    if (!data.logs || data.logs.length === 0) {
      return []
    }

    // Group procurement logs by date and calculate total orders per day
    const dailyOrders: { [key: string]: { date: string, totalOrders: number, totalItems: number, orders: any[] } } = {}

    data.logs.forEach((log, index) => {
      try {
        const date = new Date(log.timestamp)

        // Ensure valid date
        if (isNaN(date.getTime())) {
          console.warn(`Invalid timestamp at index ${index}:`, log.timestamp)
          return
        }

        const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD format (e.g., "2025-07-04")
        const displayDate = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }) // "Jul 8", "Jul 7", etc.

        // Debug logging for first few entries
        if (index < 5) {
          console.log(`Processing log ${index}:`, {
            timestamp: log.timestamp,
            dateKey,
            displayDate,
            existingEntry: !!dailyOrders[dateKey]
          })
        }

        // Initialize the date entry if it doesn't exist
        if (!dailyOrders[dateKey]) {
          dailyOrders[dateKey] = {
            date: displayDate,
            totalOrders: 0,
            totalItems: 0,
            orders: []
          }
        }

        // Count total items in this order
        const itemCount = Object.values(log.items || {}).reduce((sum, qty) => sum + (Number(qty) || 0), 0)

        // Add this order to the daily summary
        dailyOrders[dateKey].totalOrders += 1
        dailyOrders[dateKey].totalItems += itemCount
        dailyOrders[dateKey].orders.push({
          timestamp: log.timestamp,
          items: log.items,
          itemCount
        })
      } catch (error) {
        console.warn(`Error processing log entry at index ${index}:`, log, error)
      }
    })

    // Convert to array, sort by date (chronologically), and ensure unique dates
    const sortedData = Object.entries(dailyOrders)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
      .map(([dateKey, data]) => ({
        ...data,
        dateKey // Keep the original date key for debugging
      }))
      .slice(-DISPLAY_LIMITS.ANALYTICS_DAYS) // Show last N days only

    // Verify no duplicate dates in final data
    const finalDates = sortedData.map(d => d.date)
    const uniqueFinalDates = [...new Set(finalDates)]

    console.log('📊 Procurement History Data (Fixed):', {
      totalLogs: data.logs.length,
      uniqueDatesCount: Object.keys(dailyOrders).length,
      sortedDataCount: sortedData.length,
      dateKeys: Object.keys(dailyOrders).sort(),
      finalDates,
      uniqueFinalDates,
      hasDuplicates: finalDates.length !== uniqueFinalDates.length,
      sampleData: sortedData.slice(0, 5).map(d => ({
        date: d.date,
        dateKey: d.dateKey,
        orders: d.totalOrders,
        items: d.totalItems
      }))
    })

    // Return data with unique dates only (just in case)
    return sortedData.filter((item, index, arr) =>
      arr.findIndex(other => other.date === item.date) === index
    )
  })()





  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Live Analytics Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Real-time warehouse insights and predictive analytics
          </p>
          <div className="flex items-center justify-center space-x-2 mt-4">
            <Activity className="h-4 w-4 text-green-600 animate-pulse" />
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        </motion.div>



        {/* Essential Charts Grid - Only 3 Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* 1. Inventory vs Demand Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Inventory vs Demand
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              {inventoryDemandData.length > 0 ? (
                <BarChart data={inventoryDemandData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="inventory" fill="#10B981" name="Current Inventory" />
                  <Bar dataKey="demand" fill="#EF4444" name="Required Demand" />
                </BarChart>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                  <div className="text-center">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No inventory data available</p>
                  </div>
                </div>
              )}
            </ResponsiveContainer>
          </motion.div>

          {/* 2. History vs Forecasting Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                History vs Forecasting
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              {historyForecastData.length > 0 ? (
                <LineChart data={historyForecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="history"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Historical Data"
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#EF4444"
                    strokeWidth={2}
                    name="Forecast Data"
                  />
                </LineChart>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No forecast data available</p>
                  </div>
                </div>
              )}
            </ResponsiveContainer>
          </motion.div>

          {/* 3. Procurement History - Chart + Table Layout */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 lg:col-span-2"
          >
            <div className="flex items-center space-x-2 mb-6">
              <LineChartIcon className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Procurement History
              </h3>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                (Last {DISPLAY_LIMITS.ANALYTICS_DAYS} days)
              </span>
            </div>

            {/* Chart + Table Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Left Side - Total Orders Chart */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                  <h4 className="text-md font-medium text-slate-700 dark:text-slate-300">
                    Total Orders by Date
                  </h4>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    {procurementHistoryData.length > 0 ? (
                      <LineChart data={procurementHistoryData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          stroke="#64748b"
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          stroke="#64748b"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: '#f1f5f9'
                          }}
                          formatter={(value: any) => [`${value} orders`, 'Total Orders']}
                          labelFormatter={(label: string) => `Date: ${label}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="totalOrders"
                          stroke="#8B5CF6"
                          strokeWidth={3}
                          name="Total Orders"
                          dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 5 }}
                          activeDot={{ r: 7, stroke: '#8B5CF6', strokeWidth: 2 }}
                        />
                      </LineChart>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                        <div className="text-center">
                          <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No procurement data</p>
                        </div>
                      </div>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right Side - Items by Order Table */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-green-600" />
                  <h4 className="text-md font-medium text-slate-700 dark:text-slate-300">
                    Items by Order & Date
                  </h4>
                </div>
                <div className="h-80 overflow-y-auto border border-slate-200 dark:border-slate-600 rounded-lg">
                  {procurementHistoryData.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-700 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Orders
                          </th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Total Items
                          </th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Avg/Order
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                        {procurementHistoryData.map((day, index) => (
                          <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <td className="px-3 py-2 text-slate-900 dark:text-white font-medium">
                              {day.date}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                {day.totalOrders}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                {day.totalItems}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center text-slate-600 dark:text-slate-400">
                              {Math.round(day.totalItems / day.totalOrders)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                      <div className="text-center p-6">
                        <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No order data available</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>


        </div>

        {/* Real-time Status Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white text-center"
        >
          <div className="flex items-center justify-center space-x-4">
            <Zap className="h-6 w-6 animate-pulse" />
            <div>
              <h3 className="text-lg font-semibold">Live Data Stream Active</h3>
              <p className="text-blue-100">
                Analytics refresh every 20 seconds • Last update: {lastUpdated.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
