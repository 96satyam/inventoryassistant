/* --------------------  DASHBOARD PAGE  -------------------- */
'use client'

import { useEffect, useState, useMemo } from 'react'
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { saveAs } from 'file-saver'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { formatDate } from '@/lib/date'

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
    required: 0,           // patched later from forecast
  }))

/* ========================================================= */
export default function DashboardPage() {
  /* ---- state ---- */
  const [stats,     setStats]     = useState<any>(null)
  const [inv,       setInv]       = useState<InventoryRow[]>([])
  const [forecast,  setForecast]  = useState<ForecastRow[]>([])
  const [logs,      setLogs]      = useState<LogEntry[]>([])
  const [loading,   setLoading]   = useState(true)

  /* KPI modals */
  const [riskOpen,    setRiskOpen]    = useState(false)
  const [healthOpen,  setHealthOpen]  = useState(false)

  /* ---- API pull ---- */
  const pullAll = async () => {
    try {
      const [s, i, f, l] = await Promise.all([
        fetch('http://localhost:8000/stats/').then(r => r.json()),
        fetch('http://localhost:8000/inventory/').then(r => r.json()),
        fetch('http://localhost:8000/forecast/').then(r => r.json()),
        fetch('http://localhost:8000/procurement/logs').then(r => r.json()),
      ])

      setStats(s)
      setInv(normaliseInventory(i ?? []))


      /* --- normalise forecast --- */
      const parsed: ForecastRow[] = Array.isArray(f)
        ? f.map((o: any) => ({
            model: String(o.model ?? o.name ?? 'Unknown'),
            qty  : Number(o.qty ?? o.quantity ?? 0) || 0,
          }))
        : f && typeof f === 'object'
          ? Object.entries(f).map(([m, q]) => ({
              model: String(m),
              qty  : Number(q) || 0,
            }))
          : []

      setForecast(parsed)
      setLogs(Array.isArray(l) ? l : [])
    } catch {
      toast.error('❌ Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  /* ---- load on mount ---- */
  useEffect(() => {
    pullAll()
    const id = setInterval(pullAll, 20_000)
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
      required: demandMap[row.name] ?? 0,
    }))
  }, [inv, demandMap])

  /* ---- totals & helpers ---- */
  const totalForecast = useMemo(
    () => forecast.reduce((s, x) => s + x.qty, 0),
    [forecast],
  )

  /* low‑stock toast */
  useEffect(() => {
    const low = inventory.filter(r => r.available < r.required)
    if (low.length) {
      toast(`⚠️ Low stock: ${low.map(r => r.name).join(', ')}`)
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
    .slice(0, 3)

  const healthyItems  = inventory.filter(r => r.available >= r.required)
  const healthyPct    = inventory.length
      ? Math.round((healthyItems.length / inventory.length) * 100)
      : 100

  const overstocked = healthyItems
    .filter(r => r.available >= r.required * 2)          // ≥200 % of need
    .sort((a, b) => (b.available - b.required) - (a.available - a.required))
    .slice(0, 3)

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
          <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  🧠 Smart Inventory Assistant
                </h1>
                <p className="text-slate-600 dark:text-slate-300 mt-2 text-lg">
                  AI-powered inventory management with predictive analytics
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-full">
                  <Activity className="h-4 w-4 text-green-600 animate-pulse" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">Live Data</span>
                </div>
                <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Auto-refresh: 20s</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total SKUs</p>
                    <p className="text-2xl font-bold">{inventory.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-200" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Healthy Stock</p>
                    <p className="text-2xl font-bold">{healthyItems.length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-200" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Low Stock</p>
                    <p className="text-2xl font-bold">{lowItems.length}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-200" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
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

        {/* Enhanced KPI GRID */}
        <motion.section
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
        >
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
          />
        </motion.div>

        {/* --- ② Urgent Top‑3 --- */}
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
            titleStyle="text-sm font-bold text-black dark:text-white"
          />
        </motion.div>

        {/* --- ④ Warehouse Healthy --- */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.4 }}
        >
          <KPI
            title="Warehouse Healthy"
            value={`${healthyPct} %`}
            icon={<TrendingUp className="h-5 w-5" />}
            colour="text-green-600"
            onDetails={() => setHealthOpen(true)}
          />
        </motion.div>
      </motion.section>

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
                  <BarChart data={forecast} layout="vertical" margin={{ left: 90 }}>
                    <XAxis type="number" />
                    <YAxis
                      dataKey="model"
                      type="category"
                      width={200}
                      tickFormatter={v => v.length > 22 ? v.slice(0, 20) + '…' : v}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar
                      dataKey="qty"
                      animationDuration={600}
                      fill="url(#barGradient)"
                      radius={[0, 4, 4, 0]}
                    />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#6366F1" />
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
        <EnhancedInventoryTable data={inventory} />
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
            <p className="text-3xl font-bold">{value}</p>
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
                  <span className="text-sm truncate flex-1">{item.label}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{item.value}</span>
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
      <CardContent className="p-5 flex flex-col gap-3">
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
}: {
  title    : string
  icon     : React.ReactNode
  items    : { label: string; value: string | number }[]
  emptyText: string
  link?    : { href: string; label: string }
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-4 mb-3">
          <div className="rounded-full p-2 bg-slate-100 dark:bg-slate-700">{icon}</div>
          <p className="text-sm text-slate-600 dark:text-slate-300">{title}</p>
        </div>

        {items.length === 0 ? (
          <p className="text-xs text-slate-600 dark:text-slate-300 ml-[48px]">{emptyText}</p>
        ) : (
          <ul className="space-y-1 text-sm ml-[48px]">
            {items.map((it, i) => (
              <li key={i} className="flex justify-between">
                <span className="truncate">{it.label}</span>
                <span className="font-medium">{it.value}</span>
              </li>
            ))}
          </ul>
        )}

        {link && (
          <Link
            href={link.href}
            className="ml-[48px] mt-3 inline-block"
          >
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline">
              {link.label}
            </span>
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
function EnhancedInventoryTable({ data }: { data: InventoryRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>📦 Current Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell header>Item</TableCell>
                <TableCell header>Available</TableCell>
                <TableCell header>Required</TableCell>
                <TableCell header>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((it, i) => {
                const low = it.available < it.required
                return (
                  <TableRow key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <TableCell>{it.name}</TableCell>
                    <TableCell>{it.available || '–'}</TableCell>
                    <TableCell>{it.required || '–'}</TableCell>
                    <TableCell
                      className={cn(
                        'font-medium',
                        low ? 'text-red-600' : 'text-green-600',
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
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell header>Date</TableCell>
                  <TableCell header>Model</TableCell>
                  <TableCell header>Quantity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recent.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      <span className="text-muted-foreground">No procurement history yet.</span>
                    </TableCell>
                  </TableRow>
                ) : (
                  recent.map((r, i) => (
                    <TableRow key={i} className="hover:bg-muted/50">
                      <TableCell>{formatDate(r.timestamp)}</TableCell>
                      <TableCell>{r.model}</TableCell>
                      <TableCell>{r.qty}</TableCell>
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
