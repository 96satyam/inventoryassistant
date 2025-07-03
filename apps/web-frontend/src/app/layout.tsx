/* -----------------------------------------------------------------------
   Global Layout – Smart Inventory Assistant
   -------------------------------------------------------------------- */
import "./globals.css"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { Toaster } from "react-hot-toast"

/*  ─────  Next.js App‑Router metadata  ─────  */
export const metadata = {
  title: "🧠 Smart Inventory Assistant",
  description:
    "Never run out of parts again – AI forecasts demand & drafts purchase orders for solar installers.",
  icons: {
    icon: "/smart-assistant.svg", // <public/smart-assistant.svg>
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* extra safety for older crawlers */}
        <link rel="icon" href="/smart-assistant.svg" />
      </head>

      <body className="min-h-screen bg-white text-black antialiased dark:bg-gray-950 dark:text-white">
        {/* Toast notifications */}
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

        {/* Global topbar */}
        <Topbar />

        {/* Sidebar + main content */}
        <div className="flex min-h-[calc(100vh-64px)]">
          <Sidebar />

          <main className="flex-1 overflow-auto px-6 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
