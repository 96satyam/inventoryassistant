"use client";

import { motion, AnimatePresence } from "framer-motion"
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { FileDown, Clock, AlertTriangle, Package, ShoppingCart, Calendar, Hash, Bot, TrendingUp } from "lucide-react";
import { formatDate } from "@/lib/date";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

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
  // Use logs directly from props - parent handles fetching
  const logs = logsProp ?? [];
  const loading = false; // Parent handles loading state

  // Flatten logs and apply row-level limit
  const flatRows = useMemo(() => {
    try {
      return logs.flatMap((entry) => {
        // Ensure entry has required fields
        if (!entry.timestamp || !entry.items || typeof entry.items !== 'object') {
          console.warn("Invalid log entry:", entry);
          return [];
        }

        return Object.entries(entry.items).map(([model, qty]) => ({
          timestamp: entry.timestamp,
          model,
          qty: Number(qty) || 0,  // ✅ Force to number
        }));
      });
    } catch (error) {
      console.error("Error processing procurement logs:", error);
      return [];
    }
  }, [logs]);

  const visibleRows = limit ? flatRows.slice(0, limit) : flatRows;

  // Debug logging
  console.log("ProcurementTable Debug:", {
    logs: logs,
    flatRows: flatRows,
    visibleRows: visibleRows,
    loading: loading
  });

  // Calculate summary stats
  const totalItems = visibleRows.reduce((sum, row) => sum + row.qty, 0);
  const uniqueModels = new Set(visibleRows.map(row => row.model)).size;
  const recentActions = visibleRows.filter(row => {
    const actionDate = new Date(row.timestamp);
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return actionDate > dayAgo;
  }).length;

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Stats */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <Bot className="h-5 w-5 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            AI-Driven Procurement
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Clock className="h-4 w-4" />
          <span>{visibleRows.length} Total Actions</span>
        </div>
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
            label: "Total Items Ordered",
            value: totalItems,
            icon: Package,
            color: "text-emerald-600",
            bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
          },
          {
            label: "Unique Models",
            value: uniqueModels,
            icon: ShoppingCart,
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
          },
          {
            label: "Recent Actions (24h)",
            value: recentActions,
            icon: TrendingUp,
            color: "text-purple-600",
            bg: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
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

      {/* Enhanced Table */}
      {loading ? (
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
              <Clock className="h-5 w-5 text-emerald-600" />
            </motion.div>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Loading procurement data...
            </span>
          </div>
        </motion.div>
      ) : visibleRows.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-xl border border-orange-200 dark:border-orange-800">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">No procurement history available yet</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
            Procurement actions will appear here when triggered by the AI pipeline
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          <Table>
            <TableHead>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <TableCell header className="font-semibold text-slate-900 dark:text-white py-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Timestamp
                  </div>
                </TableCell>
                <TableCell header className="font-semibold text-slate-900 dark:text-white py-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Model
                  </div>
                </TableCell>
                <TableCell header className="font-semibold text-slate-900 dark:text-white py-4">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Quantity
                  </div>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <AnimatePresence>
                {visibleRows.map((row, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {formatDate(row.timestamp)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <Package className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {row.model}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-sm font-semibold",
                          row.qty > 10
                            ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                            : row.qty > 5
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300"
                            : "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                        )}>
                          {row.qty}
                        </span>
                        {row.qty > 10 && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Bulk Order
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </motion.div>
      )}
    </div>
  );
}
