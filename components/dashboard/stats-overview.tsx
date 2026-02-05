"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle2, Clock, TrendingUp, FileEdit, ThumbsUp, XCircle } from "lucide-react"

interface StatsOverviewProps {
  totalPosts: number
  readyToPost: number
  drafts: number
  approved: number
  scheduled: number
  published: number
  rejected: number
  activeTab: string
  onTabChange: (tab: string) => void
}

export function StatsOverview({ totalPosts, readyToPost, drafts, approved, scheduled, published, rejected, activeTab, onTabChange }: StatsOverviewProps) {
  const stats = [
    {
      title: "Drafts",
      value: drafts,
      icon: FileEdit,
      description: "Saved for later",
      color: "text-gray-600",
      tab: "draft"
    },
    {
      title: "Ready to Post",
      value: readyToPost,
      icon: CheckCircle2,
      description: "Processed & ready",
      color: "text-green-600",
      tab: "pending"
    },
    {
      title: "Approved",
      value: approved,
      icon: ThumbsUp,
      description: "Not yet scheduled",
      color: "text-teal-600",
      tab: "approved"
    },
    {
      title: "Scheduled",
      value: scheduled,
      icon: Clock,
      description: "Awaiting publication",
      color: "text-orange-600",
      tab: "scheduled"
    },
    {
      title: "Published",
      value: published,
      icon: TrendingUp,
      description: "Live on social media",
      color: "text-purple-600",
      tab: "published"
    },
    {
      title: "Rejected",
      value: rejected,
      icon: XCircle,
      description: "Not suitable",
      color: "text-red-600",
      tab: "rejected"
    },
    {
      title: "Total Content",
      value: totalPosts,
      icon: FileText,
      description: "All posts",
      color: "text-blue-600",
      tab: "all"
    }
  ]

  return (
    <div className="grid gap-2 sm:gap-3 grid-cols-7">
      {stats.map((stat) => {
        const Icon = stat.icon
        const isActive = activeTab === stat.tab
        const gradients = {
          'text-blue-600': 'from-blue-500 to-cyan-500',
          'text-green-600': 'from-green-500 to-emerald-500',
          'text-gray-600': 'from-gray-500 to-slate-600',
          'text-teal-600': 'from-teal-500 to-cyan-600',
          'text-orange-600': 'from-orange-500 to-amber-500',
          'text-purple-600': 'from-purple-500 to-pink-500',
          'text-red-600': 'from-red-500 to-rose-600'
        }
        const gradient = gradients[stat.color as keyof typeof gradients] || 'from-gray-500 to-gray-600'

        return (
          <Card 
            key={stat.title} 
            onClick={() => onTabChange(stat.tab)}
            className={`cursor-pointer transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 overflow-hidden relative ${
              isActive 
                ? `border-${stat.color.replace('text-', '')} shadow-lg scale-105 ring-2 ring-${stat.color.replace('text-', '')}/20` 
                : 'border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-102'
            }`}
          >
            <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${gradient} opacity-${isActive ? '20' : '10'} rounded-full -mr-8 -mt-8`}></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 relative z-10 p-2 sm:p-3">
              <CardTitle className={`text-[10px] sm:text-xs font-semibold ${isActive ? stat.color : 'text-muted-foreground'}`}>
                {stat.title}
              </CardTitle>
              <div className={`p-1 rounded-lg bg-gradient-to-br ${gradient} shadow-md ${isActive ? 'shadow-xl' : ''}`}>
                <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 p-2 sm:p-3 pt-0">
              <div className={`text-xl sm:text-2xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>{stat.value}</div>
              <p className={`text-[9px] sm:text-[10px] mt-0.5 font-medium ${isActive ? stat.color : 'text-muted-foreground'}`}>
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
