"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Clock, Plus, Trash2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ScheduleConfig {
  id?: number
  posts_per_day: number
  posting_times: string[]
  timezone: string
  instagram_enabled: boolean
  facebook_enabled: boolean
  buffer_size: number
  auto_approve_enabled: boolean
}

export function SchedulingConfig() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<ScheduleConfig>({
    posts_per_day: 3,
    posting_times: ["09:00", "13:00", "18:00"],
    timezone: "UTC",
    instagram_enabled: true,
    facebook_enabled: true,
    buffer_size: 7,
    auto_approve_enabled: false
  })

  useEffect(() => {
    fetchSchedule()
  }, [])

  const fetchSchedule = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/schedule")
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      }
    } catch (error) {
      console.error("Failed to fetch schedule:", error)
      toast({
        title: "Error",
        description: "Failed to load schedule configuration",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Schedule configuration saved successfully"
        })
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      console.error("Failed to save schedule:", error)
      toast({
        title: "Error",
        description: "Failed to save schedule configuration",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const addPostingTime = () => {
    const newTime = "12:00"
    setConfig({
      ...config,
      posts_per_day: config.posts_per_day + 1,
      posting_times: [...config.posting_times, newTime]
    })
  }

  const removePostingTime = (index: number) => {
    if (config.posting_times.length <= 1) {
      toast({
        title: "Warning",
        description: "You must have at least one posting time",
        variant: "destructive"
      })
      return
    }

    const newTimes = config.posting_times.filter((_, i) => i !== index)
    setConfig({
      ...config,
      posts_per_day: config.posts_per_day - 1,
      posting_times: newTimes
    })
  }

  const updatePostingTime = (index: number, value: string) => {
    const newTimes = [...config.posting_times]
    newTimes[index] = value
    setConfig({ ...config, posting_times: newTimes })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Posting Schedule Configuration
        </CardTitle>
        <CardDescription>
          Configure when and how often posts are published
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Posts Per Day */}
        <div className="space-y-2">
          <Label>Posts Per Day: {config.posts_per_day}</Label>
          <p className="text-sm text-muted-foreground">
            Number of times to post each day
          </p>
        </div>

        {/* Posting Times */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Posting Times (24-hour format)</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPostingTime}
              disabled={config.posting_times.length >= 10}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Time
            </Button>
          </div>
          <div className="space-y-2">
            {config.posting_times.map((time, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => updatePostingTime(index, e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removePostingTime(index)}
                  disabled={config.posting_times.length <= 1}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Buffer Size */}
        <div className="space-y-2">
          <Label htmlFor="buffer-size">Buffer Size (days)</Label>
          <Input
            id="buffer-size"
            type="number"
            min="1"
            max="30"
            value={config.buffer_size}
            onChange={(e) => setConfig({ ...config, buffer_size: parseInt(e.target.value) || 7 })}
          />
          <p className="text-sm text-muted-foreground">
            Number of days worth of posts to pre-approve
          </p>
        </div>

        {/* Platform Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Instagram</Label>
              <p className="text-sm text-muted-foreground">
                Enable posting to Instagram
              </p>
            </div>
            <Switch
              checked={config.instagram_enabled}
              onCheckedChange={(checked) => setConfig({ ...config, instagram_enabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Facebook</Label>
              <p className="text-sm text-muted-foreground">
                Enable posting to Facebook
              </p>
            </div>
            <Switch
              checked={config.facebook_enabled}
              onCheckedChange={(checked) => setConfig({ ...config, facebook_enabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Approve</Label>
              <p className="text-sm text-muted-foreground">
                Automatically approve new posts (not recommended)
              </p>
            </div>
            <Switch
              checked={config.auto_approve_enabled}
              onCheckedChange={(checked) => setConfig({ ...config, auto_approve_enabled: checked })}
            />
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Configuration"}
        </Button>
      </CardContent>
    </Card>
  )
}
