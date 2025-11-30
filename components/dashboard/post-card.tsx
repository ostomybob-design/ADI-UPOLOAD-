"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Instagram, Facebook, Calendar, Eye, Trash2, CheckCircle2, XCircle } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"

interface PostCardProps {
  post: {
    id: number
    title: string
    url: string
    ai_summary?: string | null
    ai_caption?: string | null
    ai_hashtags?: string | string[] | null
    main_image_url?: string | null
    posted_on_instagram?: boolean
    posted_on_facebook?: boolean
    instagram_posted_at?: Date | string | null
    facebook_posted_at?: Date | string | null
    created_at: Date | string
    content_processed?: boolean | null
    approval_status?: string | null
    late_post_id?: string | null
    late_scheduled_for?: string | null
    late_published_at?: string | null
  }
  onView: (post: any) => void
  onDelete: (id: number) => void
  onSchedule?: (id: number) => void
  onRefresh?: () => void
}

export function PostCard({ post, onView, onDelete, onSchedule, onRefresh }: PostCardProps) {
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [isSendingToPending, setIsSendingToPending] = useState(false)
  const [isUnscheduling, setIsUnscheduling] = useState(false)

  const isPublished = post.posted_on_instagram || post.posted_on_facebook || post.late_published_at
  const isReady = post.content_processed && post.ai_caption

  const getStatusBadge = () => {
    if (isPublished) {
      return <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">Published</Badge>
    }
    if (isReady) {
      return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">Ready</Badge>
    }
    return <Badge className="bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0">Processing</Badge>
  }

  const handleApprove = async () => {
    setIsApproving(true)
    try {
      const response = await fetch("/api/posts/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postIds: [post.id],
          approvedBy: "admin",
          autoSchedule: true
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.scheduledPosts && data.scheduledPosts.length > 0) {
          const scheduledTime = new Date(data.scheduledPosts[0].scheduledFor).toLocaleString()
          alert(`✅ Post approved and scheduled for ${scheduledTime}`)
        } else if (data.schedulingErrors && data.schedulingErrors.length > 0) {
          const errorMsg = data.schedulingErrors.join("\n")
          alert(`⚠️ Post approved but scheduling failed:\n\n${errorMsg}`)
        } else {
          alert("✅ Post approved successfully")
        }
        onRefresh?.()
      }
    } catch (error) {
      console.error("Approval error:", error)
      alert("Failed to approve post. Please try again.")
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    const reason = prompt("Rejection reason (optional):")
    if (reason === null) return

    setIsRejecting(true)
    try {
      const response = await fetch("/api/posts/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.id,
          reason: reason || "Rejected from dashboard"
        })
      })

      if (response.ok) {
        onRefresh?.()
      }
    } catch (error) {
      console.error("Rejection error:", error)
    } finally {
      setIsRejecting(false)
    }
  }

  const handleSendToPending = async () => {
    if (!confirm("Send this post back to pending?")) return

    setIsSendingToPending(true)
    try {
      const response = await fetch("/api/posts/send-to-pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id })
      })

      if (response.ok) {
        alert("✅ Post sent back to pending")
        onRefresh?.()
      }
    } catch (error) {
      console.error("Send to pending error:", error)
      alert("Failed to send post to pending. Please try again.")
    } finally {
      setIsSendingToPending(false)
    }
  }

  const handleUnschedule = async () => {
    if (!confirm("Unschedule this post? It will be deleted from Late.dev and moved back to pending.")) return

    setIsUnscheduling(true)
    try {
      const response = await fetch("/api/posts/unschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id })
      })

      if (response.ok) {
        alert("✅ Post unscheduled and moved back to pending")
        onRefresh?.()
      } else {
        const data = await response.json()
        alert(`❌ Failed to unschedule: ${data.error}`)
      }
    } catch (error) {
      console.error("Unschedule error:", error)
      alert("Failed to unschedule post. Please try again.")
    } finally {
      setIsUnscheduling(false)
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-gray-200 dark:border-gray-700">
      {post.main_image_url && (
        <div className="relative h-48 w-full bg-muted overflow-hidden">
          <img
            src={post.main_image_url}
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      )}

      <CardHeader className="space-y-2 pb-3 bg-gradient-to-br from-white/50 to-transparent dark:from-gray-800/50">
        <div className="flex items-start justify-between gap-2">
          {getStatusBadge()}
          <div className="flex gap-1">
            {post.posted_on_instagram && (
              <div className="p-1.5 rounded-full bg-gradient-to-br from-pink-500 to-purple-600">
                <Instagram className="h-3 w-3 text-white" />
              </div>
            )}
            {post.posted_on_facebook && (
              <div className="p-1.5 rounded-full bg-gradient-to-br from-blue-500 to-blue-700">
                <Facebook className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
        </div>
        <h3 className="font-bold text-lg line-clamp-2 leading-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          {post.title}
        </h3>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 pb-3">
        {post.ai_summary && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {post.ai_summary}
          </p>
        )}

        {post.ai_hashtags && (
          <div className="flex flex-wrap gap-1">
            {(() => {
              const tags = Array.isArray(post.ai_hashtags)
                ? post.ai_hashtags
                : typeof post.ai_hashtags === 'string'
                  ? post.ai_hashtags.split(',').map(t => t.trim()).filter(t => t)
                  : []

              return (
                <>
                  {tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="text-xs font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-1 rounded-full shadow-sm">
                      #{tag.replace(/^#/, '')}
                    </span>
                  ))}
                  {tags.length > 3 && (
                    <span className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                      +{tags.length - 3} more
                    </span>
                  )}
                </>
              )
            })()}
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
          <Calendar className="h-3 w-3" />
          <span>{format(new Date(post.created_at), "MMM d, yyyy")}</span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 pt-3 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50/50 to-transparent dark:from-gray-800/50">
        {/* Action buttons based on status */}
        {post.approval_status === "pending" && post.ai_caption && (
          <div className="flex gap-2 w-full">
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 hover:from-green-600 hover:to-emerald-600"
              onClick={handleApprove}
              disabled={isApproving || isRejecting}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white border-0 hover:from-red-600 hover:to-red-700"
              onClick={handleReject}
              disabled={isApproving || isRejecting}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        )}

        {post.approval_status === "approved" && !post.late_post_id && (
          <div className="flex gap-2 w-full">
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 hover:from-blue-600 hover:to-cyan-600"
              onClick={handleSendToPending}
              disabled={isSendingToPending || isRejecting}
            >
              <Calendar className="h-4 w-4 mr-1" />
              To Pending
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white border-0 hover:from-red-600 hover:to-red-700"
              onClick={handleReject}
              disabled={isSendingToPending || isRejecting}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        )}

        {post.late_post_id && post.late_scheduled_for && !post.late_published_at && (
          <div className="flex gap-2 w-full">
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 hover:from-orange-600 hover:to-orange-700"
              onClick={handleUnschedule}
              disabled={isUnscheduling}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Unschedule
            </Button>
          </div>
        )}

        {/* Standard buttons */}
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700 hover:shadow-lg transition-all"
            onClick={() => onView(post)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(post.url, '_blank')}
            className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 border-0 hover:shadow-lg transition-all"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(post.id)}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 hover:from-red-600 hover:to-red-700 hover:shadow-lg transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
