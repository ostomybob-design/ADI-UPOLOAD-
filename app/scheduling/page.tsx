"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { QueueConfigModal } from "@/components/queue-config-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Settings, RefreshCw, Instagram, Facebook, Twitter, Linkedin, ExternalLink, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface LatePost {
  _id: string
  content: string
  scheduledFor: string
  status: string
  platforms: Array<{
    platform: string
    accountId: string
  }>
  queuedFromProfile?: string
  createdAt: string
}

interface QueueSlot {
  dayOfWeek: number
  time: string
}

interface QueueInfo {
  exists: boolean
  schedule?: {
    profileId: string
    timezone: string
    slots: QueueSlot[]
    active: boolean
    createdAt: string
    updatedAt: string
  }
  nextSlots?: string[]
}

export default function SchedulingPage() {
  const [latePosts, setLatePosts] = useState<LatePost[]>([])
  const [loadingLatePosts, setLoadingLatePosts] = useState(false)
  const [showQueueConfig, setShowQueueConfig] = useState(false)
  const [queueInfo, setQueueInfo] = useState<QueueInfo | null>(null)
  const [profileId, setProfileId] = useState<string>("")
  const [accounts, setAccounts] = useState<any[]>([])

  const fetchLatePosts = async (syncFirst: boolean = false) => {
    try {
      setLoadingLatePosts(true)

      // Sync with Late.dev first if requested
      if (syncFirst) {
        console.log("🔄 Syncing with Late.dev...")
        try {
          // Add timeout to prevent hanging
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

          const syncResponse = await fetch("/api/late/sync", {
            method: "POST",
            signal: controller.signal
          })
          clearTimeout(timeoutId)

          if (syncResponse.ok) {
            const syncData = await syncResponse.json()
            console.log("✅ Sync complete:", syncData.message)
          }
        } catch (syncError: any) {
          if (syncError.name === 'AbortError') {
            console.warn("⚠️ Sync timeout (30s), continuing with local data")
          } else {
            console.warn("⚠️ Sync error:", syncError)
          }
        }
      }

      const response = await fetch("/api/late/posts?status=scheduled&limit=100")
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          // Sort by scheduled time
          const sorted = data.sort((a, b) =>
            new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
          )
          setLatePosts(sorted)
        } else {
          setLatePosts([])
        }
      }
    } catch (error) {
      console.error("Failed to fetch Late.dev posts:", error)
      setLatePosts([])
    } finally {
      setLoadingLatePosts(false)
    }
  }

  const fetchQueueInfo = async () => {
    try {
      const accountsResponse = await fetch("/api/late/accounts")
      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json()
        setAccounts(accountsData)

        if (accountsData.length > 0 && accountsData[0].profileId) {
          const pid = typeof accountsData[0].profileId === 'string'
            ? accountsData[0].profileId
            : accountsData[0].profileId._id || accountsData[0].profileId.id

          setProfileId(pid)

          const queueResponse = await fetch(`/api/late/queue/slots?profileId=${pid}`)

          if (queueResponse.ok) {
            const data = await queueResponse.json()

            // Fetch preview of next slots (more than the default 3)
            try {
              const previewResponse = await fetch(`/api/late/queue/preview?profileId=${pid}&count=10`)
              if (previewResponse.ok) {
                const previewData = await previewResponse.json()
                // Merge preview data with queue info
                data.nextSlots = previewData.slots || previewData.nextSlots || data.nextSlots
              }
            } catch (previewError) {
              console.warn("Could not fetch queue preview:", previewError)
            }

            setQueueInfo(data)
          } else {
            setQueueInfo({ exists: false })
          }
        } else {
          setQueueInfo({ exists: false })
        }
      } else {
        setQueueInfo({ exists: false })
      }
    } catch (error) {
      console.error("Failed to fetch queue info:", error)
      setQueueInfo({ exists: false })
    }
  }

  useEffect(() => {
    // Load posts without syncing on initial load (use refresh button to sync)
    fetchLatePosts(false)
    fetchQueueInfo()
  }, [])

  const handleRefresh = () => {
    fetchLatePosts(true)
    fetchQueueInfo()
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <Instagram className="h-3 w-3" />
      case "facebook":
        return <Facebook className="h-3 w-3" />
      case "twitter":
        return <Twitter className="h-3 w-3" />
      case "linkedin":
        return <Linkedin className="h-3 w-3" />
      default:
        return null
    }
  }

  const getDayName = (dayOfWeek: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return days[dayOfWeek]
  }

  const groupedPosts = latePosts.reduce((acc: any, post) => {
    const dateObj = new Date(post.scheduledFor)
    const dateKey = dateObj.toISOString().split('T')[0]
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(post)
    return acc
  }, {})

  const sortedDates = Object.keys(groupedPosts).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  )

  const thisWeekCount = latePosts.filter(p => {
    const postDate = new Date(p.scheduledFor)
    const weekFromNow = new Date()
    weekFromNow.setDate(weekFromNow.getDate() + 7)
    return postDate <= weekFromNow
  }).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
      <DashboardHeader />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Scheduled Posts
              </h1>
              <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-lg font-medium">
                Manage your posting schedule via Late.dev
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={loadingLatePosts}
                className="gap-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 shadow-sm"
              >
                <RefreshCw className={`h-4 w-4 ${loadingLatePosts ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button
                onClick={() => setShowQueueConfig(true)}
                className="gap-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Configure Queue</span>
                <span className="sm:hidden">Config</span>
              </Button>
            </div>
          </div>

          {/* Connected Accounts Info */}
          {accounts.length > 0 && (
            <Card className="mb-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <ExternalLink className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Connected Accounts
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {accounts.map((account, i) => (
                        <Badge key={i} variant="secondary" className="capitalize gap-1">
                          {getPlatformIcon(account.platform)}
                          {account.platform} - {account.username || account.displayName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://getlate.dev/accounts', '_blank')}
                  >
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Queue Status */}
          {queueInfo && queueInfo.exists && queueInfo.schedule?.active ? (
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Queue Active
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {queueInfo.schedule?.slots?.length || 0} time slots per week • {queueInfo.schedule?.timezone}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mt-3 max-w-4xl">
                        {queueInfo.schedule?.slots?.slice(0, 20).map((slot, i) => (
                          <Badge key={i} variant="outline" className="text-xs justify-center py-1">
                            {getDayName(slot.dayOfWeek).slice(0, 3)} {slot.time}
                          </Badge>
                        ))}
                        {(queueInfo.schedule?.slots?.length || 0) > 20 && (
                          <Badge variant="secondary" className="text-xs justify-center py-1">
                            +{(queueInfo.schedule?.slots?.length || 0) - 20} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Next slots:</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {queueInfo.nextSlots?.slice(0, 10).map((slot: string, i: number) => (
                        <p key={i} className="text-xs font-medium text-green-600 dark:text-green-400">
                          {new Date(slot).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      ))}
                      {(queueInfo.nextSlots?.length || 0) > 10 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                          +{(queueInfo.nextSlots?.length || 0) - 10} more
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800 shadow-lg">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Queue Not Configured</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>Set up your posting schedule to automatically schedule approved posts</span>
                <Button onClick={() => setShowQueueConfig(true)} size="sm" className="ml-4">
                  Configure Now
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Scheduled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {latePosts.length}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                posts in queue
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Next Post
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latePosts.length > 0 ? (
                <>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {new Date(latePosts[0].scheduledFor).toLocaleDateString()}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {new Date(latePosts[0].scheduledFor).toLocaleTimeString()}
                  </p>
                </>
              ) : (
                <div className="text-lg font-medium text-gray-400">
                  No posts scheduled
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {thisWeekCount}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                posts scheduled
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Scheduled Posts Timeline */}
        <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-gray-200 dark:border-gray-700 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Scheduled Posts
            </CardTitle>
            <CardDescription>
              All posts scheduled via Late.dev
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingLatePosts ? (
              <div className="text-center py-12">
                <div className="relative mx-auto mb-4 w-16 h-16">
                  <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-t-blue-500 border-r-purple-500 border-b-pink-500 border-l-transparent animate-spin"></div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Loading scheduled posts...
                </p>
              </div>
            ) : latePosts.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No posts scheduled
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Approve posts from the dashboard to schedule them automatically
                </p>
                <Button
                  onClick={() => window.location.href = "/dashboard"}
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white"
                >
                  Go to Dashboard
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedDates.map((dateKey) => (
                  <div key={dateKey}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {new Date(dateKey + 'T00:00:00').toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h3>
                      <Badge variant="secondary" className="ml-auto">
                        {groupedPosts[dateKey].length} posts
                      </Badge>
                    </div>
                    <div className="space-y-2 ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                      {groupedPosts[dateKey]
                        .sort((a: any, b: any) =>
                          new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
                        )
                        .map((post: LatePost) => (
                          <div
                            key={post._id}
                            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors shadow-sm hover:shadow-md"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {new Date(post.scheduledFor).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                  {post.queuedFromProfile && (
                                    <Badge variant="outline" className="text-xs">
                                      Queued
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">
                                  {post.content}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {post.platforms?.map((p: any, i: number) => (
                                    <Badge
                                      key={i}
                                      variant="secondary"
                                      className="text-xs capitalize gap-1"
                                    >
                                      {getPlatformIcon(p.platform)}
                                      {p.platform}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                                >
                                  {post.status}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(`https://getlate.dev/posts/${post._id}`, '_blank')}
                                  className="h-7 px-2"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Queue Config Modal */}
      <QueueConfigModal
        open={showQueueConfig}
        onOpenChange={setShowQueueConfig}
        profileId={profileId}
        onConfigured={handleRefresh}
      />
    </div>
  )
}
