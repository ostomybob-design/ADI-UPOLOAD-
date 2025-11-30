"use client"

import { Button } from "@/components/ui/button"
import { FileText, Plus, RefreshCw } from "lucide-react"

interface EmptyStateProps {
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 p-8 mb-6 shadow-lg">
        <FileText className="h-16 w-16 text-blue-500" />
      </div>
      <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{title}</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6 text-lg">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          {action.label}
        </Button>
      )}
    </div>
  )
}
