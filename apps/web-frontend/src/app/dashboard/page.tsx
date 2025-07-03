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
        fetcher('http://localhost:8000/stats/'),
        fetcher('http://localhost:8000/inventory/'),
        fetcher('http://localhost:8000/forecast/'),
        fetcher('http://localhost:8000/procurement/logs'),
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
    <div className="space-y-8">
      <Header />

      {/* KPI GRID */}
      <motion.section
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
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

      {/* ---------- CHART ---------- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📈 Upcoming Part Shortages <span className="font-normal">(next jobs)</span>
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
                className="text-sm text-muted-foreground"
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
                <p className="text-xs text-muted-foreground mb-1">
                  Total needed: <strong>{totalForecast}</strong>
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
                    <Tooltip />
                    <Bar dataKey="qty" animationDuration={600} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* ---------- TABLES ---------- */}
      <InventoryTable data={inventory} />
      <ProcurementTableDashboard logs={logs} onDownload={exportCSV} />
    </div>
  )
}

/* ========================================================= */
/* ---------- sub‑components ----------                      */
/* ========================================================= */

function KPI({
  title,
  value,
  icon,
  colour = '',
  link,
  onDetails,
}: {
  title   : string
  value   : string | number
  icon    : React.ReactNode
  colour ?: string
  link   ?: { href: string; label: string }
  onDetails?: () => void         // new
}) {
  return (
    <Card>
      <CardContent className="p-5 flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <div className="rounded-full p-2 bg-muted">{icon}</div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={cn('text-2xl font-bold', colour)}>{value}</p>
          </div>
        </div>

        {/* clickable details OR normal link */}
        {onDetails ? (
          <button
            onClick={onDetails}
            className="ml-[48px] text-base font-semibold text-blue-600 hover:underline transition-colors"
          >
            Details →
          </button>
        ) : link ? (
          <Link
            href={link.href}
            className="ml-[48px] text-base font-semibold text-blue-600 hover:underline transition-colors"
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
          <div className="rounded-full p-2 bg-muted">{icon}</div>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>

        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground ml-[48px]">{emptyText}</p>
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
            <span className="text-sm font-semibold text-blue-600 hover:underline">
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
        className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Inventory Risk — {level}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {lowItems.length === 0 ? (
          <p className="text-sm">All good — no risky parts right now! 🎉</p>
        ) : (
          <>
            <p className="text-sm">
              {lowItems.length} SKU{lowItems.length > 1 && 's'} below required
              levels:
            </p>
            <ul className="list-disc ml-6 text-sm space-y-1">
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
            <p className="text-sm pt-2">
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
        className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Warehouse Health — {healthyPct} %
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <p className="text-sm">
          {healthyPct}% of SKUs have enough stock to cover the
          next&nbsp;forecasted jobs.
        </p>

        {/* Strong points */}
        <div>
          <p className="text-sm font-medium mb-1">✅ Strong areas:</p>
          <ul className="list-disc ml-6 text-sm space-y-1">
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
            <p className="text-sm font-medium mt-2 mb-1">
              💡 Overstocked (≥ 200 % of need):
            </p>
            <ul className="list-disc ml-6 text-sm space-y-1">
              {overstocked.map((it, i) => (
                <li key={i}>
                  <strong>{it.name}</strong> — {it.available} in stock vs&nbsp;
                  {it.required} required.
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-sm pt-2">
          📌 <em>Tip:</em> regularly review supplier MOQs and delivery cadence to
          keep stock lean yet safe.
        </p>
      </motion.div>
    </div>
  )
}

/* ---------- Inventory table ---------- */
function InventoryTable({ data }: { data: InventoryRow[] }) {
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
                  <TableRow key={i} className="hover:bg-muted/50">
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

/* ---------- Procurement history + suggestions ---------- */
function ProcurementTableDashboard({
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
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>📩 Latest 10 Procurements</CardTitle>
          <div className="flex items-center gap-4">
            <Link
              href="/procurement"
              className="text-sm text-primary hover:underline"
            >
              View full history →
            </Link>
            <button
              onClick={onDownload}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <FileDown className="h-4 w-4" /> CSV
            </button>
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
                    <TableCell colSpan={3}>
                      No procurement history yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  recent.map((r, i) => (
                    <TableRow key={i}>
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

      {/* vendor suggestions */}
      <Suggestions />
    </>
  )
}
