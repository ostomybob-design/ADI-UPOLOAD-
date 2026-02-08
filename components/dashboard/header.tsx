"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, LayoutDashboard, LayoutGrid, Table as TableIcon, RefreshCw, Plus, Plane, Bot } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { AwayModeModal } from "@/components/away-mode-modal"
import { BotSettingsModal } from "@/components/bot-settings-modal"

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
  const [awayModeOpen, setAwayModeOpen] = useState(false)
  const [botSettingsOpen, setBotSettingsOpen] = useState(false)
  const [awayDaysCount, setAwayDaysCount] = useState(0)
  const [insufficientPosts, setInsufficientPosts] = useState(false)

  // Fetch away mode status
  const fetchAwayModeStatus = async () => {
    try {
      const response = await fetch("/api/away-mode")
      if (response.ok) {
        const data = await response.json()
        setAwayDaysCount(data.awayDays.length)
        
        // Check if we have enough posts (simple check: 1 post per day minimum)
        const totalAvailable = data.stats.approvedPosts + data.stats.pendingPosts
        setInsufficientPosts(totalAvailable < data.awayDays.length)
      }
    } catch (error) {
      console.error("Failed to fetch away mode status:", error)
    }
  }

  useEffect(() => {
    fetchAwayModeStatus()
    // Refresh every minute
    const interval = setInterval(fetchAwayModeStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  const awayModeTooltip = awayDaysCount === 0 
    ? "Set days when you'll be away" 
    : insufficientPosts
    ? `${awayDaysCount} day(s) set - insufficient posts available!`
    : `${awayDaysCount} day(s) set to away mode`

  return (
    <header className="border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-900/20 dark:to-purple-900/20 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-7xl">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Dashboard title (only on dashboard page) */}
          {isDashboard && (
            <div className="flex items-center gap-2 sm:gap-3">
              <img 
                src="/bob.jpg" 
                alt="Ostomy Hub Logo" 
                className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full object-cover"
              />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent whitespace-nowrap">
                <span className="hidden md:inline">Ostomy Content Dashboard</span>
                <span className="hidden sm:inline md:hidden">Ostomy Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </h1>
            </div>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAwayModeOpen(true)}
              className={`relative ${awayDaysCount > 0 ? 'border-2 border-red-500' : ''}`}
              title={awayModeTooltip}
            >
              <Plane className={`h-4 w-4 sm:mr-2 ${insufficientPosts ? 'text-red-500' : awayDaysCount > 0 ? 'text-orange-500' : ''}`} />
              <span className="hidden sm:inline">Away Mode</span>
              {awayDaysCount > 0 && (
                <span className={`absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${insufficientPosts ? 'bg-red-500' : 'bg-orange-500'} text-white`}>
                  {awayDaysCount}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBotSettingsOpen(true)}
              className="border border-purple-500/50 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              title="Configure bot settings"
            >
              <Bot className="h-4 w-4 sm:mr-2 text-purple-500" />
              <span className="hidden sm:inline">Bot</span>
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

      {/* Away Mode Modal */}
      <AwayModeModal 
        open={awayModeOpen} 
        onOpenChange={setAwayModeOpen}
        onAwayDaysUpdated={fetchAwayModeStatus}
      />

      {/* Bot Settings Modal */}
      <BotSettingsModal
        open={botSettingsOpen}
        onOpenChange={setBotSettingsOpen}
      />
    </header>
  )
}
