"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SchedulePostModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  postId: number
  postTitle: string
  onScheduled?: () => void
}

interface QueueSlot {
  time: string
  available: boolean
  existingPost?: {
    id: string
    title: string
  }
}

export function SchedulePostModal({
  open,
  onOpenChange,
  postId,
  postTitle,
  onScheduled
}: SchedulePostModalProps) {
  const [loading, setLoading] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [slots, setSlots] = useState<QueueSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [profileId, setProfileId] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchSlots()
    } else {
      // Reset state when modal closes
      setSlots([])
      setSelectedSlot(null)
      setError(null)
    }
  }, [open])

  const fetchSlots = async () => {
    setLoading(true)
    setError(null)

    try {
      // First, get the profile ID from environment or config
      const configResponse = await fetch("/api/late/config")
      if (!configResponse.ok) {
        throw new Error("Failed to fetch Late.dev configuration")
      }
      const config = await configResponse.json()
      const profileIdFromConfig = config.profileId

      if (!profileIdFromConfig) {
        throw new Error("No profile ID configured. Please set up your Late.dev profile.")
      }

      setProfileId(profileIdFromConfig)

      // Fetch queue slots
      const slotsResponse = await fetch(`/api/late/queue/slots?profileId=${profileIdFromConfig}`)
      if (!slotsResponse.ok) {
        if (slotsResponse.status === 404) {
          throw new Error("Queue not configured. Please set up your posting schedule first.")
        }
        throw new Error("Failed to fetch queue slots")
      }

      const slotsData = await slotsResponse.json()

      if (!slotsData.exists || !slotsData.schedule?.active) {
        throw new Error("Queue is not active. Please configure your posting schedule.")
      }

      // Fetch scheduled posts to check which slots are occupied
      const postsResponse = await fetch("/api/late/posts?status=scheduled&limit=100")
      const scheduledPosts = postsResponse.ok ? await postsResponse.json() : []

      // Get next available slots
      const previewResponse = await fetch(`/api/late/queue/preview?profileId=${profileIdFromConfig}&count=20`)
      if (!previewResponse.ok) {
        throw new Error("Failed to fetch available slots")
      }

      const previewData = await previewResponse.json()
      const upcomingSlots = previewData.slots || []

      // Map slots with availability
      const mappedSlots: QueueSlot[] = upcomingSlots.map((slotTime: string) => {
        const existingPost = scheduledPosts.find((post: any) => {
          const postTime = new Date(post.scheduledFor).toISOString()
          return postTime === slotTime
        })

        return {
          time: slotTime,
          available: !existingPost,
          existingPost: existingPost ? {
            id: existingPost.id || existingPost._id,
            title: existingPost.content?.substring(0, 50) || "Scheduled Post"
          } : undefined
        }
      })

      setSlots(mappedSlots)

      // Auto-select first available slot
      const firstAvailable = mappedSlots.find(slot => slot.available)
      if (firstAvailable) {
        setSelectedSlot(firstAvailable.time)
      }
    } catch (err: any) {
      console.error("Failed to fetch slots:", err)
      setError(err.message || "Failed to load queue slots")
    } finally {
      setLoading(false)
    }
  }

  const handleSchedule = async () => {
    if (!selectedSlot || !profileId) return

    setScheduling(true)
    setError(null)

    try {
      const response = await fetch("/api/posts/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          scheduledFor: selectedSlot,
          profileId
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to schedule post")
      }

      const data = await response.json()

      // Show success message
      alert(`✅ Post scheduled successfully for ${new Date(selectedSlot).toLocaleString()}`)

      // Close modal and refresh
      onOpenChange(false)
      onScheduled?.()
    } catch (err: any) {
      console.error("Failed to schedule post:", err)
      setError(err.message || "Failed to schedule post")
    } finally {
      setScheduling(false)
    }
  }

  const formatSlotTime = (time: string) => {
    const date = new Date(time)
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Post to Queue</DialogTitle>
          <DialogDescription>
            Select an available time slot to schedule: <span className="font-semibold">{postTitle}</span>
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : slots.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No queue slots available. Please configure your posting schedule in the Scheduling page.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {slots.filter(s => s.available).length} available slots out of {slots.length} upcoming slots
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {slots.map((slot, index) => {
                const { date, time } = formatSlotTime(slot.time)
                const isSelected = selectedSlot === slot.time

                return (
                  <button
                    key={index}
                    onClick={() => slot.available && setSelectedSlot(slot.time)}
                    disabled={!slot.available || scheduling}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${isSelected
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : slot.available
                          ? "border-gray-200 hover:border-blue-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                          : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900 opacity-60 cursor-not-allowed"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isSelected
                            ? "bg-blue-500 text-white"
                            : slot.available
                              ? "bg-gray-100 dark:bg-gray-800"
                              : "bg-gray-200 dark:bg-gray-700"
                          }`}>
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {date}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="h-3 w-3" />
                            {time}
                          </div>
                        </div>
                      </div>

                      <div>
                        {slot.available ? (
                          isSelected ? (
                            <Badge className="bg-blue-500">Selected</Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Available
                            </Badge>
                          )
                        ) : (
                          <Badge variant="secondary" className="bg-gray-200 text-gray-600">
                            Occupied
                          </Badge>
                        )}
                      </div>
                    </div>

                    {!slot.available && slot.existingPost && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 pl-14">
                        Scheduled: {slot.existingPost.title}...
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={scheduling}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSchedule}
                disabled={!selectedSlot || scheduling}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {scheduling ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Schedule Post
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
