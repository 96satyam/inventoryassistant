"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { RefreshCw, AlertTriangle, CheckCircle, Package, TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

type ComponentItem = {
  name: string
  available: number
  required: number
}

export default function InventoryTable() {
  const [data, setData] = useState<ComponentItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch("http://localhost:8000/inventory/")

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const json = await res.json()

      // Transform each row into individual component items
      const components: ComponentItem[] = []
      json.forEach((row: any) => {
        const availableRandom = () => Math.floor(Math.random() * 50) + 1 // temporary

        if (row.module_company) {
          components.push({
            name: row.module_company,
            available: availableRandom(),
            required: row["no._of_modules"] ?? 0,
          })
        }
        if (row.optimizers_company) {
          components.push({
            name: row.optimizers_company,
            available: availableRandom(),
            required: row["no._of_optimizers"] ?? 0,
          })
        }
        if (row.inverter_company) {
          components.push({
            name: row.inverter_company,
            available: availableRandom(),
            required: 1,
          })
        }
        if (row.battery_company) {
          components.push({
            name: row.battery_company,
            available: availableRandom(),
            required: 1,
          })
        }
        if (row.rails) {
          components.push({
            name: row.rails,
            available: availableRandom(),
            required: 1,
          })
        }
        if (row.clamps) {
          components.push({
            name: row.clamps,
            available: availableRandom(),
            required: 1,
          })
        }
        if (row.disconnects) {
          components.push({
            name: row.disconnects,
            available: availableRandom(),
            required: 1,
          })
        }
        if (row.conduits) {
          components.push({
            name: row.conduits,
            available: availableRandom(),
            required: 1,
          })
        }
      })

      setData(components)
    } catch (err) {
      console.error("❌ Failed to fetch inventory", err)
      // Set some mock data for development
      setData([
        { name: "SolarEdge Modules", available: 25, required: 30 },
        { name: "Enphase Microinverters", available: 15, required: 12 },
        { name: "IronRidge Rails", available: 8, required: 10 },
        { name: "Tesla Powerwall", available: 3, required: 5 },
      ])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* Enhanced Refresh Indicator */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className="h-4 w-4 text-blue-600" />
          </motion.div>
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Auto-refresh every 10 seconds
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Package className="h-4 w-4" />
          <span>{data.length} Components Tracked</span>
        </div>
      </motion.div>

      {/* Enhanced Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <Table>
          <TableHead>
            <TableRow className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <TableCell header className="font-semibold text-slate-900 dark:text-white py-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Component
                </div>
              </TableCell>
              <TableCell header className="font-semibold text-slate-900 dark:text-white py-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Available
                </div>
              </TableCell>
              <TableCell header className="font-semibold text-slate-900 dark:text-white py-4">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-orange-600" />
                  Required
                </div>
              </TableCell>
              <TableCell header className="font-semibold text-slate-900 dark:text-white py-4">
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <AnimatePresence>
              {data.map((item, idx) => {
                const shortage = item.available < item.required
                const stockLevel = item.available / item.required

                return (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <TableCell className="py-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {item.name}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "font-semibold",
                          shortage ? "text-red-600" : "text-green-600"
                        )}>
                          {item.available}
                        </span>
                        {/* Stock Level Bar */}
                        <div className="flex-1 max-w-20">
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(stockLevel * 100, 100)}%` }}
                              transition={{ duration: 1, delay: idx * 0.1 }}
                              className={cn(
                                "h-2 rounded-full transition-all duration-300",
                                shortage
                                  ? "bg-gradient-to-r from-red-500 to-red-600"
                                  : stockLevel > 1.5
                                  ? "bg-gradient-to-r from-green-500 to-green-600"
                                  : "bg-gradient-to-r from-yellow-500 to-orange-500"
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {item.required}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 + 0.2 }}
                      >
                        {shortage ? (
                          <div className="flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-full border border-red-200 dark:border-red-800">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm font-medium">Low Stock</span>
                          </div>
                        ) : stockLevel > 1.5 ? (
                          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full border border-green-200 dark:border-green-800">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Well Stocked</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-full border border-yellow-200 dark:border-yellow-800">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Sufficient</span>
                          </div>
                        )}
                      </motion.div>
                    </TableCell>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </TableBody>
        </Table>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Updating inventory...
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid md:grid-cols-3 gap-4"
      >
        {[
          {
            label: "Total Components",
            value: data.length,
            icon: Package,
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
          },
          {
            label: "Low Stock Items",
            value: data.filter(item => item.available < item.required).length,
            icon: AlertTriangle,
            color: "text-red-600",
            bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
          },
          {
            label: "Well Stocked",
            value: data.filter(item => item.available >= item.required * 1.5).length,
            icon: CheckCircle,
            color: "text-green-600",
            bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
          }
        ].map((stat, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 p-4 rounded-xl border ${stat.bg}`}
          >
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {stat.label}
              </p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
