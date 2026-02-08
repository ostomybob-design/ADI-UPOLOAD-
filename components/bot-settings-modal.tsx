"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { Bot, Clock, Hash, Zap, Save, ExternalLink, AlertCircle, Play } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface BotSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface BotSettings {
  maxPostsPerQuery: number
  scheduleTimes: string[]
  enabled: boolean
  useSerper: boolean
}

export function BotSettingsModal({ open, onOpenChange }: BotSettingsModalProps) {
  const [settings, setSettings] = useState<BotSettings>({
    maxPostsPerQuery: 5,
    scheduleTimes: ["09:00", "17:00"],
    enabled: true,
    useSerper: true,
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      fetchSettings()
    }
  }, [open])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/bot/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      }
    } catch (error) {
      console.error("Failed to fetch bot settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/bot/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast({
          title: "Settings Saved",
          description: "Bot settings have been updated. Changes will take effect on next run.",
        })
        onOpenChange(false)
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save bot settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const openGitHubActions = () => {
    window.open("https://github.com/ostomybob-design/ostomy-social-media-automation/actions", "_blank")
  }

  const openGitHubSecrets = () => {
    window.open("https://github.com/ostomybob-design/ostomy-social-media-automation/settings/secrets/actions", "_blank")
  }

  const runBotNow = () => {
    // Open GitHub Actions with instructions to manually trigger
    window.open("https://github.com/ostomybob-design/ostomy-social-media-automation/actions/workflows/scraper.yml", "_blank")
    toast({
      title: "Opening GitHub Actions",
      description: "Click 'Run workflow' button to start the bot immediately.",
    })
  }

  const calculateEstimatedPosts = () => {
    // 20 queries × maxPostsPerQuery × ~50% success rate (after duplicates/filtering)
    const totalAttempts = 20 * settings.maxPostsPerQuery
    const estimated = Math.round(totalAttempts * 0.5)
    return { totalAttempts, estimated }
  }

  const { totalAttempts, estimated } = calculateEstimatedPosts()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Bot className="h-6 w-6 text-purple-500" />
            Bot Settings
          </DialogTitle>
          <DialogDescription>
            Configure the automated content scraper bot that runs on GitHub Actions
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Posts Per Query */}
            <div className="space-y-2">
              <Label htmlFor="maxPosts" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Posts Per Query
              </Label>
              <Input
                id="maxPosts"
                type="number"
                min="1"
                max="20"
                value={settings.maxPostsPerQuery}
                onChange={(e) => setSettings({ ...settings, maxPostsPerQuery: parseInt(e.target.value) || 1 })}
              />
              <p className="text-sm text-muted-foreground">
                How many URLs to process per search query (1-20)
              </p>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Estimated output:</strong> ~{estimated} posts per run
                  <br />
                  <span className="text-xs text-muted-foreground">
                    (20 queries × {settings.maxPostsPerQuery} URLs = {totalAttempts} attempts → ~50% pass filters)
                  </span>
                </AlertDescription>
              </Alert>
            </div>

            {/* Schedule Times */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Schedule Times (UTC)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {settings.scheduleTimes.map((time, index) => (
                  <Input
                    key={index}
                    type="time"
                    value={time}
                    onChange={(e) => {
                      const newTimes = [...settings.scheduleTimes]
                      newTimes[index] = e.target.value
                      setSettings({ ...settings, scheduleTimes: newTimes })
                    }}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Currently runs at {settings.scheduleTimes[0]} UTC and {settings.scheduleTimes[1]} UTC
                <br />
                <span className="text-xs">
                  (9:00 = 4 AM EST / 1 AM PST, 17:00 = 12 PM EST / 9 AM PST)
                </span>
              </p>
            </div>

            {/* API Selection */}
            <div className="space-y-2">
              <Label htmlFor="useSerper" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Search API
              </Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="useSerper"
                  checked={settings.useSerper}
                  onCheckedChange={(checked) => setSettings({ ...settings, useSerper: checked })}
                />
                <Label htmlFor="useSerper" className="font-normal">
                  Use Serper API {settings.useSerper ? "(Selected)" : "(Using Bright Data)"}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {settings.useSerper 
                  ? "Serper API: Free tier available, good for testing"
                  : "Bright Data: Better anti-blocking, recommended for production"
                }
              </p>
            </div>

            {/* Enabled Toggle */}
            <div className="space-y-2">
              <Label htmlFor="enabled" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Bot Status
              </Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  checked={settings.enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
                />
                <Label htmlFor="enabled" className="font-normal">
                  {settings.enabled ? "Enabled - Bot will run on schedule" : "Disabled - Bot will not run automatically"}
                </Label>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-2 pt-4 border-t">
              <Label className="text-sm font-semibold">Quick Actions</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={runBotNow}
                  className="justify-start bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 border-0"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run Now
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openGitHubActions}
                  className="justify-start"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Runs
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openGitHubSecrets}
                  className="justify-start"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  API Keys
                </Button>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-blue-500 to-purple-600"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
