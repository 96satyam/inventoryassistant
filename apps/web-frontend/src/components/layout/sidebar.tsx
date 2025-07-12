// src/components/layout/sidebar.tsx
'use client'

import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Search,
  Package,
  ShoppingCart,
  TrendingUp,
  Zap,
  Brain,
  Sun,
  ChevronRight,
  Sparkles,
  Activity,
  ChevronLeft,
  Menu,
  FileSpreadsheet
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isOpen: boolean
  onToggle: (open: boolean) => void
  isCollapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
}

export function Sidebar({ isOpen, onToggle, isCollapsed = false, onCollapse }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ width: isCollapsed ? 80 : 288 }}
        animate={{ width: isCollapsed ? 80 : 288 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="hidden lg:flex lg:flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 shadow-xl relative"
      >
        <SidebarContent isCollapsed={isCollapsed} />

        {/* Collapse Toggle Button - Enhanced Visibility */}
        {onCollapse && (
          <motion.button
            onClick={() => onCollapse(!isCollapsed)}
            className="absolute right-2 top-6 w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center shadow-xl hover:shadow-orange-500/25 transition-all duration-300 z-20 hover:from-orange-600 hover:to-orange-700 dark:hover:from-orange-700 dark:hover:to-orange-800 ring-1 ring-orange-200 dark:ring-orange-800"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-white font-extrabold drop-shadow-sm" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-white font-extrabold drop-shadow-sm" />
            )}
          </motion.button>
        )}
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 shadow-2xl z-50 lg:hidden"
          >
            <SidebarContent isCollapsed={false} />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}

function SidebarContent({ isCollapsed = false }: { isCollapsed?: boolean }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={cn(
          "border-b border-slate-200/50 dark:border-slate-700/50 transition-all duration-300",
          isCollapsed ? "p-3" : "p-6"
        )}
      >
        <div className={cn(
          "flex items-center transition-all duration-300",
          isCollapsed ? "justify-center" : "gap-3"
        )}>
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-xl shadow-lg flex items-center justify-center">
              <Sun className="h-6 w-6 text-white" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center"
            >
              <Sparkles className="h-2 w-2 text-white" />
            </motion.div>
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Solar Intelligence
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                AI-Powered Platform
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Navigation */}
      <div className={cn(
        "flex-1 transition-all duration-300",
        isCollapsed ? "p-2" : "p-4"
      )}>
        <NavLinks isCollapsed={isCollapsed} />
      </div>

      {/* Status Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="p-4 border-t border-slate-200/50 dark:border-slate-700/50"
      >
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-800/50">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-green-500 rounded-full"
            />
            <Activity className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-green-700 dark:text-green-300">
              System Active
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              All services online
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function NavLinks({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const pathname = usePathname()

  const links = [
    {
      label: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      color: "from-blue-500 to-blue-600",
      description: "Overview & Analytics"
    },
    {
      label: "Equipment Extractor",
      href: "/extract",
      icon: Search,
      color: "from-purple-500 to-purple-600",
      description: "AI Document Analysis"
    },
    {
      label: "Inventory Checker",
      href: "/inventory",
      icon: Package,
      color: "from-indigo-500 to-indigo-600",
      description: "Stock Management"
    },
    {
      label: "Procurement",
      href: "/procurement",
      icon: ShoppingCart,
      color: "from-emerald-500 to-emerald-600",
      description: "Automated Ordering"
    },
    {
      label: "Demand Forecasting",
      href: "/forecast",
      icon: TrendingUp,
      color: "from-orange-500 to-orange-600",
      description: "Predictive Analytics"
    },
    {
      label: "Google Sheets",
      href: "/sheets",
      icon: FileSpreadsheet,
      color: "from-green-500 to-green-600",
      description: "Real-time Data Sync"
    },
  ]

  return (
    <nav className="space-y-2">
      {!isCollapsed && (
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 mb-3">
            Navigation
          </h2>
        </div>
      )}
      {links.map(({ label, href, icon: Icon, color, description }, index) => {
        // Enhanced active state detection
        const isActive = href === "/"
          ? pathname === "/" || pathname === "/dashboard"
          : pathname === href || pathname.startsWith(href + "/")
        return (
          <motion.div
            key={href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link
              href={href}
              title={isCollapsed ? label : undefined}
              className={cn(
                "group flex items-center rounded-xl transition-all duration-200 relative overflow-hidden",
                isCollapsed ? "justify-center p-3 mx-1" : "gap-3 px-3 py-3",
                isActive
                  ? "bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 shadow-lg border border-slate-200 dark:border-slate-600"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:shadow-md"
              )}
            >
              {/* Active indicator */}
              {isActive && !isCollapsed && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-r-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              {/* Icon */}
              <div className={cn(
                "p-2 rounded-lg transition-all duration-200",
                isActive
                  ? `bg-gradient-to-r ${color} shadow-lg`
                  : "bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700",
                isCollapsed && isActive && "ring-2 ring-blue-500 ring-opacity-50"
              )}>
                <Icon className={cn(
                  "h-4 w-4 transition-colors duration-200",
                  isActive ? "text-white" : "text-slate-600 dark:text-slate-400"
                )} />
              </div>

              {/* Content - Hidden when collapsed */}
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0"
                >
                  <p className={cn(
                    "font-medium transition-colors duration-200 truncate",
                    isActive
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
                  )}>
                    {label}
                  </p>
                    <p className={cn(
                      "text-xs transition-colors duration-200 truncate",
                      isActive
                        ? "text-slate-600 dark:text-slate-400"
                        : "text-slate-500 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400"
                    )}>
                      {description}
                    </p>
                  </motion.div>
                )}

                {/* Arrow indicator - Only show when not collapsed */}
                {!isCollapsed && (
                  <ChevronRight className={cn(
                    "h-4 w-4 transition-all duration-200",
                    isActive
                      ? "text-slate-600 dark:text-slate-400 transform translate-x-1"
                      : "text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400 group-hover:translate-x-1"
                  )} />
                )}
              </Link>
          </motion.div>
        )
      })}
    </nav>
  )
}
