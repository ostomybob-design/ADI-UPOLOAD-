"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle2, Clock, TrendingUp } from "lucide-react"

interface StatsOverviewProps {
  totalPosts: number
  readyToPost: number
  scheduled: number
  published: number
}

export function StatsOverview({ totalPosts, readyToPost, scheduled, published }: StatsOverviewProps) {
  const stats = [
    {
      title: "Total Content",
      value: totalPosts,
      icon: FileText,
      description: "Articles discovered",
      color: "text-blue-600"
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
    }
  ]

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        const gradients = {
          'text-blue-600': 'from-blue-500 to-cyan-500',
          'text-green-600': 'from-green-500 to-emerald-500',
          'text-orange-600': 'from-orange-500 to-amber-500',
          'text-purple-600': 'from-purple-500 to-pink-500'
        }
        const gradient = gradients[stat.color as keyof typeof gradients] || 'from-gray-500 to-gray-600'

        return (
          <Card key={stat.title} className="hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16`}></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 p-3 sm:p-6 pt-0">
              <div className={`text-2xl sm:text-4xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>{stat.value}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-medium">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
