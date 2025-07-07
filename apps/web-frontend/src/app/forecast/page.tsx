"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { TrendingUp, Brain, Target, Zap, BarChart3, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import ForecastTable from "@/components/forecast/forecast-table"
import { getAuthState } from "@/utils/authMiddleware"

export default function ForecastPage() {
  const router = useRouter()

  // Authentication check
  useEffect(() => {
    const authState = getAuthState()
    if (!authState.isAuthenticated) {
      router.push('/login')
      return
    }
  }, [router])
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      {/* Enhanced Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-amber-600/10" />
        <div className="absolute inset-0 opacity-40">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F59E0B' fill-opacity='0.05'%3E%3Cpath d='M30 15l7.5 15H22.5z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
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
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg mb-6">
                <TrendingUp className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
                Demand Forecasting Hub
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                AI-powered demand prediction for optimal inventory planning and resource allocation
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
                  icon: Brain,
                  label: "AI Prediction",
                  value: "Advanced",
                  color: "from-orange-500 to-orange-600",
                  bgColor: "from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20"
                },
                {
                  icon: Target,
                  label: "Accuracy",
                  value: "High",
                  color: "from-amber-500 to-amber-600",
                  bgColor: "from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20"
                },
                {
                  icon: Zap,
                  label: "Real-time",
                  value: "Live",
                  color: "from-yellow-500 to-yellow-600",
                  bgColor: "from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20"
                },
                {
                  icon: BarChart3,
                  label: "Analytics",
                  value: "Active",
                  color: "from-red-500 to-red-600",
                  bgColor: "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20"
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
                { icon: CheckCircle, label: "Forecast Active", color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
                { icon: Clock, label: "Next 5 Installs", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
                { icon: AlertTriangle, label: "Urgency Tracking", color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30" }
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
          {/* Forecast Table Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Demand Forecast Analysis
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Predictive analytics for upcoming installation requirements and inventory needs
              </p>
            </div>
            <ForecastTable />
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
