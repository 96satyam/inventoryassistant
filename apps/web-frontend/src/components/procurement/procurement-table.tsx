"use client";

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { FileDown, Clock, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/date";
import { useEffect, useMemo, useState } from "react";

export type ProcurementEntry = {
  timestamp: string;
  items: Record<string, number>;
};

export default function ProcurementTable({
  logs: logsProp,
  limit,
}: {
  logs?: ProcurementEntry[];
  limit?: number;
}) {
  const [logs, setLogs] = useState<ProcurementEntry[]>(logsProp ?? []);
  const [loading, setLoading] = useState(!logsProp);

  // Fetch from backend if not provided
  useEffect(() => {
    if (logsProp) return;

    const fetchLogs = async () => {
      try {
        const res = await fetch("http://localhost:8000/procurement/logs");
        const json = await res.json();
        setLogs(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error("Failed to fetch procurement logs", err);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [logsProp]);

  // Flatten logs and apply row-level limit
  const flatRows = useMemo(() => {
  return logs.flatMap((entry) =>
    Object.entries(entry.items).map(([model, qty]) => ({
      timestamp: entry.timestamp,
      model,
      qty: Number(qty) || 0,  // ✅ Force to number
    }))
  );
}, [logs]);

  const visibleRows = limit ? flatRows.slice(0, limit) : flatRows;

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5" />
        Procurement History
      </h2>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : visibleRows.length === 0 ? (
        <div className="text-muted-foreground text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          No procurement history yet.
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell header>Timestamp</TableCell>
              <TableCell header>Model</TableCell>
              <TableCell header>Quantity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.map((row, i) => (
              <TableRow key={i}>
                <TableCell>{formatDate(row.timestamp)}</TableCell>
                <TableCell>{row.model}</TableCell>
                <TableCell>{row.qty}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
