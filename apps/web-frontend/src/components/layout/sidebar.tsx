// src/components/layout/sidebar.tsx
'use client'

import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { VisuallyHidden } from "@/components/ui/visually-hidden"

export function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile sidebar button */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="lg:hidden p-4">
          <Menu className="h-6 w-6" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-4 space-y-4">
          <SheetHeader>
            <VisuallyHidden>
              <SheetTitle>Navigation Menu</SheetTitle>
            </VisuallyHidden>
          </SheetHeader>
          <NavLinks />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 p-6 border-r bg-gray-50 dark:bg-gray-900 space-y-4">
        <h2 className="text-lg font-bold">Navigation</h2>
        <NavLinks />
      </aside>
    </>
  )
}

function NavLinks() {
  const pathname = usePathname()

  const links = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Equipment Extractor", href: "/extract" },
    { label: "Inventory Checker", href: "/inventory" },
    { label: "Procurement", href: "/procurement" },
    { label: "Forecasting", href: "/forecast" },
  ]

  return (
    <nav className="space-y-2">
      {links.map(({ label, href }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "block px-3 py-2 rounded hover:bg-muted transition-colors",
            pathname === href ? "bg-muted font-semibold" : "text-muted-foreground"
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}
