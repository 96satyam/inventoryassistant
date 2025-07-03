// src/components/extract/extracted-table.tsx
"use client"

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table"

type EquipBlock = { model?: string; quantity?: number }
type Extracted = {
  modules?: EquipBlock
  battery?: EquipBlock
  inverter?: EquipBlock
  optimizer?: EquipBlock
  [key: string]: EquipBlock | undefined
}

export default function ExtractedTable({ data }: { data: Extracted }) {
  if (!data) return null

  /** Display order – feel free to tweak */
  const keys = ["modules", "battery", "inverter", "optimizer"]

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell header>Component</TableCell>
          <TableCell header>Model</TableCell>
          <TableCell header className="text-right">
            Quantity
          </TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {keys.map((key) => {
          const block = data[key]
          if (!block) return null
          return (
            <TableRow key={key}>
              <TableCell className="capitalize">{key}</TableCell>
              <TableCell>{block.model ?? "—"}</TableCell>
              <TableCell className="text-right">
                {block.quantity ?? 0}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
