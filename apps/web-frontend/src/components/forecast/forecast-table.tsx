
"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  AlertCircle,
  RefreshCw,
  Package,
  Brain,
  MessageCircle,
  Target,
  Flame
} from "lucide-react"
import toast from "react-hot-toast"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"
import PublicUrlNotice from "@/components/ui/public-url-notice"

/* ---------- types ---------- */
type ForecastRow = {
  model: string
  qty: number
  urgency: number     // absolute value from API
  is_urgent: boolean
}

/* ---------- component ---------- */
export default function ForecastTable() {
  const [rows,    setRows]    = useState<ForecastRow[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showPublicNotice, setShowPublicNotice] = useState(false)

  /* fetch once on mount */
  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true)
      try {
        const res = await apiFetch(API_ENDPOINTS.FORECAST)

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }

        const json = await res.json()

        // Import data normalizer
        const { normalizeForecastData, logDataSource, validateDataConsistency } = await import("@/utils/data-normalizer")

        // Log data source for debugging
        logDataSource('/forecast/', json)

        // Validate and normalize data
        if (validateDataConsistency(json, 'forecast')) {
          const normalizedData = normalizeForecastData(json)
          // Convert to ForecastRow format with required fields
          const forecastRows: ForecastRow[] = normalizedData.map(item => ({
            model: item.model,
            qty: item.qty,
            urgency: item.urgency ?? 0,
            is_urgent: item.is_urgent ?? false
          }))
          setRows(forecastRows)
          console.log('✅ Forecast: Successfully loaded and normalized', forecastRows.length, 'items')
        } else {
          console.warn('⚠️ Forecast: Invalid data format, using normalized empty array')
          setRows([])
        }
      } catch (err) {
        console.error("❌ Forecast: Failed to load data:", err)

        // Check if this is a public URL deployment issue
        const isPublicUrl = typeof window !== 'undefined' &&
          !window.location.hostname.includes('localhost') &&
          !window.location.hostname.includes('127.0.0.1');

        if (isPublicUrl) {
          console.log('🌐 Public URL detected - backend may need to be started in public mode');
          console.log('💡 To fix: Run start-public.bat to start backend with public network access');
          setShowPublicNotice(true)
          toast.error("Backend not accessible on public network. Using mock data.", {
            duration: 6000,
          })
        } else {
          toast.error("Couldn’t load forecast data - using mock data")
        }

        // Only log detailed error info if it's actually an Error object
        if (err instanceof Error) {
          console.error("❌ Forecast: Error message:", err.message)
        }

        // Use normalized mock data for development
        const { normalizeForecastData } = await import("@/utils/data-normalizer")
        const mockData = [
          { model: "SolarEdge Modules", qty: 25, urgency: 5, is_urgent: true },
          { model: "Enphase Microinverters", qty: 15, urgency: 3, is_urgent: false },
          { model: "Tesla Powerwall", qty: 8, urgency: 7, is_urgent: true },
          { model: "IronRidge Rails", qty: 12, urgency: 2, is_urgent: false },
        ]
        const normalizedMockData = normalizeForecastData(mockData)
        const mockRows: ForecastRow[] = normalizedMockData.map(item => ({
          model: item.model,
          qty: item.qty,
          urgency: item.urgency ?? 0,
          is_urgent: item.is_urgent ?? false
        }))
        setRows(mockRows)
        console.log('🔄 Forecast: Using normalized mock data as fallback')
      } finally {
        setLoading(false)
      }
    }
    fetchForecast()
  }, [])

  /* helpful memo – avoid NaN when list empty */
  const maxUrgency = rows.length
    ? Math.max(...rows.map(r => Number(r.urgency) || 0))
    : 0

  /* ---- WhatsApp send handler (no axios, just fetch) ---- */
  const handleSendWhatsApp = useCallback(async () => {
  setSending(true);
  try {
    const res = await fetch("/api/forecast/send-url");

    if (!res.ok) throw new Error(`Invalid response: ${res.status}`);

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Expected JSON, got HTML");
    }

    const json = await res.json();
    const url = json?.url;

    if (url) {
      window.open(url, "_blank");
      toast.success("Opening WhatsApp...");
    } else {
      toast.error("No WhatsApp URL received");
    }
  } catch (err) {
    console.error("📱 WhatsApp: Error occurred:", err);

    // Only log detailed error info if it's actually an Error object
    if (err instanceof Error) {
      console.error("📱 WhatsApp: Error message:", err.message)
    }

    toast.error("WhatsApp launch failed");
  } finally {
    setSending(false);
  }
}, []);



  // Calculate summary stats
  const totalQuantity = rows.reduce((sum, row) => sum + row.qty, 0);
  const urgentItems = rows.filter(row => row.is_urgent).length;
  const uniqueModels = new Set(rows.map(row => row.model)).size;

  /* ---------- render ---------- */
  return (
    <div className="space-y-6">
      {/* Enhanced Header with Stats */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
          <Brain className="h-5 w-5 text-orange-600" />
          <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
            AI Demand Forecast
          </span>
          <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-800/30 text-orange-600 rounded-full">
            Next 5 Installs
          </span>
          {loading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="h-4 w-4 text-orange-600" />
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button
            size="sm"
            onClick={handleSendWhatsApp}
            disabled={loading || sending || rows.length === 0}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {sending ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mr-2"
              >
                <RefreshCw className="h-4 w-4" />
              </motion.div>
            ) : (
              <MessageCircle className="h-4 w-4 mr-2" />
            )}
            {sending ? "Sending..." : "Send via WhatsApp"}
          </Button>
        </motion.div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid md:grid-cols-3 gap-4 mb-6"
      >
        {[
          {
            label: "Total Demand",
            value: totalQuantity,
            icon: Package,
            color: "text-orange-600",
            bg: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
          },
          {
            label: "Urgent Items",
            value: urgentItems,
            icon: Flame,
            color: "text-red-600",
            bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
          },
          {
            label: "Unique Models",
            value: uniqueModels,
            icon: Target,
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
          }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
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
          </motion.div>
        ))}
      </motion.div>

      {/* empty‑state vs table */}
      {!loading && rows.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">No forecast data available</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
            Forecast data will appear here when the AI analysis is complete
          </p>
        </motion.div>
      ) : loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-12"
        >
          <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="h-5 w-5 text-orange-600" />
            </motion.div>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Analyzing demand patterns...
            </span>
          </div>
        </motion.div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell header>Component Model</TableCell>
              <TableCell header className="text-right">Qty Needed</TableCell>
              <TableCell header className="text-right">Urgency</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row, i) => {
              /* convert to percentage relative to top item */
              const pct = maxUrgency
                ? Math.round((row.urgency / maxUrgency) * 100)
                : 0

              // Apply orange/light red text color to first 5 rows
              const isTopFive = i < 5
              const textColorClass = isTopFive
                ? "text-orange-600 dark:text-orange-400"
                : ""

              return (
                <TableRow
                  key={i}
                  className={row.is_urgent ? "bg-red-50 dark:bg-red-900/10" : ""}
                >
                  <TableCell className={textColorClass}>
                    {row.model}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${textColorClass}`}>
                    {row.qty}
                  </TableCell>
                  <TableCell className={`text-right text-sm ${isTopFive ? 'text-orange-500 dark:text-orange-400' : 'text-muted-foreground'}`}>
                    {pct}%
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}

      <PublicUrlNotice
        show={showPublicNotice}
        onClose={() => setShowPublicNotice(false)}
      />
    </div>
  )
}
