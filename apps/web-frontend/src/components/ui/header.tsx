"use client"
import { motion } from "framer-motion"

export default function Header() {
  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
        🧠 Smart Inventory Assistant
      </h1>
      <p className="text-muted-foreground mt-1">
        Never run out of parts again – AI forecasts demand & drafts POs for you.
      </p>
    </motion.div>
  )
}
