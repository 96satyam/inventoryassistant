
"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  AlertCircle,
  RefreshCw,
  SendHorizonal,
} from "lucide-react"
import toast from "react-hot-toast"

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

  /* fetch once on mount */
  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true)
      try {
        const res  = await fetch("http://localhost:8000/forecast/")
        const json = await res.json()
        setRows(Array.isArray(json) ? json : [])
      } catch (err) {
        console.error("Failed to load forecast:", err)
        toast.error("Couldn’t load forecast data")
        setRows([])
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

    if (!res.ok) throw new Error("Invalid response");

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
    console.error("WhatsApp error:", err);
    toast.error("WhatsApp launch failed");
  } finally {
    setSending(false);
  }
}, []);



  /* ---------- render ---------- */
  return (
    <div className="mt-6 space-y-4">
      {/* header row with spinner + send button */}
      <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
        <div className="flex items-center gap-2">
          <LineChart className="h-5 w-5" />
          Forecasted Inventory Demand&nbsp;
          <span className="text-xs">(next 5 installs)</span>
          {loading && <RefreshCw className="h-4 w-4 ml-1 animate-spin" />}
        </div>

        <Button
          size="sm"
          onClick={handleSendWhatsApp}
          disabled={loading || sending || rows.length === 0}
          className="ml-auto"
        >
          {sending ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <SendHorizonal className="h-4 w-4 mr-2" />
          )}
          Send via WhatsApp
        </Button>
      </div>

      {/* empty‑state vs table */}
      {!loading && rows.length === 0 ? (
        <div className="text-red-500 flex items-center gap-2 mt-2">
          <AlertCircle className="h-4 w-4" />
          No forecast data available.
        </div>
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

              return (
                <TableRow
                  key={i}
                  className={row.is_urgent ? "bg-red-50" : ""}
                >
                  <TableCell>{row.model}</TableCell>
                  <TableCell className="text-right font-medium">
                    {row.qty}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {pct}%
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
