'use client'

import Link from "next/link"

export function Topbar() {
  return (
    <header className="sticky top-0 z-50 flex flex-col gap-2 border-b border-gray-200 bg-white dark:bg-gray-900 px-6 py-4 shadow-sm">
      <h1 className="text-2xl font-bold text-black dark:text-white">Solar Intelligence</h1>
      <nav className="flex flex-wrap gap-6 text-sm font-medium text-gray-700 dark:text-gray-200">
        <Link href="/" className="hover:text-black dark:hover:text-white">Dashboard</Link>
        <Link href="/extract" className="hover:text-black dark:hover:text-white">Equipment Extractor</Link>
        <Link href="/inventory" className="hover:text-black dark:hover:text-white">Inventory Checker</Link>
        <Link href="/procurement" className="hover:text-black dark:hover:text-white">Procurement</Link>
        <Link href="/forecast" className="hover:text-black dark:hover:text-white">Forecasting</Link>
      </nav>
    </header>
  )
}
