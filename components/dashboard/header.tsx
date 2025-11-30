"use client"

import { Button } from "@/components/ui/button"
import { LogOut, Calendar, LayoutDashboard } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

export function DashboardHeader() {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    // Clear auth and redirect to login
    localStorage.removeItem("isAuthenticated")
    router.push("/login")
  }

  return (
    <header className="border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-900/20 dark:to-purple-900/20 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-base sm:text-lg">O</span>
              </div>
              <div>
                <h2 className="font-bold text-sm sm:text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  <span className="hidden sm:inline">Ostomy Awareness</span>
                  <span className="sm:hidden">Ostomy</span>
                </h2>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden xs:block">Content Management</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1 ml-4">
              <Button
                variant={pathname === "/dashboard" ? "default" : "ghost"}
                size="sm"
                onClick={() => router.push("/dashboard")}
                className={pathname === "/dashboard" ? "bg-gradient-to-r from-blue-500 to-purple-600" : ""}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant={pathname === "/scheduling" ? "default" : "ghost"}
                size="sm"
                onClick={() => router.push("/scheduling")}
                className={pathname === "/scheduling" ? "bg-gradient-to-r from-blue-500 to-purple-600" : ""}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Scheduling
              </Button>
            </nav>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-gradient-to-br hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/20 dark:hover:to-red-800/20">
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
