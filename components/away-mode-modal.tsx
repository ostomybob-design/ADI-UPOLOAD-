"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AwayModeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAwayDaysUpdated: () => void
}

export function AwayModeModal({ open, onOpenChange, onAwayDaysUpdated }: AwayModeModalProps) {
  const { toast } = useToast()
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [saving, setSaving] = useState(false)
  const [existingAwayDays, setExistingAwayDays] = useState<Set<string>>(new Set())

  // Load existing away days
  useEffect(() => {
    if (open) {
      fetchAwayDays()
    }
  }, [open])

  const fetchAwayDays = async () => {
    try {
      const response = await fetch("/api/away-mode")
      if (response.ok) {
        const data = await response.json()
        const dates = new Set<string>(data.awayDays.map((d: any) => d.away_date.split('T')[0]))
        setExistingAwayDays(dates)
        setSelectedDates(new Set<string>(dates))
      }
    } catch (error) {
      console.error("Failed to fetch away days:", error)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const toggleDate = (dateString: string) => {
    const newSelected = new Set(selectedDates)
    if (newSelected.has(dateString)) {
      newSelected.delete(dateString)
    } else {
      newSelected.add(dateString)
    }
    setSelectedDates(newSelected)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/away-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          awayDates: Array.from(selectedDates)
        })
      })

      if (response.ok) {
        toast({
          title: "Away Mode Updated",
          description: `${selectedDates.size} day(s) set to away mode`
        })
        onAwayDaysUpdated()
        onOpenChange(false)
      } else {
        throw new Error("Failed to save away days")
      }
    } catch (error) {
      console.error("Save error:", error)
      toast({
        title: "Error",
        description: "Failed to save away days",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth)
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Away Mode
          </DialogTitle>
          <DialogDescription>
            Select days when you'll be away. The system will auto-approve posts as needed to keep your queue filled.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            >
              ←
            </Button>
            <div className="font-semibold">
              {monthNames[month]} {year}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
            >
              →
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="border rounded-lg p-3">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Actual days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dateString = formatDateString(year, month, day)
                const isSelected = selectedDates.has(dateString)
                const dateObj = new Date(year, month, day)
                const isPast = dateObj < today
                const isToday = dateObj.getTime() === today.getTime()

                return (
                  <button
                    key={day}
                    onClick={() => !isPast && toggleDate(dateString)}
                    disabled={isPast}
                    className={`
                      aspect-square rounded-md text-sm font-medium transition-all
                      ${isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}
                      ${isSelected ? 'bg-red-500 text-white hover:bg-red-600' : ''}
                      ${isToday && !isSelected ? 'border-2 border-blue-500' : ''}
                    `}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected count */}
          <div className="text-sm text-gray-600">
            {selectedDates.size === 0 ? (
              "No days selected"
            ) : (
              `${selectedDates.size} day${selectedDates.size > 1 ? 's' : ''} selected`
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              <Calendar className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Away Days"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
