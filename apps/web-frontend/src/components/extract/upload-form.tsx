"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileUp, CheckCircle, AlertTriangle, MailCheck, LineChart, Upload, Loader2, FileText, Zap, Mail, Send, Clock, Users } from "lucide-react"

import ExtractedTable from "../extract/extracted-table"
import ShortfallTable from "../extract/shortfall-table"
import JSONView from "../ui/json-view"
import { cn } from "@/lib/utils"

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  const handleUpload = async () => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Max allowed is 10MB.")
      return
    }

    setLoading(true)
    setResult(null)
    setError("")

    const form = new FormData()
    form.append("file", file)

    try {
      const { apiFetch, API_ENDPOINTS } = await import("@/lib/api-config")

      // Create abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

      const res = await apiFetch(API_ENDPOINTS.RUN_PIPELINE, {
        method: "POST",
        body: form,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        const errorText = await res.text()
        console.error(`Pipeline failed with status ${res.status}:`, errorText)
        throw new Error(`Pipeline failed (${res.status}): ${errorText}`)
      }

      const data = await res.json()
      setResult(data)
    } catch (err: any) {
      console.error("Pipeline error:", err)
      if (err.name === 'AbortError') {
        setError("Pipeline processing timed out after 60 seconds. The PDF might be too complex or the server is overloaded.")
      } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError("Cannot connect to backend server. Please ensure the API server is running on port 8000.")
      } else if (err.message.includes('timeout')) {
        setError("Pipeline processing timed out. The PDF might be too complex or the server is overloaded.")
      } else {
        setError(err.message || "Failed to process PDF. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Enhanced Upload Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className={cn(
          "border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300",
          file
            ? "border-green-300 bg-green-50/50 dark:border-green-700 dark:bg-green-900/20"
            : "border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
        )}>
          <label className="cursor-pointer flex flex-col items-center space-y-4 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "p-6 rounded-2xl transition-all duration-300",
                file
                  ? "bg-green-100 dark:bg-green-900/30"
                  : "bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50"
              )}
            >
              {file ? (
                <CheckCircle className="h-12 w-12 text-green-600" />
              ) : (
                <Upload className="h-12 w-12 text-blue-600" />
              )}
            </motion.div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                {file ? "PDF Ready for Processing" : "Upload Solar Installation PDF"}
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                {file ? "Click 'Run Pipeline' to analyze your document" : "Drag & drop your PDF here or click to browse"}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Maximum file size: 10MB • Supported format: PDF
              </p>
            </div>

            <input
              type="file"
              accept=".pdf"
              hidden
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>
      </motion.div>

      {/* File Info */}
      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-slate-900 dark:text-white">{file.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {Math.round(file.size / 1024)} KB • PDF Document
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex justify-center"
      >
        <motion.button
          onClick={handleUpload}
          disabled={!file || loading}
          whileHover={!loading && file ? { scale: 1.02 } : {}}
          whileTap={!loading && file ? { scale: 0.98 } : {}}
          className={cn(
            "px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center space-x-3 shadow-lg",
            loading
              ? "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
              : file
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25 hover:shadow-blue-500/40"
              : "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Processing Document...</span>
            </>
          ) : (
            <>
              <Zap className="h-5 w-5" />
              <span>Run AI Analysis</span>
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Enhanced Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900 dark:text-red-100">Processing Error</p>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Results Display */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="space-y-8 mt-12"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4"
              >
                <CheckCircle className="h-8 w-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Analysis Complete!
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Your PDF has been successfully processed and analyzed
              </p>
            </div>

            {/* Enhanced Extracted Equipment Table */}
            {result.extracted && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                      Extracted Equipment
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Solar components identified from your document
                    </p>
                  </div>
                </div>
                <ExtractedTable data={result.extracted} />
              </motion.div>
            )}

            {/* Enhanced Inventory Shortfall */}
            {result.shortfall && Object.keys(result.shortfall).length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                      Inventory Shortfall Detected
                    </h3>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Items that need to be procured for this project
                    </p>
                  </div>
                </div>
                <ShortfallTable data={result.shortfall} />
              </motion.div>
            )}



            {/* Enhanced Email Notification with Animations */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className={cn(
                "relative overflow-hidden rounded-2xl p-8 text-center shadow-lg border",
                result.shortfall && Object.keys(result.shortfall).length > 0
                  ? "bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-800"
                  : "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800"
              )}
            >
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                {result.shortfall && Object.keys(result.shortfall).length > 0 ? (
                  // Email sent animation
                  <>
                    <motion.div
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 100, opacity: [0, 1, 0] }}
                      transition={{ duration: 2, delay: 0.8, repeat: Infinity, repeatDelay: 3 }}
                      className="absolute top-4 left-0 w-8 h-8 bg-emerald-400/20 rounded-full"
                    />
                    <motion.div
                      initial={{ x: -80, opacity: 0 }}
                      animate={{ x: 120, opacity: [0, 1, 0] }}
                      transition={{ duration: 2.2, delay: 1.2, repeat: Infinity, repeatDelay: 3 }}
                      className="absolute top-8 left-0 w-6 h-6 bg-green-400/20 rounded-full"
                    />
                    <motion.div
                      initial={{ x: -60, opacity: 0 }}
                      animate={{ x: 140, opacity: [0, 1, 0] }}
                      transition={{ duration: 1.8, delay: 1.6, repeat: Infinity, repeatDelay: 3 }}
                      className="absolute top-12 left-0 w-4 h-4 bg-emerald-500/20 rounded-full"
                    />
                  </>
                ) : (
                  // No action needed animation
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute top-4 right-4 w-12 h-12 border-2 border-blue-200/30 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute bottom-4 left-4 w-8 h-8 bg-blue-200/20 rounded-full"
                    />
                  </>
                )}
              </div>

              {/* Main Content */}
              <div className="relative z-10">
                {/* Animated Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.8, delay: 0.6, type: "spring", bounce: 0.4 }}
                  className="flex items-center justify-center mb-6"
                >
                  {result.shortfall && Object.keys(result.shortfall).length > 0 ? (
                    <div className="relative">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="p-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl shadow-lg"
                      >
                        <Send className="h-8 w-8 text-white" />
                      </motion.div>
                      {/* Pulse effect */}
                      <motion.div
                        animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-emerald-400 rounded-2xl"
                      />
                    </div>
                  ) : (
                    <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                  )}
                </motion.div>

                {/* Title with typewriter effect */}
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className={cn(
                    "text-2xl font-bold mb-4",
                    result.shortfall && Object.keys(result.shortfall).length > 0
                      ? "text-emerald-900 dark:text-emerald-100"
                      : "text-blue-900 dark:text-blue-100"
                  )}
                >
                  {result.shortfall && Object.keys(result.shortfall).length > 0
                    ? "🚀 Procurement Team Notified!"
                    : "✨ All Systems Green!"}
                </motion.h3>

                {/* Engaging description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 }}
                  className="space-y-3 mb-6"
                >
                  <p className={cn(
                    "text-lg font-medium",
                    result.shortfall && Object.keys(result.shortfall).length > 0
                      ? "text-emerald-800 dark:text-emerald-200"
                      : "text-blue-800 dark:text-blue-200"
                  )}>
                    {result.shortfall && Object.keys(result.shortfall).length > 0
                      ? "Your procurement request is on its way!"
                      : "Perfect! Your inventory is fully stocked."}
                  </p>

                  <p className={cn(
                    "text-sm",
                    result.shortfall && Object.keys(result.shortfall).length > 0
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-blue-700 dark:text-blue-300"
                  )}>
                    {result.shortfall && Object.keys(result.shortfall).length > 0
                      ? "Our AI has automatically sent detailed procurement requirements to your supply chain team. They'll receive specifications, quantities, and priority levels for immediate action."
                      : "All required components are available in your current inventory. No additional procurement needed for this solar installation project."}
                  </p>
                </motion.div>

                {/* Animated Status Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.2, type: "spring", bounce: 0.3 }}
                  className="flex items-center justify-center gap-2"
                >
                  <div className={cn(
                    "flex items-center gap-3 px-6 py-3 rounded-full font-semibold shadow-lg",
                    result.shortfall && Object.keys(result.shortfall).length > 0
                      ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700"
                      : "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700"
                  )}>
                    {result.shortfall && Object.keys(result.shortfall).length > 0 ? (
                      <>
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 0.5, delay: 1.4 }}
                        >
                          <Mail className="h-5 w-5" />
                        </motion.div>
                        <span>Email Delivered Successfully</span>
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-2 h-2 bg-emerald-500 rounded-full"
                        />
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        <span>No Action Required</span>
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      </>
                    )}
                  </div>
                </motion.div>

                {/* Additional info for email sent */}
                {result.shortfall && Object.keys(result.shortfall).length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.5, delay: 1.4 }}
                    className="mt-6 pt-6 border-t border-emerald-200 dark:border-emerald-800"
                  >
                    <div className="flex items-center justify-center gap-6 text-sm text-emerald-700 dark:text-emerald-300">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Team Notified</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Instant Delivery</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Action Required</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
