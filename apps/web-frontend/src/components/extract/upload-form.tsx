"use client"

import { useState } from "react"
import { FileUp, CheckCircle, AlertTriangle, MailCheck, LineChart } from "lucide-react"

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
      const res = await fetch("http://localhost:8000/run-pipeline", {
        method: "POST",
        body: form,
      })

      if (!res.ok) throw new Error("Pipeline failed")
      const data = await res.json()
      setResult(data)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to process")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Upload Box */}
      <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted transition-colors">
        <label className="cursor-pointer flex flex-col items-center space-y-2">
          <FileUp className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm">Drag & drop or click to upload PDF</p>
          <input
            type="file"
            accept=".pdf"
            hidden
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>
      </div>

      {file && (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          📎 {file.name} ({Math.round(file.size / 1024)} KB)
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className={cn(
          "px-5 py-2 rounded font-medium transition-colors",
          loading
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-black text-white hover:bg-gray-800"
        )}
      >
        {loading ? "🔄 Running..." : "🚀 Run Pipeline"}
      </button>

      {error && (
        <div className="text-red-500 flex items-center gap-2 mt-2">
          <AlertTriangle className="h-5 w-5" />
          ❌ {error}
        </div>
      )}

      {result && (
        <div className="space-y-6 mt-8">
          {/* ✅ Extracted Equipment Table */}
          {result.extracted && (
            <div className="border rounded-lg p-4 bg-muted shadow-sm">
              <div className="flex items-center gap-2 text-green-600 mb-2 font-semibold">
                <CheckCircle className="h-5 w-5" />
                Extracted Equipment
              </div>
              <ExtractedTable data={result.extracted} />
            </div>
          )}

          {/* 🟠 Inventory Shortfall */}
          {result.shortfall && Object.keys(result.shortfall).length > 0 && (
            <div className="border rounded-lg p-4 bg-orange-50 dark:bg-orange-950">
              <div className="flex items-center gap-2 text-orange-500 mb-2 font-semibold">
                <AlertTriangle className="h-5 w-5" />
                Inventory Shortfall
              </div>
              <ShortfallTable data={result.shortfall} />
            </div>
          )}

          {/* 🔵 Forecast */}
          {result.forecast && (
            <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
              <div className="flex items-center gap-2 text-blue-500 mb-2 font-semibold">
                <LineChart className="h-5 w-5" />
                Forecasted Inventory
              </div>
              <JSONView data={result.forecast} />
            </div>
          )}

          {/* ✉ Email Status */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
            <MailCheck className="h-5 w-5 text-primary" />
            {result.shortfall && Object.keys(result.shortfall).length > 0
              ? "Procurement email has been sent ✅"
              : "No procurement email needed."}
          </div>
        </div>
      )}
    </div>
  )
}
