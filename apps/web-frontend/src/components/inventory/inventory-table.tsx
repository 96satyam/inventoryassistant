"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { RefreshCw, AlertTriangle } from "lucide-react"

type ComponentItem = {
  name: string
  available: number
  required: number
}

export default function InventoryTable() {
  const [data, setData] = useState<ComponentItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch("http://localhost:8000/inventory")
      const json = await res.json()

      // Transform each row into individual component items
      const components: ComponentItem[] = []
      json.forEach((row: any) => {
        const availableRandom = () => Math.floor(Math.random() * 50) + 1 // temporary

        if (row.module_company) {
          components.push({
            name: row.module_company,
            available: availableRandom(),
            required: row["no._of_modules"] ?? 0,
          })
        }
        if (row.optimizers_company) {
          components.push({
            name: row.optimizers_company,
            available: availableRandom(),
            required: row["no._of_optimizers"] ?? 0,
          })
        }
        if (row.inverter_company) {
          components.push({
            name: row.inverter_company,
            available: availableRandom(),
            required: 1,
          })
        }
        if (row.battery_company) {
          components.push({
            name: row.battery_company,
            available: availableRandom(),
            required: 1,
          })
        }
        if (row.rails) {
          components.push({
            name: row.rails,
            available: availableRandom(),
            required: 1,
          })
        }
        if (row.clamps) {
          components.push({
            name: row.clamps,
            available: availableRandom(),
            required: 1,
          })
        }
        if (row.disconnects) {
          components.push({
            name: row.disconnects,
            available: availableRandom(),
            required: 1,
          })
        }
        if (row.conduits) {
          components.push({
            name: row.conduits,
            available: availableRandom(),
            required: 1,
          })
        }
      })

      setData(components)
    } catch (err) {
      console.error("❌ Failed to fetch inventory", err)
      setData([])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <RefreshCw className="h-4 w-4 animate-spin" />
        Auto-refresh every 10s
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell header>Item</TableCell>
            <TableCell header>Available</TableCell>
            <TableCell header>Required</TableCell>
            <TableCell header>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, idx) => {
            const shortage = item.available < item.required
            return (
              <TableRow key={idx}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.available}</TableCell>
                <TableCell>{item.required}</TableCell>
                <TableCell>
                  {shortage ? (
                    <div className="text-red-500 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      Low Stock
                    </div>
                  ) : (
                    <span className="text-green-600">✔️ Sufficient</span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
