"use client"

import { useEffect, useState, useCallback } from "react"
import * as React from "react"
import { PostCard } from "@/components/dashboard/post-card"
import { PostCardSkeleton } from "@/components/dashboard/post-card-skeleton"
import { PostDetailModal } from "@/components/dashboard/post-detail-modal"
import { StatsOverview } from "@/components/dashboard/stats-overview"
import { FilterBar } from "@/components/dashboard/filter-bar"
import { DashboardHeader } from "@/components/dashboard/header"
import { EmptyState } from "@/components/dashboard/empty-state"
import { CreatePostModal } from "@/components/create-post-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Plus, LayoutGrid, Table as TableIcon, CalendarPlus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/data-table/data-table"
import { createColumns, SearchResult } from "./columns"
import { draftUtils } from "@/lib/draft-utils"

type Post = SearchResult

export default function DashboardPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [activeTab, setActiveTab] = useState("draft")
  const [viewMode, setViewMode] = useState<"card" | "table">("table")
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editingPostId, setEditingPostId] = useState<number | null>(null)
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null)
  const [lateScheduledPosts, setLateScheduledPosts] = useState<any[]>([])
  const [latePublishedPosts, setLatePublishedPosts] = useState<any[]>([])
  const [loadingLatePosts, setLoadingLatePosts] = useState(false)
  const [selectedPosts, setSelectedPosts] = useState<number[]>([])
  const [bulkScheduling, setBulkScheduling] = useState(false)

  useEffect(() => {
    const savedView = localStorage.getItem("dashboardViewMode")
    if (savedView === "card" || savedView === "table") {
      setViewMode(savedView)
    }
  }, [])

  const handleViewModeChange = (mode: "card" | "table") => {
    setViewMode(mode)
    localStorage.setItem("dashboardViewMode", mode)
  }

  const fetchLatePosts = async () => {
    try {
      setLoadingLatePosts(true)

      // Fetch scheduled posts from Late.dev
      const scheduledResponse = await fetch("/api/late/posts?status=scheduled&limit=100")
      if (scheduledResponse.ok) {
        const scheduledData = await scheduledResponse.json()
        console.log("📦 Raw scheduled response:", scheduledData)

        // Handle both array and object responses
        const scheduledPosts = Array.isArray(scheduledData) ? scheduledData : (scheduledData.posts || [])
        setLateScheduledPosts(scheduledPosts)
        console.log("✅ Fetched scheduled posts from Late.dev:", scheduledPosts.length)
      } else {
        console.error("❌ Failed to fetch scheduled posts:", scheduledResponse.status, scheduledResponse.statusText)
      }

      // Fetch published posts from Late.dev
      const publishedResponse = await fetch("/api/late/posts?status=published&limit=100")
      if (publishedResponse.ok) {
        const publishedData = await publishedResponse.json()
        console.log("📦 Raw published response:", publishedData)

        // Handle both array and object responses
        const publishedPosts = Array.isArray(publishedData) ? publishedData : (publishedData.posts || [])
        setLatePublishedPosts(publishedPosts)
        console.log("✅ Fetched published posts from Late.dev:", publishedPosts.length)
      } else {
        console.error("❌ Failed to fetch published posts:", publishedResponse.status, publishedResponse.statusText)
      }
    } catch (error) {
      console.error("❌ Failed to fetch Late.dev posts:", error)
    } finally {
      setLoadingLatePosts(false)
    }
  }

  const fetchPosts = async (syncFirst: boolean = false) => {
    try {
      setLoading(true)

      // Sync with Late.dev first if requested
      if (syncFirst) {
        console.log("🔄 Syncing with Late.dev...")
        try {
          // Add timeout to prevent hanging
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

          const syncResponse = await fetch("/api/late/sync", {
            method: "POST",
            signal: controller.signal
          })
          clearTimeout(timeoutId)

          if (syncResponse.ok) {
            const syncData = await syncResponse.json()
            console.log("✅ Sync complete:", syncData.message)
          } else {
            console.warn("⚠️ Sync failed, continuing with local data")
          }
        } catch (syncError: any) {
          if (syncError.name === 'AbortError') {
            console.warn("⚠️ Sync timeout (30s), continuing with local data")
          } else {
            console.warn("⚠️ Sync error, continuing with local data:", syncError)
          }
        }
      }

      console.log("🔄 Fetching posts from API...")
      const response = await fetch("/api/search-results")
      if (response.ok) {
        const data = await response.json()
        console.log("✅ Posts fetched successfully:", data.length)
        console.log("📋 Post statuses breakdown:", {
          total: data.length,
          drafts: data.filter((p: Post) => p.is_draft).length,
          pending: data.filter((p: Post) => p.approval_status === "pending" && !p.is_draft).length,
          approved: data.filter((p: Post) => p.approval_status === "approved").length,
          rejected: data.filter((p: Post) => p.approval_status === "rejected").length,
          withLatePostId: data.filter((p: Post) => p.late_post_id).length,
          withScheduledFor: data.filter((p: Post) => p.late_scheduled_for).length,
          withPublishedAt: data.filter((p: Post) => p.late_published_at).length,
          contentProcessed: data.filter((p: Post) => p.content_processed).length,
          withCaption: data.filter((p: Post) => p.ai_caption).length
        })
        
        // All posts are now in the database (no more localStorage)
        console.log("📊 Total posts (all from database):", data.length)
        
        setPosts(data)
      } else {
        console.error("❌ Failed to fetch posts:", response.status, response.statusText)
      }

      // Fetch Late.dev posts for scheduled and published tabs
      await fetchLatePosts()
    } catch (error) {
      console.error("❌ Failed to fetch posts:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Load posts without syncing on initial load (use refresh button to sync)
    fetchPosts(false)
  }, [])

  useEffect(() => {
    console.log("🔍 Filtering posts - Active Tab:", activeTab)
    console.log("📊 Total posts:", posts.length)

    let filtered = [...posts]

    // Log sample post structure
    if (posts.length > 0) {
      console.log("📝 Sample post structure:", {
        id: posts[0].id,
        approval_status: posts[0].approval_status,
        content_processed: posts[0].content_processed,
        late_post_id: posts[0].late_post_id,
        late_scheduled_for: posts[0].late_scheduled_for,
        late_published_at: posts[0].late_published_at,
        ai_caption: posts[0].ai_caption ? "exists" : "null"
      })
    }

    // Apply tab filter (primary filter)
    if (activeTab === "all") {
      console.log("🌐 Showing all posts (including drafts, pending, approved, scheduled, published, rejected)...")
      // No filtering - show everything
      console.log("🌐 Total posts displayed:", filtered.length)
    } else if (activeTab === "pending") {
      console.log("⏳ Filtering for pending posts...")
      const pendingPosts = posts.filter(post => {
        const isPending = post.approval_status === "pending" && post.content_processed && !post.is_draft
        if (isPending) {
          console.log("  ✓ Pending post:", post.id, post.title.substring(0, 50))
        }
        return isPending
      })
      filtered = pendingPosts
      console.log("⏳ Pending posts found:", filtered.length)
    } else if (activeTab === "approved") {
      console.log("✅ Filtering for approved posts...")
      // Exclude posts that have been scheduled to Late.dev
      filtered = filtered.filter(post => 
        post.approval_status === "approved" && 
        !post.late_post_id && // Exclude if it has a Late.dev post ID (it's scheduled)
        !post.late_scheduled_for // Exclude if it has a scheduled date
      )
      console.log("✅ Approved posts found:", filtered.length)
    } else if (activeTab === "draft") {
      console.log("📝 Filtering for draft posts...")
      filtered = filtered.filter(post => post.is_draft === true)
      console.log("📝 Draft posts found:", filtered.length)
    } else if (activeTab === "scheduled") {
      console.log("📅 Filtering for scheduled posts from Late.dev and database...")
      console.log("📊 Late scheduled posts count:", lateScheduledPosts.length)

      // Get database posts with schedule dates (not yet on Late.dev)
      const dbScheduledPosts = posts.filter(p => 
        p.approval_status === "approved" && // Must be approved
        p.late_scheduled_for && 
        !p.late_published_at && 
        !p.late_post_id // Not already on Late.dev
      );
      console.log("📊 Database scheduled posts count:", dbScheduledPosts.length)

      // Map Late.dev scheduled posts and find corresponding database records
      const lateScheduledMapped = lateScheduledPosts
        .map((latePost: any): Post => {
          const latePostId = latePost.id || latePost._id;
          // Find the corresponding database record by late_post_id
          const dbPost = posts.find(p => p.late_post_id === latePostId);

          // Debug logging
          console.log(`🔍 Looking for database post with late_post_id: ${latePostId}`);
          console.log(`📊 Found dbPost:`, dbPost ? `ID ${dbPost.id}` : 'NOT FOUND');
          if (!dbPost) {
            console.log(`📋 Database posts with late_post_id:`, posts.filter(p => p.late_post_id).map(p => ({ id: p.id, late_post_id: p.late_post_id })));
          }

          // Show all Late.dev posts, even without database records
          if (!dbPost) {
            console.log(`ℹ️ Showing Late.dev post without database record: ${latePostId}`);
            // Create a minimal post object from Late.dev data
            return {
              id: -1, // Negative ID to indicate no database record
              title: latePost.content?.substring(0, 100) || "Scheduled Post",
              url: `https://getlate.dev/posts/${latePostId}`,
              snippet: latePost.content,
              position: null,
              date: latePost.scheduledFor,
              search_query: null,
              raw_data: latePost,
              created_at: latePost.createdAt,
              updated_at: latePost.updatedAt || latePost.createdAt,
              html_content: null,
              content_extraction_date: null,
              ai_caption: latePost.content,
              ai_hashtags: null,
              ai_summary: latePost.content,
              content_processed: true,
              main_image_url: latePost.mediaItems?.[0]?.url || null,
              additional_images: latePost.mediaItems?.slice(1).map((m: any) => m.url) || null,
              approval_status: "approved",
              late_post_id: latePostId,
              late_scheduled_for: latePost.scheduledFor,
              late_published_at: null,
              late_platforms: latePost.platforms,
              late_status: latePost.status,
            };
          }

          return {
            id: dbPost.id, // Always use database ID for editing
            title: latePost.content?.substring(0, 100) || dbPost.title || "Scheduled Post",
            url: dbPost.url || `https://getlate.dev/posts/${latePostId}`,
            snippet: latePost.content,
            position: null,
            date: latePost.scheduledFor,
            search_query: dbPost.search_query,
            raw_data: latePost,
            created_at: latePost.createdAt,
            updated_at: latePost.updatedAt || latePost.createdAt,
            html_content: dbPost.html_content,
            content_extraction_date: dbPost.content_extraction_date,
            ai_caption: latePost.content,
            ai_hashtags: dbPost.ai_hashtags || null,
            ai_summary: latePost.content,
            content_processed: true,
            main_image_url: latePost.mediaItems?.[0]?.url || dbPost.main_image_url || null,
            additional_images: latePost.mediaItems?.slice(1).map((m: any) => m.url) || dbPost.additional_images || null,
            approval_status: "approved",
            late_post_id: latePostId,
            late_scheduled_for: latePost.scheduledFor,
            late_published_at: null,
            late_platforms: latePost.platforms,
            late_status: latePost.status,
          };
        })
        .filter((post): post is Post => post !== null);

      // Combine Late.dev posts and database-only scheduled posts
      filtered = [...lateScheduledMapped, ...dbScheduledPosts];

      // Sort by scheduled date (earliest first)
      filtered.sort((a, b) => {
        const dateA = a.late_scheduled_for ? new Date(a.late_scheduled_for).getTime() : 0;
        const dateB = b.late_scheduled_for ? new Date(b.late_scheduled_for).getTime() : 0;
        return dateA - dateB;
      });

      console.log("📅 Scheduled posts displayed:", filtered.length)
    } else if (activeTab === "published") {
      console.log("🎉 Filtering for published posts from Late.dev...")
      console.log("📊 Late published posts count:", latePublishedPosts.length)

      // Map Late.dev published posts and find corresponding database records
      filtered = latePublishedPosts
        .map((latePost: any): Post => {
          const latePostId = latePost.id || latePost._id;
          // Find the corresponding database record by late_post_id
          const dbPost = posts.find(p => p.late_post_id === latePostId);

          // Show all Late.dev posts, even without database records
          if (!dbPost) {
            console.log(`ℹ️ Showing Late.dev post without database record: ${latePostId}`);
            // Create a minimal post object from Late.dev data
            return {
              id: -1, // Negative ID to indicate no database record
              title: latePost.content?.substring(0, 100) || "Published Post",
              url: `https://getlate.dev/posts/${latePostId}`,
              snippet: latePost.content,
              position: null,
              date: latePost.publishedAt,
              search_query: null,
              raw_data: latePost,
              created_at: latePost.createdAt,
              updated_at: latePost.updatedAt || latePost.createdAt,
              html_content: null,
              content_extraction_date: null,
              ai_caption: latePost.content,
              ai_hashtags: null,
              ai_summary: latePost.content,
              content_processed: true,
              main_image_url: latePost.mediaItems?.[0]?.url || null,
              additional_images: latePost.mediaItems?.slice(1).map((m: any) => m.url) || null,
              approval_status: "approved",
              late_post_id: latePostId,
              late_scheduled_for: latePost.scheduledFor,
              late_published_at: latePost.publishedAt,
              late_platforms: latePost.platforms,
              late_status: latePost.status,
            };
          }

          return {
            id: dbPost.id, // Always use database ID
            title: latePost.content?.substring(0, 100) || dbPost.title || "Published Post",
            url: dbPost.url || `https://getlate.dev/posts/${latePostId}`,
            snippet: latePost.content,
            position: null,
            date: latePost.publishedAt,
            search_query: dbPost.search_query,
            raw_data: latePost,
            created_at: latePost.createdAt,
            updated_at: latePost.updatedAt || latePost.createdAt,
            html_content: dbPost.html_content,
            content_extraction_date: dbPost.content_extraction_date,
            ai_caption: latePost.content,
            ai_hashtags: dbPost.ai_hashtags || null,
            ai_summary: latePost.content,
            content_processed: true,
            main_image_url: latePost.mediaItems?.[0]?.url || dbPost.main_image_url || null,
            additional_images: latePost.mediaItems?.slice(1).map((m: any) => m.url) || dbPost.additional_images || null,
            approval_status: "approved",
            late_post_id: latePostId,
            late_scheduled_for: latePost.scheduledFor,
            late_published_at: latePost.publishedAt,
            late_platforms: latePost.platforms,
            late_status: latePost.status,
          };
        })
        .filter((post): post is Post => post !== null)
      console.log("🎉 Published posts displayed:", filtered.length)
    } else if (activeTab === "rejected") {
      console.log("❌ Filtering for rejected posts...")
      filtered = filtered.filter(post => post.approval_status === "rejected")
      console.log("❌ Rejected posts found:", filtered.length)
    }

    // Apply additional status filter (only for non-Late.dev tabs)
    if (statusFilter !== "all" && activeTab !== "scheduled" && activeTab !== "published") {
      if (statusFilter === "ready") {
        filtered = filtered.filter(post =>
          post.content_processed && post.ai_caption && post.approval_status === "pending"
        )
      } else if (statusFilter === "processing") {
        filtered = filtered.filter(post => !post.content_processed || !post.ai_caption)
      }
      console.log("🎯 After status filter:", filtered.length)
    }

    // Apply sorting
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    } else if (sortBy === "title") {
      filtered.sort((a, b) => a.title.localeCompare(b.title))
    }

    console.log("✨ Final filtered posts:", filtered.length)

    setFilteredPosts(filtered)
  }, [posts, statusFilter, sortBy, activeTab, lateScheduledPosts, latePublishedPosts])

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return

    try {
      const response = await fetch(`/api/search-results/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setPosts(posts.filter(post => post.id !== id))
      }
    } catch (error) {
      console.error("Failed to delete post:", error)
    }
  }

  const handleBulkSchedule = async () => {
    if (selectedPosts.length === 0) return

    if (!confirm(`Schedule ${selectedPosts.length} posts to the next available queue slots?`)) {
      return
    }

    setBulkScheduling(true)

    try {
      const response = await fetch("/api/posts/bulk-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postIds: selectedPosts
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to schedule posts")
      }

      const data = await response.json()

      alert(`✅ Successfully scheduled ${data.scheduled} out of ${selectedPosts.length} posts!\n\n${data.errors.length > 0 ? `Errors:\n${data.errors.join('\n')}` : ''}`)

      setSelectedPosts([])
      await fetchPosts(true)
    } catch (error: any) {
      console.error("Bulk schedule error:", error)
      alert(`❌ Failed to schedule posts: ${error.message}`)
    } finally {
      setBulkScheduling(false)
    }
  }

  const stats = React.useMemo(() => {
    const calculated = {
      totalPosts: posts.length,
      pendingApproval: posts.filter(p => p.approval_status === "pending" && p.content_processed && !p.is_draft).length,
      drafts: posts.filter(p => p.is_draft === true).length,
      approved: posts.filter(p => p.approval_status === "approved" && !p.late_post_id && !p.late_scheduled_for && !p.is_draft).length,
      scheduled: lateScheduledPosts.length + posts.filter(p => p.approval_status === "approved" && p.late_scheduled_for && !p.late_published_at && !p.late_post_id).length,
      published: latePublishedPosts.length,
      rejected: posts.filter(p => p.approval_status === "rejected").length
    }
    console.log("📊 Stats calculated:", calculated)
    return calculated
  }, [posts, lateScheduledPosts, latePublishedPosts])

  const handleRowSelectionChange = useCallback((selectedRows: Record<string, boolean>) => {
    const selectedIds = Object.keys(selectedRows)
      .filter(key => selectedRows[key])
      .map(key => filteredPosts[parseInt(key)].id)
    setSelectedPosts(selectedIds)
  }, [filteredPosts])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
      <DashboardHeader 
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onRefresh={() => fetchPosts(true)}
        onCreatePost={() => setCreateModalOpen(true)}
        loading={loading}
      />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Overview - Now acts as tab selector */}
        <div className="mb-6 md:mb-8">
          <StatsOverview
            totalPosts={stats.totalPosts}
            readyToPost={stats.pendingApproval}
            drafts={stats.drafts}
            approved={stats.approved}
            scheduled={stats.scheduled}
            published={stats.published}
            rejected={stats.rejected}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Filters - Only show for card view, but without search */}
        {viewMode === "card" && (
          <div className="mb-4 md:mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Posts</option>
                <option value="ready">Ready to Post</option>
                <option value="processing">Processing</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">By Title</option>
              </select>
            </div>
          </div>
        )}

        {/* Content */}
        {viewMode === "card" ? (
          loading ? (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <PostCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <EmptyState
              title="No posts found"
              description="Try adjusting your filters or wait for the bot to discover new content"
            />
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onView={setSelectedPost}
                  onDelete={handleDelete}
                  onRefresh={fetchPosts}
                />
              ))}
            </div>
          )
        ) : (
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 sm:p-4 md:p-6 overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                  <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-t-blue-500 border-r-purple-500 border-b-pink-500 border-l-transparent animate-spin"></div>
                </div>
              </div>
            ) : (
              <DataTable
                columns={createColumns(
                  (draftId) => setEditingDraftId(draftId),
                  (postId) => setEditingPostId(postId),
                  fetchPosts,
                  (post) => setSelectedPost(post),
                  activeTab === "approved" // Show checkboxes only in approved tab
                )}
                data={filteredPosts}
                storageKey={activeTab} // Use activeTab as storage key for per-tab column settings
                onRowSelectionChange={handleRowSelectionChange}
                headerActions={
                  activeTab === "approved" ? (
                    <>
                      {selectedPosts.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPosts([])}
                          disabled={bulkScheduling}
                        >
                          Clear Selection
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={handleBulkSchedule}
                        disabled={bulkScheduling || selectedPosts.length === 0}
                        className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {bulkScheduling ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Scheduling...
                          </>
                        ) : (
                          <>
                            <CalendarPlus className="h-4 w-4 mr-2" />
                            Bulk Schedule {selectedPosts.length > 0 ? `(${selectedPosts.length})` : ''}
                          </>
                        )}
                      </Button>
                    </>
                  ) : null
                }
              />
            )}
          </div>
        )}

        {/* Post Detail Modal */}
        <PostDetailModal
          post={selectedPost}
          open={!!selectedPost}
          onOpenChange={(open) => !open && setSelectedPost(null)}
          onEdit={(post) => {
            setEditingPostId(post.id)
            setSelectedPost(null)
          }}
          onApprovalChange={fetchPosts}
        />

        {/* Create/Edit Post Modal */}
        <CreatePostModal
          open={createModalOpen || !!editingPostId || !!editingDraftId}
          onOpenChange={(open) => {
            if (!open) {
              setCreateModalOpen(false)
              setEditingPostId(null)
              setEditingDraftId(null)
            }
          }}
          onPostCreated={() => {
            fetchPosts()
            setEditingPostId(null)
            setEditingDraftId(null)
          }}
          postId={editingPostId || undefined}
          draftId={editingDraftId || undefined}
        />
      </div>
    </div>
  )
}
