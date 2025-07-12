"use client"

import { AlertTriangle } from "lucide-react"

type ShortfallProps = {
  shortfall: {
    [key: string]: {
      model: string
      required: number
      available: number
    }
  }
}

export default function ShortfallView({ shortfall }: ShortfallProps) {
  const items = Object.entries(shortfall)

  if (!items.length) {
    return (
      <p className="text-sm text-muted-foreground">
        ✅ No shortfalls detected. You're good to go!
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {items.map(([key, item]) => {
        const missing = item.required - item.available
        return (
          <div
            key={key}
            className="border rounded-lg p-4 bg-white dark:bg-gray-950 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium capitalize">{key}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.model || "Unknown model"}
                </p>
              </div>
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm font-semibold">
                  Missing: {missing}
                </span>
              </div>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-gray-600 dark:text-gray-300">
                Required: {item.required}
              </span>{" "}
              |{" "}
              <span className="text-gray-600 dark:text-gray-300">
                Available: {item.available}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
