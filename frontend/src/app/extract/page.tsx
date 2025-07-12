// src/app/extract/page.tsx
"use client"

import { motion } from "framer-motion"
import { FileText, Zap, Brain, Upload, ArrowRight, CheckCircle, BarChart3 } from "lucide-react"
import UploadForm from "@/components/extract/upload-form"

export default function ExtractPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      {/* Enhanced Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10" />
        <div className="absolute inset-0 opacity-40">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="relative px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-6">
                <Brain className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
                Solar Intelligence Engine
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Transform your solar installation PDFs into actionable insights with AI-powered document analysis
              </p>
            </motion.div>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-3 mb-8"
            >
              {[
                { icon: FileText, label: "PDF Analysis", color: "from-blue-500 to-blue-600" },
                { icon: Zap, label: "Instant Processing", color: "from-green-500 to-green-600" },
                { icon: BarChart3, label: "Smart Forecasting", color: "from-purple-500 to-purple-600" },
                { icon: CheckCircle, label: "Inventory Sync", color: "from-orange-500 to-orange-600" }
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-sm border border-white/20"
                >
                  <div className={`p-1.5 bg-gradient-to-r ${feature.color} rounded-full`}>
                    <feature.icon className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{feature.label}</span>
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
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative px-6 pb-12"
      >
        <div className="max-w-4xl mx-auto">
          {/* Process Steps */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                step: "01",
                title: "Upload PDF",
                description: "Drop your solar installation PDF document",
                icon: Upload,
                color: "from-blue-500 to-blue-600"
              },
              {
                step: "02",
                title: "AI Analysis",
                description: "Our AI extracts equipment and specifications",
                icon: Brain,
                color: "from-purple-500 to-purple-600"
              },
              {
                step: "03",
                title: "Get Insights",
                description: "Receive inventory analysis and forecasts",
                icon: BarChart3,
                color: "from-green-500 to-green-600"
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                className="relative"
              >
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`p-3 bg-gradient-to-r ${step.color} rounded-xl shadow-lg`}>
                      <step.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-slate-400 dark:text-slate-500">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">
                    {step.description}
                  </p>
                </div>

                {/* Arrow connector */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-slate-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Upload Form Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8"
          >
            <UploadForm />
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
