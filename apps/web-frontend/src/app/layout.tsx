/* -----------------------------------------------------------------------
   Global Layout – Smart Inventory Assistant
   -------------------------------------------------------------------- */
import "./globals.css"
import AuthLayout from "@/components/layout/auth-layout"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Toaster } from "react-hot-toast"
import { Toaster as SonnerToaster } from "sonner"

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

      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--background)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              }
            }}
          />

          {/* Sonner Toast notifications for enhanced PO functionality */}
          <SonnerToaster
            position="top-right"
            richColors
            closeButton
            expand={true}
            visibleToasts={5}
            toastOptions={{
              style: {
                background: 'var(--background)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              }
            }}
          />

          {/* Authentication-aware Layout */}
          <AuthLayout>
            {children}
          </AuthLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}
