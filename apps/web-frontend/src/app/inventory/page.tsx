"use client"

import { motion } from "framer-motion"
import { Package, Warehouse, BarChart3, RefreshCw, TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import InventoryTable from "@/components/inventory/inventory-table"

export default function InventoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      {/* Enhanced Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-indigo-600/10" />
        <div className="absolute inset-0 opacity-40">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Crect x='11' y='11' width='38' height='38' rx='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="relative px-6 py-12">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg mb-6">
                <Warehouse className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
                Smart Inventory Tracker
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Real-time warehouse monitoring with intelligent stock management and automated alerts
              </p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid md:grid-cols-4 gap-6 mb-8"
            >
              {[
                {
                  icon: Package,
                  label: "Live Tracking",
                  value: "Real-time",
                  color: "from-blue-500 to-blue-600",
                  bgColor: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
                },
                {
                  icon: RefreshCw,
                  label: "Auto Refresh",
                  value: "10 seconds",
                  color: "from-green-500 to-green-600",
                  bgColor: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20"
                },
                {
                  icon: TrendingUp,
                  label: "Smart Alerts",
                  value: "Enabled",
                  color: "from-purple-500 to-purple-600",
                  bgColor: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20"
                },
                {
                  icon: BarChart3,
                  label: "Analytics",
                  value: "Active",
                  color: "from-orange-500 to-orange-600",
                  bgColor: "from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20"
                }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                  className={`bg-gradient-to-br ${stat.bgColor} backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl shadow-lg`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {stat.label}
                      </p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Status Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="flex flex-wrap justify-center gap-4 mb-8"
            >
              {[
                { icon: CheckCircle, label: "System Online", color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
                { icon: Clock, label: "Last Updated: Just now", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
                { icon: AlertTriangle, label: "Low Stock Alerts", color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30" }
              ].map((status, i) => (
                <div
                  key={i}
                  className={`flex items-center space-x-2 px-4 py-2 ${status.bg} backdrop-blur-sm rounded-full shadow-sm border border-white/20`}
                >
                  <status.icon className={`h-4 w-4 ${status.color}`} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{status.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="relative px-6 pb-12"
      >
        <div className="max-w-6xl mx-auto">
          {/* Inventory Table Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Warehouse Inventory
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Monitor your solar component stock levels in real-time with automated refresh every 10 seconds
              </p>
            </div>
            <InventoryTable />
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}