"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ExternalLink, Instagram, Facebook, Calendar, Copy, Check, Edit2, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface PostDetailModalProps {
  post: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (post: any) => void
  onApprovalChange?: () => void
}

export function PostDetailModal({ post, open, onOpenChange, onEdit, onApprovalChange }: PostDetailModalProps) {
  const { toast } = useToast()
  const [copiedCaption, setCopiedCaption] = useState(false)
  const [copiedHashtags, setCopiedHashtags] = useState(false)
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)

  if (!post) return null

  const handleApprove = async () => {
    try {
      setApproving(true)
      const response = await fetch("/api/posts/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postIds: [post.id],
          approvedBy: "admin"
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Post approved and added to buffer"
        })
        onApprovalChange?.()
        onOpenChange(false)
      } else {
        throw new Error("Failed to approve")
      }
    } catch (error) {
      console.error("Approval error:", error)
      toast({
        title: "Error",
        description: "Failed to approve post",
        variant: "destructive"
      })
    } finally {
      setApproving(false)
    }
  }

  const handleReject = async () => {
    if (!confirm("Are you sure you want to reject this post?")) return

    try {
      setRejecting(true)
      const response = await fetch("/api/posts/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.id,
          reason: "Rejected by user"
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Post rejected"
        })
        onApprovalChange?.()
        onOpenChange(false)
      } else {
        throw new Error("Failed to reject")
      }
    } catch (error) {
      console.error("Rejection error:", error)
      toast({
        title: "Error",
        description: "Failed to reject post",
        variant: "destructive"
      })
    } finally {
      setRejecting(false)
    }
  }

  const copyToClipboard = async (text: string, type: 'caption' | 'hashtags') => {
    await navigator.clipboard.writeText(text)
    if (type === 'caption') {
      setCopiedCaption(true)
      setTimeout(() => setCopiedCaption(false), 2000)
    } else {
      setCopiedHashtags(true)
      setTimeout(() => setCopiedHashtags(false), 2000)
    }
  }

  const hashtagsText = (() => {
    if (!post.ai_hashtags) return ''
    if (Array.isArray(post.ai_hashtags)) {
      return post.ai_hashtags.map((tag: string) => tag.startsWith('#') ? tag : `#${tag}`).join(' ')
    }
    if (typeof post.ai_hashtags === 'string') {
      return post.ai_hashtags.split(',').map((tag: string) => {
        const trimmed = tag.trim()
        return trimmed.startsWith('#') ? trimmed : `#${trimmed}`
      }).join(' ')
    }
    return ''
  })()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <div className="flex items-start justify-between gap-2 sm:gap-4">
            <div className="flex-1">
              <DialogTitle className="text-base sm:text-xl mb-2 pr-2">{post.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span className="hidden sm:inline">{format(new Date(post.created_at), "MMMM d, yyyy 'at' h:mm a")}</span>
                  <span className="sm:hidden">{format(new Date(post.created_at), "MMM d, yyyy")}</span>
                </span>
                {post.posted_on_instagram && (
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Instagram className="h-3 w-3" />
                    <span className="hidden sm:inline">Instagram</span>
                    <span className="sm:hidden">IG</span>
                  </Badge>
                )}
                {post.posted_on_facebook && (
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Facebook className="h-3 w-3" />
                    <span className="hidden sm:inline">Facebook</span>
                    <span className="sm:hidden">FB</span>
                  </Badge>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 mt-4">
          {post.main_image_url && (
            <div className="relative h-48 sm:h-64 w-full rounded-lg overflow-hidden bg-muted">
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

          {post.ai_summary && (
            <div>
              <h3 className="font-semibold mb-2 text-sm text-muted-foreground">AI Summary</h3>
              <p className="text-sm leading-relaxed">{post.ai_summary}</p>
            </div>
          )}

          <Separator />

          {post.ai_caption && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-xs sm:text-sm text-muted-foreground">Social Media Caption</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(post.ai_caption, 'caption')}
                  className="h-8 w-8 p-0"
                >
                  {copiedCaption ? (
                    <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </Button>
              </div>
              <div className="bg-muted p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm whitespace-pre-wrap">{post.ai_caption}</p>
              </div>
            </div>
          )}

          {post.ai_hashtags && ((() => {
            const tags = Array.isArray(post.ai_hashtags)
              ? post.ai_hashtags
              : typeof post.ai_hashtags === 'string'
                ? post.ai_hashtags.split(',').map((t: string) => t.trim()).filter((t: string) => t)
                : []
            return tags.length > 0
          })()) && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-xs sm:text-sm text-muted-foreground">Hashtags</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(hashtagsText, 'hashtags')}
                    className="h-8 w-8 p-0"
                  >
                    {copiedHashtags ? (
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {(() => {
                    const tags = Array.isArray(post.ai_hashtags)
                      ? post.ai_hashtags
                      : typeof post.ai_hashtags === 'string'
                        ? post.ai_hashtags.split(',').map((t: string) => t.trim()).filter((t: string) => t)
                        : []

                    return tags.map((tag: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        #{tag.replace(/^#/, '')}
                      </Badge>
                    ))
                  })()}
                </div>
              </div>
            )}

          <Separator />

          <div className="flex flex-col gap-2">
            {/* Approval Actions */}
            {post.approval_status === "pending" && post.ai_caption && (
              <div className="flex gap-2">
                <Button
                  onClick={handleApprove}
                  disabled={approving || rejecting}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
                >
                  {approving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  {approving ? "Approving..." : "Approve"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReject}
                  disabled={approving || rejecting}
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {rejecting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  {rejecting ? "Rejecting..." : "Reject"}
                </Button>
              </div>
            )}

            {/* Edit Button */}
            {onEdit && (
              <Button
                variant="outline"
                onClick={() => {
                  onEdit(post)
                  onOpenChange(false)
                }}
                className="w-full"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Post
              </Button>
            )}

            {/* View Original */}
            <Button
              variant="outline"
              className="w-full text-xs sm:text-sm"
              onClick={() => window.open(post.url, '_blank')}
            >
              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              <span className="hidden sm:inline">View Original Article</span>
              <span className="sm:hidden">View Article</span>
            </Button>

            {/* Status Badge */}
            {post.approval_status && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Badge
                  variant={
                    post.approval_status === "approved"
                      ? "default"
                      : post.approval_status === "rejected"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  Status: {post.approval_status}
                </Badge>
                {post.is_in_buffer && (
                  <Badge variant="outline">In Buffer</Badge>
                )}
                {post.is_edited && (
                  <Badge variant="outline">Edited</Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
