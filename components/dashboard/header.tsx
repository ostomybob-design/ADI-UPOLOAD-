"use client"

import { Button } from "@/components/ui/button"
import { Calendar, LayoutDashboard, LayoutGrid, Table as TableIcon, RefreshCw, Plus } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

interface DashboardHeaderProps {
  viewMode?: "card" | "table"
  onViewModeChange?: (mode: "card" | "table") => void
  onRefresh?: () => void
  onCreatePost?: () => void
  loading?: boolean
}

export function DashboardHeader({ 
  viewMode, 
  onViewModeChange, 
  onRefresh, 
  onCreatePost,
  loading 
}: DashboardHeaderProps = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const isDashboard = pathname === "/dashboard"

  return (
    <header className="border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-900/20 dark:to-purple-900/20 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-7xl">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Dashboard title (only on dashboard page) */}
          {isDashboard && (
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent whitespace-nowrap">
              <span className="hidden md:inline">Ostomy Social Content Dashboard</span>
              <span className="hidden sm:inline md:hidden">Ostomy Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </h1>
          )}

          {/* Center: Navigation */}
          <nav className="flex items-center gap-1">
            <Button
              variant={pathname === "/dashboard" ? "default" : "ghost"}
              size="sm"
              onClick={() => router.push("/dashboard")}
              className={pathname === "/dashboard" ? "bg-gradient-to-r from-blue-500 to-purple-600" : ""}
            >
              <LayoutDashboard className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            <Button
              variant={pathname === "/scheduling" ? "default" : "ghost"}
              size="sm"
              onClick={() => router.push("/scheduling")}
              className={pathname === "/scheduling" ? "bg-gradient-to-r from-blue-500 to-purple-600" : ""}
            >
              <Calendar className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Scheduling</span>
            </Button>
          </nav>

          {/* Right: Dashboard controls (only on dashboard page) */}
          {isDashboard && viewMode && onViewModeChange && onRefresh && onCreatePost && (
            <div className="flex gap-2 flex-wrap">
              <div className="flex gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1 shadow-sm">
                <Button
                  variant={viewMode === "card" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => onViewModeChange("card")}
                  className={`h-8 w-8 ${viewMode === "card" ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : ''}`}
                  title="Card view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => onViewModeChange("table")}
                  className={`h-8 w-8 ${viewMode === "table" ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : ''}`}
                  title="Table view"
                >
                  <TableIcon className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={onRefresh}
                disabled={loading}
                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 shadow-sm"
                title="Sync with Late.dev and refresh"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button 
                onClick={onCreatePost} 
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Create Post</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
