"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle2, XCircle, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface Post {
  id: number
  title: string
  ai_caption: string | null
  ai_summary: string | null
  approval_status?: string
  created_at: string
}

interface BulkApprovalProps {
  posts: Post[]
  onApprovalComplete: () => void
}

export function BulkApproval({ posts, onApprovalComplete }: BulkApprovalProps) {
  const { toast } = useToast()
  const [selectedPosts, setSelectedPosts] = useState<Set<number>>(new Set())
  const [approving, setApproving] = useState(false)
  const [schedule, setSchedule] = useState({ posts_per_day: 3, buffer_size: 7 })

  const pendingPosts = posts.filter(p =>
    p.approval_status === "pending" &&
    p.ai_caption &&
    p.ai_summary
  )

  const weekWorthOfPosts = schedule.posts_per_day * schedule.buffer_size

  useEffect(() => {
    fetchSchedule()
  }, [])

  const fetchSchedule = async () => {
    try {
      const response = await fetch("/api/schedule")
      if (response.ok) {
        const data = await response.json()
        setSchedule({
          posts_per_day: data.posts_per_day || 3,
          buffer_size: data.buffer_size || 7
        })
      }
    } catch (error) {
      console.error("Failed to fetch schedule:", error)
    }
  }

  const togglePost = (postId: number) => {
    const newSelected = new Set(selectedPosts)
    if (newSelected.has(postId)) {
      newSelected.delete(postId)
    } else {
      newSelected.add(postId)
    }
    setSelectedPosts(newSelected)
  }

  const selectAll = () => {
    if (selectedPosts.size === pendingPosts.length) {
      setSelectedPosts(new Set())
    } else {
      setSelectedPosts(new Set(pendingPosts.map(p => p.id)))
    }
  }

  const selectWeekWorth = () => {
    const postsToSelect = pendingPosts.slice(0, weekWorthOfPosts)
    setSelectedPosts(new Set(postsToSelect.map(p => p.id)))
  }

  const handleBulkApprove = async () => {
    if (selectedPosts.size === 0) {
      toast({
        title: "No posts selected",
        description: "Please select at least one post to approve",
        variant: "destructive"
      })
      return
    }

    try {
      setApproving(true)
      const response = await fetch("/api/posts/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postIds: Array.from(selectedPosts),
          approvedBy: "admin"
        })
      })

      if (response.ok) {
        const data = await response.json()

        let description = data.message || `${selectedPosts.size} posts approved and added to buffer`;

        // Show scheduling details if available
        if (data.scheduledPosts && data.scheduledPosts.length > 0) {
          const firstScheduled = new Date(data.scheduledPosts[0].scheduledFor).toLocaleString();
          description += `\n\nFirst post scheduled for: ${firstScheduled}`;
        }

        toast({
          title: "✅ Success",
          description,
          duration: 5000,
        })
        setSelectedPosts(new Set())
        onApprovalComplete()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to approve posts")
      }
    } catch (error) {
      console.error("Bulk approval error:", error)
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to approve posts",
        variant: "destructive"
      })
    } finally {
      setApproving(false)
    }
  }

  if (pendingPosts.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Bulk Approval</CardTitle>
          <CardDescription>No pending posts available for approval</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Bulk Approval</CardTitle>
            <CardDescription>
              Select posts to approve and add to buffer ({selectedPosts.size} selected)
            </CardDescription>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {weekWorthOfPosts} posts = {schedule.buffer_size} days
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {schedule.posts_per_day} posts/day
              </Badge>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectWeekWorth}
                disabled={pendingPosts.length === 0}
              >
                Select {Math.min(weekWorthOfPosts, pendingPosts.length)} Posts
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
              >
                {selectedPosts.size === pendingPosts.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
            <Button
              onClick={handleBulkApprove}
              disabled={approving || selectedPosts.size === 0}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {approving ? "Approving..." : `Approve ${selectedPosts.size} Posts`}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {pendingPosts.map((post) => (
            <div
              key={post.id}
              className={`flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer ${selectedPosts.has(post.id)
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              onClick={() => togglePost(post.id)}
            >
              <Checkbox
                checked={selectedPosts.has(post.id)}
                onCheckedChange={() => togglePost(post.id)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-1 line-clamp-2">{post.title}</h4>
                {post.ai_summary && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {post.ai_summary}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {new Date(post.created_at).toLocaleDateString()}
                  </Badge>
                  {post.ai_caption && (
                    <Badge variant="secondary" className="text-xs">
                      Caption Ready
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
