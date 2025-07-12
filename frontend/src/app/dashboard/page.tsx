/* --------------------  DASHBOARD PAGE  -------------------- */
'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/authMiddleware'
import {
  FileDown,
  TrendingUp,
  PackageX,
  Package,
  Loader2,
  AlertTriangle,
  X,
  Zap,
  Shield,
  Activity,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingDown,
  Warehouse,
  ShoppingCart,
  Calendar,
  Eye,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableHead,
  TableCell,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import { REFRESH_INTERVALS, DISPLAY_LIMITS, BUSINESS_THRESHOLDS } from '@/shared/constants/config'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { saveAs } from 'file-saver'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { formatDate } from '@/lib/date'
import { useAutoRefreshTimer } from '@/hooks/useAutoRefreshTimer'

import Header      from '@/components/ui/header'
import Suggestions from '@/components/suggestions'

/* ------------ utils ------------ */
const fetcher = (url: string) => fetch(url).then(r => r.json())

/* ------------ types ------------ */
type InventoryRow = { name: string; available: number; required: number }
type ForecastRow  = { model: string; qty: number }
type LogEntry     = { timestamp: string; items: Record<string, number> }

/* raw → normalised stock */
const normaliseInventory = (raw: any[]): InventoryRow[] =>
  raw.map(r => ({
    name: String(
      r.name ?? r.model ?? r.module_company ?? r['Module Company'] ??
      r.optimizers_company ?? r.inverter_company ?? r.battery_company ??
      r.rails ?? r.clamps ?? r.disconnects ?? r.conduits ?? 'Unnamed Item'
    ),
    available: Number(
      r.available ?? r.available_qty ?? r.in_stock ??
      r['No. Of Modules'] ?? r.no_of_modules ?? r['no._of_modules'] ?? 0
    ),
    required: Number(
      r.required ?? r.required_qty ?? r.demand ?? r.needed ??
      r.target ?? r.minimum_stock ?? r.min_stock ?? 0
    ),
  }))

/* ========================================================= */
export default function DashboardPage() {
  const router = useRouter()

  /* ---- Authentication Check ---- */
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login')
      return
    }
  }, [router])

  /* ---- state ---- */
  const [stats,     setStats]     = useState<any>(null)
  const [inv,       setInv]       = useState<InventoryRow[]>([])
  const [forecast,  setForecast]  = useState<ForecastRow[]>([])
  const [logs,      setLogs]      = useState<LogEntry[]>([])
  const [loading,   setLoading]   = useState(true)

  /* KPI modals */
  const [riskOpen,    setRiskOpen]    = useState(false)
  const [healthOpen,  setHealthOpen]  = useState(false)

  /* Smart Inventory Assistant modals */
  const [totalSKUsOpen, setTotalSKUsOpen] = useState(false)
  const [healthyStockOpen, setHealthyStockOpen] = useState(false)
  const [lowStockOpen, setLowStockOpen] = useState(false)
  const [forecastedOpen, setForecastedOpen] = useState(false)

  /* Auto-refresh timer */
  const { timeLeft, isActive, progress } = useAutoRefreshTimer({
    interval: 20,
    onRefresh: () => {
      console.log('🔄 Auto-refresh triggered')
      pullAll()
    },
    autoStart: true
  })

  /* ---- SIMPLIFIED API pull with live Google Sheets data ---- */
  const pullAll = async () => {
    try {
      console.log('🔄 Dashboard: Fetching live Google Sheets data...');

      // Direct fetch from our live APIs - no complex validation or fallbacks
      const [statsResponse, inventoryResponse, forecastResponse, logsResponse] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/inventory'),
        fetch('/api/forecast'),
        fetch('/api/procurement/logs')
      ]);

      const statsData = await statsResponse.json();
      const inventoryData = await inventoryResponse.json();
      const forecastData = await forecastResponse.json();
      const logsData = await logsResponse.json();

      console.log('� Live stats data:', statsData);
      console.log('� Live inventory data:', inventoryData);
      console.log('� Live forecast data:', forecastData);
      console.log('📋 Live procurement logs:', logsData);

      // Set data directly without complex normalization
      setStats(statsData);
      setInv(inventoryData); // Already in correct format
      setForecast(forecastData);
      setLogs(logsData); // Live procurement logs

      console.log('✅ Dashboard data updated with live Google Sheets data');

    } catch (error) {
      console.error('❌ Dashboard data fetch error:', error);

      // Use simple fallback data
      setStats({
        total_skus: 0,
        healthy_stock: 0,
        low_stock: 0,
        forecasted: 0,
        efficiency: 0
      });
      setInv([]);
      setForecast([]);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  /* ---- load on mount ---- */
  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    pullAll()
    const id = setInterval(pullAll, REFRESH_INTERVALS.DASHBOARD)
    return () => clearInterval(id)
  }, [])

  /* ---- merge available × demand ---- */
  const demandMap = useMemo(
    () => Object.fromEntries(forecast.map(f => [f.model, f.qty])),
    [forecast],
  )

  const inventory = useMemo(() => {
    return inv.map(row => ({
      ...row,
      required: demandMap[row.name] ?? row.required ?? 0,
    }))
  }, [inv, demandMap])

  /* ---- totals & helpers ---- */
  const totalForecast = useMemo(
    () => forecast.reduce((s, x) => s + x.qty, 0),
    [forecast],
  )

  /* low‑stock toast - scheduled for 1 hour delay */
  useEffect(() => {
    const low = inventory.filter(r => r.available < r.required)
    if (low.length) {
      // Schedule notification to appear after 1 hour (3600000 milliseconds)
      const notificationTimer = setTimeout(() => {
        toast(`⚠️ Low stock: ${low.map(r => r.name).join(', ')}`, {
          duration: 6000, // Show for 6 seconds
          position: 'top-right',
        })
      }, REFRESH_INTERVALS.NOTIFICATIONS) // 1 hour notification delay

      // Cleanup timer if component unmounts or inventory changes
      return () => {
        clearTimeout(notificationTimer)
      }
    }
  }, [inventory])

  /* CSV export */
  const exportCSV = () => {
    const header = ['timestamp', 'model', 'quantity']
    const rows = logs.flatMap(e =>
      Object.entries(e.items).map(([model, qty]) => [
        e.timestamp,
        model,
        qty,
      ]),
    )
    const csv = [header, ...rows].map(r => r.join(',')).join('\n')
    saveAs(
      new Blob([csv], { type: 'text/csv' }),
      `procurement_${Date.now()}.csv`,
    )
  }

  /* Inventory CSV export */
  const exportInventoryCSV = () => {
    const header = ['Item', 'Available', 'Required', 'Status']
    const rows = inventory.map(item => [
      item.name,
      item.available,
      item.required,
      item.available < item.required ? 'Low' : 'OK'
    ])
    const csv = [header, ...rows].map(r => r.join(',')).join('\n')
    saveAs(
      new Blob([csv], { type: 'text/csv' }),
      `inventory_${Date.now()}.csv`,
    )
  }

  /* ======================================================= */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  /* ---------- computed subsets ---------- */
  const lowItems    = inventory.filter(r => r.available < r.required)
  const lowPct      = inventory.length ? Math.round((lowItems.length / inventory.length) * 100) : 0
  const level =
      lowPct === 0   ? 'Low'
    : lowPct <  25   ? 'Medium'
    : lowPct <  50   ? 'High'
    :                 'Critical'

  const urgentTop3  = [...lowItems]
    .sort((a, b) => (b.required - b.available) - (a.required - a.available))
    .slice(0, DISPLAY_LIMITS.URGENT_ITEMS)

  const healthyItems  = inventory.filter(r => r.available >= r.required)
  const healthyPct    = inventory.length
      ? Math.round((healthyItems.length / inventory.length) * 100)
      : 100

  const overstocked = healthyItems
    .filter(r => r.available >= r.required * BUSINESS_THRESHOLDS.OVERSTOCKED_MULTIPLIER)          // ≥200 % of need
    .sort((a, b) => (b.available - b.required) - (a.available - a.required))
    .slice(0, DISPLAY_LIMITS.OVERSTOCKED_ITEMS)

  /* ======================================================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        {/* Enhanced Header with Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-2xl blur-xl" />
          <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-5">
            {/* Header - Enhanced Structure */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                  Smart Inventory Assistant
                </h1>
                <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                  AI-powered inventory management with predictive analytics
                </p>
              </div>
              <div className="flex items-center space-x-3 mt-3 md:mt-0">
                {/* Live Data - Clickable to navigate to analytics */}
                <Link href="/analytics">
                  <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer group">
                    <Activity className="h-3.5 w-3.5 text-green-600 animate-pulse group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-green-700 dark:text-green-300">Live Data</span>
                  </div>
                </Link>

                {/* Auto-refresh Timer - Dynamic countdown */}
                <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 relative overflow-hidden">
                  {/* Progress bar background */}
                  <div
                    className="absolute inset-0 bg-blue-200 dark:bg-blue-800 transition-all duration-1000 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                  <div className="relative flex items-center space-x-2">
                    <Clock className={`h-3.5 w-3.5 text-blue-600 ${isActive ? 'animate-spin' : ''}`} />
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                      Auto-refresh: {timeLeft}s
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Debug Controls */}
            <div className="flex gap-2 mb-4">
              <Button
                onClick={() => {
                  console.log('🔄 Manual refresh triggered');
                  console.log('📊 Current stats:', stats);
                  console.log('📦 Current inventory:', inventory);
                  console.log('📈 Current forecast:', forecast);
                  pullAll();
                }}
                size="sm"
                variant="outline"
                className="border-blue-200 hover:bg-blue-50"
              >
                <Activity className="h-4 w-4 mr-1" />
                Force Refresh & Debug
              </Button>
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-3 text-white cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                onClick={() => setTotalSKUsOpen(true)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total SKUs</p>
                    <p className="text-2xl font-bold">{inventory.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-200" />
                </div>
              </div>
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-3 text-white cursor-pointer hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
                onClick={() => setHealthyStockOpen(true)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Healthy Stock</p>
                    <p className="text-2xl font-bold">{healthyItems.length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-200" />
                </div>
              </div>
              <div
                className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-3 text-white cursor-pointer hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105"
                onClick={() => setLowStockOpen(true)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Low Stock</p>
                    <p className="text-2xl font-bold">{lowItems.length}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-200" />
                </div>
              </div>
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-3 text-white cursor-pointer hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                onClick={() => setForecastedOpen(true)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Forecasted</p>
                    <p className="text-2xl font-bold">{totalForecast}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-200" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced KPI GRID - Reorganized Layout */}
        <motion.section
          className="grid lg:grid-cols-2 gap-6"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
        >
          {/* Left Side - Risk & Health Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* --- ① Inventory Risk --- */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.4 }}
        >
          <KPI
            title="Inventory Risk"
            value={`${level} (${lowPct} %)`}
            icon={<AlertTriangle className="h-5 w-5" />}
            colour={
              level === 'Low'      ? 'text-green-600'
            : level === 'Medium'   ? 'text-yellow-600'
            : level === 'High'     ? 'text-orange-600'
            :                       'text-red-600'
            }
            onDetails={() => setRiskOpen(true)}
            titleStyle="text-sm font-bold text-slate-900 dark:text-white"
          />
        </motion.div>

            {/* --- ② Warehouse Healthy --- */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.4 }}
            >
              <KPI
                title="Warehouse Healthy"
                value={`${healthyPct} %`}
                icon={<TrendingUp className="h-5 w-5" />}
                colour="text-green-600"
                onDetails={() => setHealthOpen(true)}
                titleStyle="text-sm font-bold text-slate-900 dark:text-white"
              />
            </motion.div>
          </div>

          {/* Right Side - Urgent Parts & Shortages Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* --- ③ Top Urgent Parts --- */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.4 }}
        >
          <KPIList
            title="Top Urgent Parts"
            icon={<PackageX className="h-5 w-5" />}
            items={urgentTop3.map(u => ({
              label : u.name,
              value : `${u.required - u.available}`,
            }))}
            emptyText="No urgent parts 🎉"
            link={{ href: '/procurement', label: 'View all →' }}
            titleStyle="text-sm font-bold text-slate-900 dark:text-white"
          />
        </motion.div>

        {/* --- ③ Upcoming Shortages --- */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.4 }}
        >
          <KPI
            title="Upcoming Shortages"
            value={totalForecast}
            icon={<Package className="h-5 w-5" />}
            colour="text-orange-600"
            link={{ href: '/forecast', label: 'Report →' }}
            titleStyle="text-sm font-bold text-slate-900 dark:text-white"
          />
        </motion.div>

          </div>
        </motion.section>

      {/* ---------- SMART INVENTORY ASSISTANT MODALS ---------- */}
      <TotalSKUsModal
        open={totalSKUsOpen}
        onClose={() => setTotalSKUsOpen(false)}
        items={inventory}
      />
      <HealthyStockModal
        open={healthyStockOpen}
        onClose={() => setHealthyStockOpen(false)}
        items={healthyItems}
      />
      <LowStockModal
        open={lowStockOpen}
        onClose={() => setLowStockOpen(false)}
        items={lowItems}
      />
      <ForecastedModal
        open={forecastedOpen}
        onClose={() => setForecastedOpen(false)}
        items={forecast}
      />

      {/* ---------- MODALS ---------- */}
      <RiskModal
        open={riskOpen}
        onClose={() => setRiskOpen(false)}
        lowItems={lowItems}
        level={level}
      />
      <HealthModal
        open={healthOpen}
        onClose={() => setHealthOpen(false)}
        strongItems={healthyItems}
        overstocked={overstocked}
        healthyPct={healthyPct}
      />

        {/* ---------- ENHANCED CHART ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-slate-800/50 dark:to-slate-700/50" />
            <CardHeader className="relative bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">Upcoming Part Shortages</span>
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-normal">Forecasted demand for next jobs</p>
                </div>
              </CardTitle>
            </CardHeader>
        <CardContent className="h-[300px]">
          <AnimatePresence mode="wait">
            {forecast.length === 0 ? (
              <motion.p
                key="no-data"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-slate-600 dark:text-slate-300"
              >
                No shortfalls predicted. 🎉
              </motion.p>
            ) : (
              <motion.div
                key="chart"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
                className="h-full"
              >
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">
                  Total needed: <strong className="text-slate-900 dark:text-white">{totalForecast}</strong>
                </p>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart
                    data={[...forecast].sort((a, b) => b.qty - a.qty).slice(0, DISPLAY_LIMITS.FORECAST_CHART)}
                    layout="vertical"
                    margin={{ left: 90 }}
                  >
                    {/* Background Grid */}
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--muted-foreground))"
                      opacity={0.4}
                      horizontal={true}
                      vertical={false}
                    />

                    {/* X-Axis (Numbers) */}
                    <XAxis
                      type="number"
                      tick={{
                        fill: 'hsl(var(--foreground))',
                        fontSize: 15,
                        fontWeight: 500,
                        fontFamily: 'Inter, system-ui, sans-serif'
                      }}
                      axisLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                      tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                    />

                    {/* Y-Axis (Labels) */}
                    <YAxis
                      dataKey="model"
                      type="category"
                      width={250}
                      tickFormatter={v => {
                        // Ensure v is a string
                        const str = String(v || '');
                        // Show full names for specific products
                        if (str.includes('Enphase IQ7+')) return 'Enphase IQ7+ / IQ7A Microinverters';
                        if (str.includes('Tesla Powerwal')) return 'Tesla Powerwall 3';
                        if (str.includes('LG RESU 10H Pr')) return 'LG RESU 10H Prime';
                        // For other products, use smart truncation
                        return str.length > 28 ? str.slice(0, 25) + '…' : str;
                      }}
                      tick={{
                        fill: 'hsl(var(--foreground))',
                        fontSize: 15,
                        fontWeight: 500,
                        fontFamily: 'Inter, system-ui, sans-serif'
                      }}
                      axisLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                      tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                      interval={0}
                    />



                    {/* Enhanced Bar */}
                    <Bar
                      dataKey="qty"
                      animationDuration={800}
                      fill="url(#enhancedBarGradient)"
                      radius={6}
                    />

                    {/* Enhanced Gradient Definitions */}
                    <defs>
                      <linearGradient id="enhancedBarGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity={1} />
                        <stop offset="50%" stopColor="#4F46E5" stopOpacity={1} />
                        <stop offset="100%" stopColor="#7C3AED" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>

        {/* ---------- ENHANCED TABLES ---------- */}
        <EnhancedInventoryTable data={inventory} onDownload={exportInventoryCSV} />
        <EnhancedProcurementTable logs={logs} onDownload={exportCSV} />
      </div>
    </div>
  )
}

/* ========================================================= */
/* ---------- Enhanced Components ----------                  */
/* ========================================================= */

/* Enhanced KPI Card with gradients and animations */
function EnhancedKPI({
  title,
  value,
  subtitle,
  icon,
  gradient,
  trend,
  link,
  onDetails,
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  gradient: string
  trend?: 'up' | 'down'
  link?: { href: string; label: string }
  onDetails?: () => void
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`} />
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

        {/* Content */}
        <CardContent className="relative p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              {icon}
            </div>
            {trend && (
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                trend === 'up' ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'
              }`}>
                {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{trend === 'up' ? 'Good' : 'Alert'}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-white/80">{title}</h3>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-sm text-white/70">{subtitle}</p>
          </div>

          {/* Action Button */}
          {(onDetails || link) && (
            <div className="mt-4">
              {onDetails ? (
                <button
                  onClick={onDetails}
                  className="flex items-center space-x-2 text-sm font-medium text-white/90 hover:text-white transition-colors group-hover:translate-x-1 duration-200"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </button>
              ) : link ? (
                <Link
                  href={link.href}
                  className="flex items-center space-x-2 text-sm font-medium text-white/90 hover:text-white transition-colors group-hover:translate-x-1 duration-200"
                >
                  <span>{link.label}</span>
                </Link>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* Enhanced KPI List with status indicators */
function EnhancedKPIList({
  title,
  subtitle,
  icon,
  gradient,
  items,
  emptyText,
  link,
}: {
  title: string
  subtitle: string
  icon: React.ReactNode
  gradient: string
  items: { label: string; value: string; status?: string }[]
  emptyText: string
  link?: { href: string; label: string }
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`} />
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

        {/* Content */}
        <CardContent className="relative p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              {icon}
            </div>
            {items.length > 0 && (
              <div className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                {items.length} items
              </div>
            )}
          </div>

          <div className="space-y-2 mb-4">
            <h3 className="text-sm font-medium text-white/80">{title}</h3>
            <p className="text-sm text-white/70">{subtitle}</p>
          </div>

          {/* Items List */}
          {items.length === 0 ? (
            <p className="text-sm text-white/70 py-4">{emptyText}</p>
          ) : (
            <div className="space-y-2 mb-4">
              {items.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-white/10 rounded-lg p-2">
                  <span className="text-sm truncate flex-1 text-white">{item.label}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-white">{item.value}</span>
                    {item.status === 'critical' && <XCircle className="h-4 w-4 text-red-200" />}
                  </div>
                </div>
              ))}
              {items.length > 3 && (
                <p className="text-xs text-white/60 text-center">+{items.length - 3} more items</p>
              )}
            </div>
          )}

          {/* Action Link */}
          {link && (
            <Link
              href={link.href}
              className="flex items-center space-x-2 text-sm font-medium text-white/90 hover:text-white transition-colors group-hover:translate-x-1 duration-200"
            >
              <span>{link.label}</span>
            </Link>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ========================================================= */
/* ---------- Original Components (Updated) ----------      */
/* ========================================================= */

function KPI({
  title,
  value,
  icon,
  colour = '',
  link,
  onDetails,
  titleStyle,
}: {
  title   : string
  value   : string | number
  icon    : React.ReactNode
  colour ?: string
  link   ?: { href: string; label: string }
  onDetails?: () => void         // new
  titleStyle?: string           // custom title styling
}) {
  return (
    <Card>
      <CardContent className="p-3 flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <div className="rounded-full p-2 bg-slate-100 dark:bg-slate-700">{icon}</div>
          <div>
            <p className={titleStyle || "text-sm text-slate-600 dark:text-slate-300"}>{title}</p>
            <p className={cn('text-2xl font-bold', colour)}>{value}</p>
          </div>
        </div>

        {/* clickable details OR normal link */}
        {onDetails ? (
          <button
            onClick={onDetails}
            className="ml-[48px] text-base font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
          >
            Details →
          </button>
        ) : link ? (
          <Link
            href={link.href}
            className="ml-[48px] text-base font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
          >
            {link.label}
          </Link>
        ) : null}
      </CardContent>
    </Card>
  )
}

function KPIList({
  title,
  icon,
  items,
  emptyText,
  link,
  titleStyle,
}: {
  title    : string
  icon     : React.ReactNode
  items    : { label: string; value: string | number }[]
  emptyText: string
  link?    : { href: string; label: string }
  titleStyle?: string
}) {
  return (
    <Card>
      <CardContent className="p-3 flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <div className="rounded-full p-2 bg-slate-100 dark:bg-slate-700">{icon}</div>
          <div>
            <p className={titleStyle || "text-sm text-slate-600 dark:text-slate-300"}>{title}</p>
            {items.length === 0 ? (
              <p className="text-xs text-slate-600 dark:text-slate-300">{emptyText}</p>
            ) : (
              <div className="text-sm">
                {items.slice(0, 2).map((it, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="truncate">{it.label}</span>
                    <span className="font-medium">{it.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {link && (
          <Link
            href={link.href}
            className="ml-[48px] text-base font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
          >
            {link.label}
          </Link>
        )}
      </CardContent>
    </Card>
  )
}

/* ---------- Risk modal ---------- */
function RiskModal({
  open,
  onClose,
  lowItems,
  level,
}: {
  open    : boolean
  onClose : () => void
  lowItems: InventoryRow[]
  level   : string
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1,   opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Inventory Risk — {level}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {lowItems.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">All good — no risky parts right now! 🎉</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {lowItems.length} SKU{lowItems.length > 1 && 's'} below required
              levels:
            </p>
            <ul className="list-disc ml-6 text-sm text-slate-700 dark:text-slate-300 space-y-1">
              {lowItems.slice(0, 10).map((it, i) => (
                <li key={i}>
                  <strong>{it.name}</strong> — need&nbsp;
                  {it.required - it.available} more.
                </li>
              ))}
              {lowItems.length > 10 && (
                <li>…and {lowItems.length - 10} more.</li>
              )}
            </ul>
            <p className="text-sm text-slate-600 dark:text-slate-300 pt-2">
              📌 <em>Recommendation:</em> prioritise purchase orders for these
              items and check lead times with suppliers.
            </p>
          </>
        )}
      </motion.div>
    </div>
  )
}

/* ---------- Health modal ---------- */
function HealthModal({
  open,
  onClose,
  strongItems,
  overstocked,
  healthyPct,
}: {
  open        : boolean
  onClose     : () => void
  strongItems : InventoryRow[]
  overstocked : InventoryRow[]
  healthyPct  : number
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1,   opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Warehouse Health — {healthyPct} %
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300">
          {healthyPct}% of SKUs have enough stock to cover the
          next&nbsp;forecasted jobs.
        </p>

        {/* Strong points */}
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">✅ Strong areas:</p>
          <ul className="list-disc ml-6 text-sm text-slate-600 dark:text-slate-300 space-y-1">
            <li>
              {strongItems.length} / {strongItems.length + overstocked.length}
              &nbsp;SKUs meet demand.
            </li>
            {overstocked.length === 0 && (
              <li>No product is significantly over‑stocked.</li>
            )}
          </ul>
        </div>

        {/* Overstocked list */}
        {overstocked.length > 0 && (
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-2 mb-1">
              💡 Overstocked (≥ 200 % of need):
            </p>
            <ul className="list-disc ml-6 text-sm text-slate-600 dark:text-slate-300 space-y-1">
              {overstocked.map((it, i) => (
                <li key={i}>
                  <strong>{it.name}</strong> — {it.available} in stock vs&nbsp;
                  {it.required} required.
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-sm text-slate-600 dark:text-slate-300 pt-2">
          📌 <em>Tip:</em> regularly review supplier MOQs and delivery cadence to
          keep stock lean yet safe.
        </p>
      </motion.div>
    </div>
  )
}

/* ---------- Enhanced Inventory table ---------- */
function EnhancedInventoryTable({
  data,
  onDownload
}: {
  data: InventoryRow[]
  onDownload: () => void
}) {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-white to-blue-50 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">📦 Current Inventory</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Real-time inventory status</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/inventory"
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 dark:bg-blue-600 text-white dark:text-white rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Eye className="h-4 w-4" />
              <span>View All</span>
            </Link>
            <button
              onClick={onDownload}
              className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
            >
              <FileDown className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell header className="text-sm font-bold text-slate-900 dark:text-white">Item</TableCell>
                <TableCell header className="text-sm font-bold text-slate-900 dark:text-white">Available</TableCell>
                <TableCell header className="text-sm font-bold text-slate-900 dark:text-white">Required</TableCell>
                <TableCell header className="text-sm font-bold text-slate-900 dark:text-white">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((it, i) => {
                const low = it.available < it.required
                return (
                  <TableRow key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <TableCell className="text-sm font-semibold text-slate-900 dark:text-white">
                      {it.name}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-slate-900 dark:text-white">
                      {it.available || '–'}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-slate-900 dark:text-white">
                      {it.required || '–'}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-sm font-bold',
                        low ? 'text-red-600 dark:text-red-300' : 'text-green-600 dark:text-green-300',
                      )}
                    >
                      {low ? 'Low' : 'OK'}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

/* ---------- Enhanced Procurement history + suggestions ---------- */
function EnhancedProcurementTable({
  logs,
  onDownload,
}: {
  logs: LogEntry[]
  onDownload: () => void
}) {
  const flatRows = logs.flatMap(e =>
    Object.entries(e.items).map(([model, qty]) => ({
      timestamp: e.timestamp,
      model,
      qty: Number(qty) || 0,
    })),
  )

  const recent = flatRows.slice(0, 10)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-white to-purple-50 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Recent Procurement Activity</CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Latest 10 procurement entries</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/procurement"
                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 dark:bg-blue-600 text-white dark:text-white rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Eye className="h-4 w-4" />
                  <span>View All</span>
                </Link>
                <button
                  onClick={onDownload}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                >
                  <FileDown className="h-4 w-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          </CardHeader>
        <CardContent className="bg-slate-100 dark:bg-slate-800/90 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow className="bg-slate-200 dark:bg-slate-900/80">
                  <TableCell header className="text-sm font-bold text-slate-900 dark:text-white">Date</TableCell>
                  <TableCell header className="text-sm font-bold text-slate-900 dark:text-white">Model</TableCell>
                  <TableCell header className="text-sm font-bold text-slate-900 dark:text-white">Quantity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recent.length === 0 ? (
                  <TableRow className="bg-slate-100 dark:bg-slate-800/60">
                    <TableCell colSpan={3} className="text-center py-8">
                      <span className="text-slate-900 dark:text-white font-medium">No procurement history yet.</span>
                    </TableCell>
                  </TableRow>
                ) : (
                  recent.map((r, i) => (
                    <TableRow key={i} className="bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700/80">
                      <TableCell className="text-sm font-semibold text-slate-900 dark:text-white">
                        {formatDate(r.timestamp)}
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-slate-900 dark:text-white">
                        {r.model}
                      </TableCell>
                      <TableCell className="text-sm font-bold text-slate-900 dark:text-white">
                        {r.qty}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>

      {/* vendor suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Suggestions />
      </motion.div>
    </>
  )
}

/* ---------- Smart Inventory Assistant Modals ---------- */

/* Total SKUs Modal */
function TotalSKUsModal({
  open,
  onClose,
  items,
}: {
  open: boolean
  onClose: () => void
  items: InventoryRow[]
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-500 to-blue-600">
          <div>
            <h2 className="text-2xl font-bold text-white">📦 Total SKUs</h2>
            <p className="text-blue-100 mt-1">All {items.length} items in inventory</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">No items in inventory</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {items.map((item, index) => {
                const stockStatus = item.available >= item.required ? 'healthy' : 'low'
                const statusColor = stockStatus === 'healthy'
                  ? 'text-green-600 bg-green-50 border-green-200'
                  : 'text-orange-600 bg-orange-50 border-orange-200'
                const statusIcon = stockStatus === 'healthy' ? '✅' : '⚠️'

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{statusIcon}</span>
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-white">{item.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Available: {item.available} | Required: {item.required}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                      {stockStatus === 'healthy' ? 'Healthy' : 'Low Stock'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

/* Healthy Stock Modal */
function HealthyStockModal({
  open,
  onClose,
  items,
}: {
  open: boolean
  onClose: () => void
  items: InventoryRow[]
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-green-500 to-green-600">
          <div>
            <h2 className="text-2xl font-bold text-white">✅ Healthy Stock</h2>
            <p className="text-green-100 mt-1">{items.length} items with adequate stock levels</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">No items with healthy stock levels</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {items.map((item, index) => {
                const surplus = item.available - item.required
                const surplusPercentage = item.required > 0 ? Math.round((surplus / item.required) * 100) : 0

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">✅</span>
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-white">{item.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          Available: {item.available} | Required: {item.required}
                        </p>
                        {surplus > 0 && (
                          <p className="text-xs text-green-600 dark:text-green-400">
                            +{surplus} surplus ({surplusPercentage > 0 ? `+${surplusPercentage}%` : 'adequate'})
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                      Healthy
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

/* Low Stock Modal */
function LowStockModal({
  open,
  onClose,
  items,
}: {
  open: boolean
  onClose: () => void
  items: InventoryRow[]
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-orange-500 to-orange-600">
          <div>
            <h2 className="text-2xl font-bold text-white">⚠️ Low Stock</h2>
            <p className="text-orange-100 mt-1">{items.length} items below required levels</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">Great! No items with low stock 🎉</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {items
                .sort((a, b) => (b.required - b.available) - (a.required - a.available)) // Sort by urgency
                .map((item, index) => {
                  const shortage = item.required - item.available
                  const criticalLevel = item.available === 0 ? 'critical' : item.available < item.required * 0.3 ? 'urgent' : 'low'
                  const statusColor =
                    criticalLevel === 'critical' ? 'text-red-600 bg-red-50 border-red-200' :
                    criticalLevel === 'urgent' ? 'text-orange-600 bg-orange-50 border-orange-200' :
                    'text-yellow-600 bg-yellow-50 border-yellow-200'
                  const statusIcon =
                    criticalLevel === 'critical' ? '🚨' :
                    criticalLevel === 'urgent' ? '⚠️' : '📦'

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{statusIcon}</span>
                        <div>
                          <h3 className="font-medium text-slate-900 dark:text-white">{item.name}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            Available: {item.available} | Required: {item.required}
                          </p>
                          <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                            Need {shortage} more units
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                        {criticalLevel === 'critical' ? 'Critical' : criticalLevel === 'urgent' ? 'Urgent' : 'Low Stock'}
                      </span>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

/* Forecasted Modal */
function ForecastedModal({
  open,
  onClose,
  items,
}: {
  open: boolean
  onClose: () => void
  items: ForecastRow[]
}) {
  if (!open) return null

  const totalForecast = items.reduce((sum, item) => sum + item.qty, 0)
  const sortedItems = [...items].sort((a, b) => b.qty - a.qty) // Sort by quantity descending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-purple-500 to-purple-600">
          <div>
            <h2 className="text-2xl font-bold text-white">📈 Forecasted Demand</h2>
            <p className="text-purple-100 mt-1">{totalForecast} total units forecasted across {items.length} models</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">No forecast data available</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {sortedItems.map((item, index) => {
                const demandLevel =
                  item.qty >= 20 ? 'high' :
                  item.qty >= 10 ? 'medium' : 'low'
                const demandColor =
                  demandLevel === 'high' ? 'text-red-600 bg-red-50 border-red-200' :
                  demandLevel === 'medium' ? 'text-orange-600 bg-orange-50 border-orange-200' :
                  'text-blue-600 bg-blue-50 border-blue-200'
                const demandIcon =
                  demandLevel === 'high' ? '🔥' :
                  demandLevel === 'medium' ? '📊' : '📈'
                const percentage = totalForecast > 0 ? Math.round((item.qty / totalForecast) * 100) : 0

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{demandIcon}</span>
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-white">{item.model}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          Forecasted quantity: {item.qty} units
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-400">
                          {percentage}% of total forecast
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${demandColor}`}>
                        {demandLevel === 'high' ? 'High Demand' : demandLevel === 'medium' ? 'Medium Demand' : 'Low Demand'}
                      </span>
                      <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{item.qty}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {items.length > 0 && (
            <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <h4 className="font-medium text-slate-900 dark:text-white mb-2">📊 Forecast Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Total Models</p>
                  <p className="font-bold text-slate-900 dark:text-white">{items.length}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Total Units</p>
                  <p className="font-bold text-slate-900 dark:text-white">{totalForecast}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">High Demand</p>
                  <p className="font-bold text-red-600">{sortedItems.filter(i => i.qty >= 20).length}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Average/Model</p>
                  <p className="font-bold text-slate-900 dark:text-white">{Math.round(totalForecast / items.length)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}