"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Plus, Trash2, Clock } from "lucide-react";

interface QueueConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId?: string;
  onConfigured?: () => void;
}

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Australia/Sydney",
  "UTC",
];

export function QueueConfigModal({
  open,
  onOpenChange,
  profileId: initialProfileId,
  onConfigured,
}: QueueConfigModalProps) {
  const [profileId, setProfileId] = React.useState(initialProfileId || "");
  const [timezone, setTimezone] = React.useState("America/New_York");
  const [slots, setSlots] = React.useState<Array<{ dayOfWeek: number; time: string }>>([
    { dayOfWeek: 1, time: "09:00" },
    { dayOfWeek: 3, time: "14:00" },
    { dayOfWeek: 5, time: "17:00" },
  ]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(false);

  // Fetch profile ID from accounts
  React.useEffect(() => {
    const fetchProfileId = async () => {
      if (profileId) return; // Already have it

      try {
        const response = await fetch("/api/late/accounts");
        if (response.ok) {
          const accounts = await response.json();
          if (accounts.length > 0 && accounts[0].profileId) {
            setProfileId(accounts[0].profileId);
          }
        }
      } catch (error) {
        console.error("Error fetching profile ID:", error);
      }
    };

    if (open) {
      fetchProfileId();
    }
  }, [open, profileId]);

  // Fetch existing queue config
  React.useEffect(() => {
    const fetchQueue = async () => {
      if (!profileId) return;

      setIsFetching(true);
      try {
        const response = await fetch(`/api/late/queue/slots?profileId=${profileId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.exists && data.schedule) {
            setTimezone(data.schedule.timezone || "America/New_York");
            if (data.schedule.slots && data.schedule.slots.length > 0) {
              setSlots(data.schedule.slots);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching queue:", error);
      } finally {
        setIsFetching(false);
      }
    };

    if (open && profileId) {
      fetchQueue();
    }
  }, [open, profileId]);

  const addSlot = () => {
    setSlots([...slots, { dayOfWeek: 1, time: "09:00" }]);
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: "dayOfWeek" | "time", value: number | string) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSlots(newSlots);
  };

  const handleSave = async () => {
    if (!profileId) {
      alert("Profile ID is required. Please connect your accounts first.");
      return;
    }

    if (slots.length === 0) {
      alert("Please add at least one time slot.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/late/queue/slots", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          timezone,
          slots,
          active: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save queue configuration");
      }

      const data = await response.json();
      alert(`✅ Queue configured successfully!\n\nNext slots:\n${data.schedule?.nextSlots?.slice(0, 3).map((s: string) => new Date(s).toLocaleString()).join("\n") || "Check Late.dev dashboard"}`);
      onConfigured?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving queue:", error);
      alert("Failed to save queue configuration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Configure Posting Queue
          </DialogTitle>
          <DialogDescription>
            Set up your automatic posting schedule. Posts will be scheduled to these time slots.
          </DialogDescription>
        </DialogHeader>

        {isFetching ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading queue configuration...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile ID */}
            <div className="space-y-2">
              <Label>Profile ID</Label>
              <Input
                value={profileId}
                onChange={(e) => setProfileId(e.target.value)}
                placeholder="Auto-detected from connected accounts"
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Automatically detected from your connected accounts
              </p>
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <Label>Timezone</Label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Posts will be scheduled in this timezone
              </p>
            </div>

            {/* Time Slots */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Time Slots</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSlot}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Slot
                </Button>
              </div>

              <div className="space-y-2">
                {slots.map((slot, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <select
                      value={slot.dayOfWeek}
                      onChange={(e) => updateSlot(index, "dayOfWeek", parseInt(e.target.value))}
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      {DAYS.map((day) => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-2 flex-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={slot.time}
                        onChange={(e) => updateSlot(index, "time", e.target.value)}
                        className="flex-1"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSlot(index)}
                      disabled={slots.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                Posts will be automatically scheduled to these time slots each week
              </p>
            </div>

            {/* Preview */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-sm mb-2">Schedule Preview</h4>
              <div className="space-y-1 text-sm">
                {slots
                  .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.time.localeCompare(b.time))
                  .map((slot, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="font-medium">
                        {DAYS.find((d) => d.value === slot.dayOfWeek)?.label}
                      </span>
                      <span className="text-muted-foreground">at</span>
                      <span className="font-medium">{slot.time}</span>
                      <span className="text-muted-foreground">({timezone})</span>
                    </div>
                  ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {slots.length} posts per week
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading || !profileId}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  "Save & Activate Queue"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
