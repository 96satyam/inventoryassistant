// src/components/ui/json-view.tsx
import React from "react"

export default function JSONView({ data }: { data: any }) {
  return (
    <pre className="p-4 bg-gray-100 dark:bg-gray-800 text-sm overflow-auto rounded">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}
