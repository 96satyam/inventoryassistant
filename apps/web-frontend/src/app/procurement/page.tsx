// apps/web-frontend/src/app/procurement/page.tsx
"use client"

import { motion } from "framer-motion"
import { ShoppingCart, Bot, TrendingUp, Package, Clock, BarChart3, Zap, CheckCircle } from "lucide-react"
import ProcurementTable from "@/components/procurement/procurement-table"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAuthState } from "@/utils/authMiddleware"
import { apiFetch, API_ENDPOINTS, getApiBaseUrl } from "@/lib/api-config"

export default function ProcurementPage() {
  const router = useRouter()
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication first
    const authState = getAuthState()
    if (!authState.isAuthenticated) {
      router.push('/login')
      return
    }

    const fetchLogs = async () => {
      setLoading(true);
      try {
        // Use API config for consistent endpoint management
        const {
          isBackendAvailable,
          getDataWithFallback,
          FALLBACK_LOGS
        } = await import("@/utils/fallback-data")

        // Check if backend is available
        const backendAvailable = await isBackendAvailable(getApiBaseUrl())

        if (!backendAvailable) {
          console.log("Backend unavailable, using fallback data");
          setLogs(FALLBACK_LOGS);
          return;
        }

        // Fetch all procurement logs (no limit for procurement page)
        const data = await getDataWithFallback(
          () => apiFetch(API_ENDPOINTS.PROCUREMENT_LOGS).then(r => r.json()),
          FALLBACK_LOGS
        );

        console.log("Procurement logs loaded:", data?.length || 0, "entries");

        if (Array.isArray(data)) {
          setLogs(data);
        } else {
          console.error("Invalid data format received from API");
          setLogs(FALLBACK_LOGS);
        }
      } catch (error) {
        console.error("Failed to fetch procurement logs:", error);
        // Use fallback data from utils
        const { FALLBACK_LOGS } = await import("@/utils/fallback-data")
        setLogs(FALLBACK_LOGS);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [router]);



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      {/* Enhanced Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-teal-600/10" />
        <div className="absolute inset-0 opacity-40">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310B981' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
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
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg mb-6">
                <ShoppingCart className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
                AI Procurement Center
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Intelligent procurement actions triggered by AI pipeline analysis and inventory optimization
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
                  icon: Bot,
                  label: "AI Powered",
                  value: "Automated",
                  color: "from-emerald-500 to-emerald-600",
                  bgColor: "from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20"
                },
                {
                  icon: Zap,
                  label: "Real-time",
                  value: "Instant",
                  color: "from-teal-500 to-teal-600",
                  bgColor: "from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20"
                },
                {
                  icon: TrendingUp,
                  label: "Optimization",
                  value: "Active",
                  color: "from-blue-500 to-blue-600",
                  bgColor: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
                },
                {
                  icon: BarChart3,
                  label: "Analytics",
                  value: "Enabled",
                  color: "from-purple-500 to-purple-600",
                  bgColor: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20"
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
                { icon: CheckCircle, label: "Pipeline Active", color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
                { icon: Clock, label: "Last Action: Recently", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
                { icon: Package, label: "Smart Ordering", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" }
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
          {/* Procurement Table Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Procurement Activity Log
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Track all AI-driven procurement decisions and automated ordering actions
              </p>

            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-slate-600 dark:text-slate-300">Loading procurement data...</span>
              </div>
            ) : (
              <ProcurementTable logs={logs} />
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
