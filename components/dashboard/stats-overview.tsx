"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle2, Clock, TrendingUp, FileEdit } from "lucide-react"

interface StatsOverviewProps {
  totalPosts: number
  readyToPost: number
  drafts: number
  scheduled: number
  published: number
}

export function StatsOverview({ totalPosts, readyToPost, drafts, scheduled, published }: StatsOverviewProps) {
  const stats = [
    {
      title: "Drafts",
      value: drafts,
      icon: FileEdit,
      description: "Saved for later",
      color: "text-gray-600"
    },
    {
      title: "Ready to Post",
      value: readyToPost,
      icon: CheckCircle2,
      description: "Processed & ready",
      color: "text-green-600"
    },
    {
      title: "Scheduled",
      value: scheduled,
      icon: Clock,
      description: "Awaiting publication",
      color: "text-orange-600"
    },
    {
      title: "Published",
      value: published,
      icon: TrendingUp,
      description: "Live on social media",
      color: "text-purple-600"
    },
    {
      title: "Total Content",
      value: totalPosts,
      icon: FileText,
      description: "Articles discovered",
      color: "text-blue-600"
    }
  ]

  return (
    <div className="grid gap-2 sm:gap-3 grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon
        const gradients = {
          'text-blue-600': 'from-blue-500 to-cyan-500',
          'text-green-600': 'from-green-500 to-emerald-500',
          'text-gray-600': 'from-gray-500 to-slate-600',
          'text-orange-600': 'from-orange-500 to-amber-500',
          'text-purple-600': 'from-purple-500 to-pink-500'
        }
        const gradient = gradients[stat.color as keyof typeof gradients] || 'from-gray-500 to-gray-600'

        return (
          <Card key={stat.title} className="hover:shadow-lg hover:scale-105 transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${gradient} opacity-10 rounded-full -mr-8 -mt-8`}></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 relative z-10 p-2 sm:p-3">
              <CardTitle className="text-[10px] sm:text-xs font-semibold text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-1 rounded-lg bg-gradient-to-br ${gradient} shadow-md`}>
                <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 p-2 sm:p-3 pt-0">
              <div className={`text-xl sm:text-2xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>{stat.value}</div>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 font-medium">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
