"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface SetScheduleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  postId: number
  postTitle: string
  onScheduled?: () => void
}

export function SetScheduleModal({
  open,
  onOpenChange,
  postId,
  postTitle,
  onScheduled
}: SetScheduleModalProps) {
  const [scheduling, setScheduling] = useState(false)
  const [scheduledDate, setScheduledDate] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSchedule = async () => {
    if (!scheduledDate) {
      setError("Please select a date and time")
      return
    }

    const selectedDateTime = new Date(scheduledDate)
    const now = new Date()

    if (selectedDateTime <= now) {
      setError("Please select a future date and time")
      return
    }

    setScheduling(true)
    setError(null)

    try {
      // Get the profile ID from config
      const configResponse = await fetch("/api/late/config")
      if (!configResponse.ok) {
        throw new Error("Failed to fetch Late.dev configuration. Please set up your Late.dev profile.")
      }
      const config = await configResponse.json()
      const profileId = config.profileId

      if (!profileId) {
        throw new Error("No profile ID configured. Please set up your Late.dev profile.")
      }

      // Schedule the post using the schedule API
      const response = await fetch("/api/posts/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          scheduledFor: selectedDateTime.toISOString(),
          profileId
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to schedule post")
      }

      alert(`✅ Post scheduled for ${selectedDateTime.toLocaleString()}`)
      
      // Close modal and refresh
      onOpenChange(false)
      onScheduled?.()
      setScheduledDate("")
    } catch (err: any) {
      console.error("Failed to schedule post:", err)
      setError(err.message || "Failed to schedule post")
    } finally {
      setScheduling(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Set Schedule Date</DialogTitle>
          <DialogDescription>
            Choose a specific date and time to schedule: <span className="font-semibold">{postTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="schedule-date">Date & Time</Label>
            <input
              id="schedule-date"
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => {
                setScheduledDate(e.target.value)
                setError(null)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              setScheduledDate("")
              setError(null)
            }}
            disabled={scheduling}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={scheduling || !scheduledDate}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {scheduling ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Setting...
              </>
            ) : (
              "Set Schedule"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
