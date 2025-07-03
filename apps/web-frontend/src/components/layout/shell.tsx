// components/layout/shell.tsx
import { Topbar } from "./topbar"

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Topbar />
      <main className="flex-1 p-6 bg-gray-100 dark:bg-gray-900">{children}</main>
    </div>
  )
}
