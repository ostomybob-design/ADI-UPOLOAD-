import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Calendar, ExternalLink, Loader2, ArrowLeft, ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RowActions } from "./row-actions";
import { ColumnHeader } from "./column-header";
import { useState } from "react";
import { SetScheduleModal } from "@/components/set-schedule-modal";
import { SchedulePostModal } from "@/components/schedule-post-modal";
import { getProxiedImageUrl } from "@/lib/image-proxy";

export type DraftPost = {
  id: string;
  imageVideo: File | null;
  imagePreview: string | null;
  caption: string;
  hashtags: string;
  schedulePost: boolean;
  scheduledDate: string | null;
  postOnInstagram: boolean;
  postOnFacebook: boolean;
  created_at: string;
  updated_at: string;
  additionalImages?: string[];
  // Text overlay settings
  overlayText?: string;
  textPosition?: { x: number; y: number };
  fontSize?: number;
  textColor?: string;
  fontFamily?: string;
  shadowIntensity?: number;
  textBgEnabled?: boolean;
  textBgColor?: string;
  textBgOpacity?: number;
  textStrokeEnabled?: boolean;
  textStrokeColor?: string;
  textStrokeWidth?: number;
  backdropBlurEnabled?: boolean;
  backdropBlurAmount?: number;
};

export type SearchResult = {
  id: number;
  title: string;
  url: string;
  snippet: string | null;
  position: number | null;
  date: string | null;
  search_query: string | null;
  raw_data: any;
  created_at: string;
  updated_at: string;
  html_content: string | null;
  content_extraction_date: string | null;
  ai_caption: string | null;
  ai_hashtags: string | string[] | null;
  ai_summary: string | null;
  content_processed: boolean | null;
  main_image_url: string | null;
  additional_images: string[] | null;
  is_draft?: boolean;
  approval_status?: string | null;
  approved_at?: string | null;
  approved_by?: string | null;
  is_edited?: boolean | null;
  rejection_reason?: string | null;

  // Late.dev fields - these are the actual fields in the database
  late_post_id?: string | null;
  late_scheduled_for?: string | null;
  late_published_at?: string | null;
  late_platforms?: any;
  late_status?: string | null;
  late_error_message?: string | null;

  // Legacy fields
  posted_on_instagram?: boolean;
  posted_on_facebook?: boolean;
  instagram_posted_at?: string | null;
  facebook_posted_at?: string | null;
};

const ApprovalActions = ({ row, onRefresh }: { row: any; onRefresh?: () => void }) => {
  const post = row.original;
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isSendingToPending, setIsSendingToPending] = useState(false);
  const [isUnscheduling, setIsUnscheduling] = useState(false);
  const [isMovingToReadyToPost, setIsMovingToReadyToPost] = useState(false);
  const [isMovingBackward, setIsMovingBackward] = useState(false);
  const [showSetScheduleModal, setShowSetScheduleModal] = useState(false);
  const [showSchedulePostModal, setShowSchedulePostModal] = useState(false);

  const handleMoveToDrafts = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Move this post back to Drafts?")) return;

    setIsMovingBackward(true);
    try {
      const response = await fetch("/api/posts/edit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.id,
          updates: {
            is_draft: true,
            approval_status: "pending"
          }
        })
      });

      if (response.ok) {
        alert("✅ Post moved to Drafts");
        onRefresh?.();
      } else {
        alert("Failed to move post. Please try again.");
      }
    } catch (error) {
      console.error("Move to drafts error:", error);
      alert("Failed to move post. Please try again.");
    } finally {
      setIsMovingBackward(false);
    }
  };

  const handleMoveToReadyToPost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMovingToReadyToPost(true);
    try {
      // Check if this is a localStorage draft
      const isDraft = post.url?.startsWith("draft://");
      const draftId = isDraft ? post.url.replace("draft://", "") : null;

      if (isDraft && draftId) {
        // For localStorage drafts, we need to delete from localStorage and create a database post
        const { draftUtils } = await import("@/lib/draft-utils");
        const draft = draftUtils.getDraft(draftId);
        
        if (!draft) {
          alert("Draft not found. Please refresh the page.");
          return;
        }

        // Upload the image to Supabase first
        let mainImageUrl = draft.imagePreview;
        if (draft.imagePreview && draft.imagePreview.startsWith('data:')) {
          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              file: draft.imagePreview,
              folder: "posts"
            }),
          });

          if (!uploadResponse.ok) {
            throw new Error("Failed to upload image");
          }

          const uploadResult = await uploadResponse.json();
          mainImageUrl = uploadResult.publicUrl;
        }

        // Create database post using /api/posts
        const createResponse = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageVideo: mainImageUrl,
            caption: draft.caption,
            hashtags: draft.hashtags,
            schedulePost: draft.schedulePost || false,
            scheduledDate: draft.scheduledDate || null,
            postOnInstagram: draft.postOnInstagram || false,
            postOnFacebook: draft.postOnFacebook || false,
            rawData: draft.overlayText ? {
              textOverlay: {
                text: draft.overlayText,
                position: draft.textPosition,
                fontSize: draft.fontSize,
                color: draft.textColor,
                fontFamily: draft.fontFamily,
                shadowIntensity: draft.shadowIntensity,
                bgEnabled: draft.textBgEnabled,
                bgColor: draft.textBgColor,
                bgOpacity: draft.textBgOpacity,
                strokeEnabled: draft.textStrokeEnabled,
                strokeColor: draft.textStrokeColor,
                strokeWidth: draft.textStrokeWidth,
                backdropBlurEnabled: draft.backdropBlurEnabled,
                backdropBlurAmount: draft.backdropBlurAmount,
              }
            } : {}
          })
        });

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          console.error("Failed to create post:", errorText);
          throw new Error("Failed to create post");
        }

        // Delete the draft from localStorage
        draftUtils.deleteDraft(draftId);
        
        alert("✅ Draft moved to Ready to Post");
        onRefresh?.();
      } else {
        // For database posts, just update the status
        const response = await fetch("/api/posts/edit", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postId: post.id,
            updates: {
              is_draft: false,
              approval_status: "pending"
            }
          })
        });

        if (response.ok) {
          alert("✅ Post moved to Ready to Post");
          onRefresh?.();
        } else {
          alert("Failed to move post. Please try again.");
        }
      }
    } catch (error) {
      console.error("Move to ready error:", error);
      alert("Failed to move post. Please try again.");
    } finally {
      setIsMovingToReadyToPost(false);
    }
  };

  const handleApprove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Validation checks
    const warnings: string[] = [];
    const errors: string[] = [];
    
    console.log("🔍 Approval validation - Post data:", {
      id: post.id,
      ai_caption: post.ai_caption,
      main_image_url: post.main_image_url,
      ai_hashtags: post.ai_hashtags
    });
    
    // Check for body/caption (required)
    if (!post.ai_caption || post.ai_caption.trim() === "") {
      errors.push("❌ Body/Caption is required");
    }
    
    // Check for image (optional but warn)
    if (!post.main_image_url) {
      warnings.push("⚠️ No image attached");
    } else {
      // If there is an image URL, verify it's accessible
      try {
        const imageCheckResponse = await fetch(`/api/proxy-image?url=${encodeURIComponent(post.main_image_url)}`);
        
        if (!imageCheckResponse.ok) {
          warnings.push(`⚠️ Image failed to load (${imageCheckResponse.status} error)`);
          console.warn("Image proxy check failed:", imageCheckResponse.status, post.main_image_url);
        }
      } catch (error) {
        warnings.push("⚠️ Image failed to load (network error)");
        console.warn("Image verification error:", error);
      }
    }
    
    // Check for hashtags (optional but warn)
    if (!post.ai_hashtags || 
        (typeof post.ai_hashtags === 'string' && post.ai_hashtags.trim() === "") ||
        (Array.isArray(post.ai_hashtags) && post.ai_hashtags.length === 0)) {
      warnings.push("⚠️ No hashtags added");
    }
    
    console.log("🔍 Validation results:", { errors, warnings });
    
    // If there are errors, block approval
    if (errors.length > 0) {
      alert(errors.join("\n") + "\n\nPost cannot be approved without a body/caption.");
      return;
    }
    
    // If there are warnings, ask for confirmation
    if (warnings.length > 0) {
      const warningMessage = warnings.join("\n") + "\n\nDo you want to approve this post anyway?";
      if (!confirm(warningMessage)) {
        return;
      }
    }
    
    setIsApproving(true);
    try {
      const response = await fetch("/api/posts/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postIds: [post.id],
          approvedBy: "admin",
          autoSchedule: false
        })
      });

      if (response.ok) {
        alert("✅ Post approved");
        onRefresh?.();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to approve post. Please try again.");
      }
    } catch (error) {
      console.error("Approval error:", error);
      alert((error as Error).message || "Failed to approve post. Please try again.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if this is a localStorage draft
    const isDraft = post.url?.startsWith("draft://");
    const draftId = isDraft ? post.url.replace("draft://", "") : null;

    const reason = prompt("Rejection reason (optional):");
    if (reason === null) return;

    setIsRejecting(true);
    try {
      if (isDraft && draftId) {
        // For localStorage drafts, convert to database post with rejected status
        const { draftUtils } = await import("@/lib/draft-utils");
        const draft = draftUtils.getDraft(draftId);
        
        if (!draft) {
          alert("Draft not found. Please refresh the page.");
          return;
        }

        // Upload the image to Supabase first
        let mainImageUrl = draft.imagePreview;
        if (draft.imagePreview && draft.imagePreview.startsWith('data:')) {
          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              file: draft.imagePreview,
              folder: "posts"
            }),
          });

          if (!uploadResponse.ok) {
            throw new Error("Failed to upload image");
          }

          const uploadResult = await uploadResponse.json();
          mainImageUrl = uploadResult.publicUrl;
        }

        // Create database post with rejected status
        const createResponse = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageVideo: mainImageUrl,
            caption: draft.caption,
            hashtags: draft.hashtags,
            schedulePost: draft.schedulePost || false,
            scheduledDate: draft.scheduledDate || null,
            postOnInstagram: draft.postOnInstagram || false,
            postOnFacebook: draft.postOnFacebook || false,
            rawData: draft.overlayText ? {
              textOverlay: {
                text: draft.overlayText,
                position: draft.textPosition,
                fontSize: draft.fontSize,
                color: draft.textColor,
                fontFamily: draft.fontFamily,
                shadowIntensity: draft.shadowIntensity,
                bgEnabled: draft.textBgEnabled,
                bgColor: draft.textBgColor,
                bgOpacity: draft.textBgOpacity,
                strokeEnabled: draft.textStrokeEnabled,
                strokeColor: draft.textStrokeColor,
                strokeWidth: draft.textStrokeWidth,
                backdropBlurEnabled: draft.backdropBlurEnabled,
                backdropBlurAmount: draft.backdropBlurAmount,
              }
            } : {}
          })
        });

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          console.error("Failed to create post:", errorText);
          throw new Error("Failed to create post");
        }

        const newPost = await createResponse.json();

        // Now reject the newly created post
        const rejectResponse = await fetch("/api/posts/reject", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postId: newPost.id,
            reason: reason || "Rejected from drafts"
          })
        });

        if (!rejectResponse.ok) {
          throw new Error("Failed to reject post");
        }

        // Delete the draft from localStorage
        draftUtils.deleteDraft(draftId);
        
        alert("✅ Draft rejected and moved to Rejected tab");
        onRefresh?.();
      } else {
        // For database posts, use the reject API
        const response = await fetch("/api/posts/reject", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postId: post.id,
            reason: reason || "Rejected from dashboard"
          })
        });

        if (response.ok) {
          alert("✅ Post rejected");
          onRefresh?.();
        } else {
          alert("Failed to reject post. Please try again.");
        }
      }
    } catch (error) {
      console.error("Rejection error:", error);
      alert("Failed to reject post. Please try again.");
    } finally {
      setIsRejecting(false);
    }
  };

  const handleSendToPending = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Send this post back to pending?")) return;

    setIsSendingToPending(true);
    try {
      const response = await fetch("/api/posts/send-to-pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id })
      });

      if (response.ok) {
        alert("✅ Post sent back to pending");
        onRefresh?.();
      }
    } catch (error) {
      console.error("Send to pending error:", error);
      alert("Failed to send post to pending. Please try again.");
    } finally {
      setIsSendingToPending(false);
    }
  };

  const handleUnschedule = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Different confirmation message for Late.dev-only posts vs posts with local records
    const confirmMessage = post.id === -1
      ? "Delete this post? This post was created in Late.dev (not in this dashboard), so it cannot be moved to approved and will be permanently deleted from Late.dev."
      : "Unschedule this post? It will be deleted from Late.dev and moved back to approved.";
    
    if (!confirm(confirmMessage)) return;

    setIsUnscheduling(true);
    try {
      // Use late_post_id if available (for scheduled posts), otherwise use database id
      const idToUse = post.late_post_id || post.id;
      
      const response = await fetch("/api/posts/unschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: idToUse })
      });

      if (response.ok) {
        const successMessage = post.id === -1
          ? "✅ Post permanently deleted from Late.dev"
          : "✅ Post unscheduled and moved back to approved";
        alert(successMessage);
        onRefresh?.();
      } else {
        const data = await response.json();
        alert(`❌ Failed to unschedule: ${data.error}`);
      }
    } catch (error) {
      console.error("Unschedule error:", error);
      alert("Failed to unschedule post. Please try again.");
    } finally {
      setIsUnscheduling(false);
    }
  };

  // Draft posts: Show "Move to Ready to Post" button
  if (post.is_draft) {
    return (
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleMoveToReadyToPost}
          disabled={isMovingToReadyToPost}
          className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50 disabled:opacity-50"
          title="Move to Ready to Post"
        >
          {isMovingToReadyToPost ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleReject}
          disabled={isMovingToReadyToPost || isRejecting}
          className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
          title="Reject"
        >
          {isRejecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }

  // Pending tab (Ready to Post): Show back arrow, approve and reject buttons
  if (post.approval_status === "pending" && post.ai_caption) {
    return (
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleMoveToDrafts}
          disabled={isMovingBackward || isApproving || isRejecting}
          className="h-7 px-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          title="Move back to Drafts"
        >
          {isMovingBackward ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowLeft className="h-4 w-4" />
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleApprove}
          disabled={isMovingBackward || isApproving || isRejecting}
          className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50 disabled:opacity-50"
          title="Approve"
        >
          {isApproving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleReject}
          disabled={isMovingBackward || isApproving || isRejecting}
          className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
          title="Reject"
        >
          {isRejecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }

  // Approved tab: Show back arrow, set schedule, send to pending and reject buttons
  if (post.approval_status === "approved" && !post.late_post_id) {
    return (
      <>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSendToPending}
            disabled={isMovingBackward || isSendingToPending || isRejecting}
            className="h-7 px-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            title="Move back to Ready to Post"
          >
            {isSendingToPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowLeft className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setShowSetScheduleModal(true);
            }}
            disabled={isMovingBackward || isSendingToPending || isRejecting}
            className="h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50"
            title="Set schedule date"
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setShowSchedulePostModal(true);
            }}
            disabled={isMovingBackward || isSendingToPending || isRejecting}
            className="h-7 px-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 disabled:opacity-50"
            title="Schedule to queue"
          >
            <ListPlus className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleReject}
            disabled={isMovingBackward || isSendingToPending || isRejecting}
            className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
            title="Reject"
          >
            {isRejecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
          </Button>
        </div>
        <SetScheduleModal
          open={showSetScheduleModal}
          onOpenChange={setShowSetScheduleModal}
          postId={post.id}
          postTitle={post.title}
          onScheduled={onRefresh}
        />
        <SchedulePostModal
          open={showSchedulePostModal}
          onOpenChange={setShowSchedulePostModal}
          postId={post.id}
          postTitle={post.title}
          onScheduled={onRefresh}
        />
      </>
    );
  }

  // Scheduled tab: Show back arrow to unschedule (for both Late.dev and database-only scheduled posts)
  if (post.late_scheduled_for && !post.late_published_at) {
    return (
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleUnschedule}
          disabled={isUnscheduling}
          className="h-7 px-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          title={post.id === -1 ? "Delete permanently (created in Late.dev)" : "Unschedule and move back to Approved"}
        >
          {isUnscheduling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }

  return null;
};

export const createColumns = (
  onEditDraft?: (draftId: string) => void,
  onEditPost?: (postId: number) => void,
  onRefresh?: () => void,
  onViewPost?: (post: SearchResult) => void,
  showCheckbox?: boolean
): ColumnDef<SearchResult>[] => {
  const columns: ColumnDef<SearchResult>[] = [];

  // 0. Checkbox column (only for approved tab) - FIRST COLUMN
  if (showCheckbox) {
    columns.push({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    });
  }

  // 1. Three dots (Row Actions)
  columns.push({
    id: "actions",
    cell: ({ row }) => <RowActions row={row} onEditDraft={onEditDraft} onEditPost={onEditPost} onRefresh={onRefresh} onViewPost={onViewPost} />,
  });

  // 2. Approve/Disapprove Actions
  columns.push({
    id: "approval",
    header: "Actions",
    cell: ({ row }) => <ApprovalActions row={row} onRefresh={onRefresh} />,
  });

  // 3. Image
  columns.push({
    accessorKey: "main_image_url",
    header: ({ column }) => <ColumnHeader column={column} title="Image" />,
    cell: ({ row }) => {
      const imageUrl = row.getValue("main_image_url") as string;

      if (!imageUrl) {
        return (
          <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
            <span className="text-xs text-gray-400">No image</span>
          </div>
        );
      }

      // Use proxied URL to avoid CORS issues
      const proxiedUrl = getProxiedImageUrl(imageUrl) || imageUrl;

      return (
        <div className="w-10 h-10 rounded overflow-hidden bg-gray-100">
          <img
            src={proxiedUrl}
            alt="Thumbnail"
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = '<span class="text-xs text-gray-400 flex items-center justify-center h-full">Failed</span>';
              }
            }}
          />
        </div>
      );
    },
  },
    // 4. AI Caption
    {
      accessorKey: "ai_caption",
      header: ({ column }) => <ColumnHeader column={column} title="AI Caption" />,
      cell: ({ row }) => {
        const caption = row.getValue("ai_caption") as string;
        return caption ? (
          <div className="max-w-[300px] truncate text-gray-700">{caption}</div>
        ) : (
          <span className="text-xs text-gray-400">Not generated</span>
        );
      },
    },
    // 5. Hashtags
    {
      accessorKey: "ai_hashtags",
      header: ({ column }) => (
        <ColumnHeader column={column} title="Hashtags" />
      ),
      cell: ({ row }) => {
        const hashtags = row.getValue("ai_hashtags");
        if (!hashtags) return null;

        let formattedHashtags = '';

        if (Array.isArray(hashtags)) {
          formattedHashtags = hashtags
            .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
            .join(' ');
        } else if (typeof hashtags === 'string') {
          formattedHashtags = hashtags
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)
            .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
            .join(' ');
        } else {
          formattedHashtags = String(hashtags);
        }

        return (
          <div className="max-w-[200px] truncate text-indigo-600 text-xs">{formattedHashtags}</div>
        );
      },
    },
    // 6. Status
    {
      accessorKey: "approval_status",
      header: ({ column }) => <ColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const approvalStatus = row.getValue("approval_status") as string;
        const latePublishedAt = row.original.late_published_at;
        const lateScheduledFor = row.original.late_scheduled_for;
        const latePostId = row.original.late_post_id;
        const isEdited = row.original.is_edited;
        const isDraft = row.original.is_draft;

        // Determine late status based on actual fields
        let lateStatus = null;
        if (latePublishedAt) {
          lateStatus = "published";
        } else if (latePostId && lateScheduledFor) {
          lateStatus = "scheduled";
        }

        return (
          <div className="flex flex-col gap-1">
            <Badge
              variant={
                isDraft
                  ? "secondary"
                  : approvalStatus === "approved"
                  ? "default"
                  : approvalStatus === "rejected"
                    ? "destructive"
                    : "secondary"
              }
              className={
                isDraft
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : approvalStatus === "approved"
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : approvalStatus === "rejected"
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
              }
            >
              {isDraft ? "Draft" : (approvalStatus || "pending")}
            </Badge>
            {lateStatus && (
              <Badge
                variant="outline"
                className={
                  lateStatus === "published"
                    ? "text-xs bg-purple-50 text-purple-700 border-purple-200"
                    : lateStatus === "scheduled"
                      ? "text-xs bg-blue-50 text-blue-700 border-blue-200"
                      : "text-xs"
                }
              >
                {lateStatus}
              </Badge>
            )}
            {isEdited && (
              <Badge variant="outline" className="text-xs">
                Edited
              </Badge>
            )}
          </div>
        );
      },
    },
    // 7. Title
    {
      accessorKey: "title",
      header: ({ column }) => <ColumnHeader column={column} title="Title" />,
      cell: ({ row }) => {
        const title = row.getValue("title") as string;
        return (
          <div className="max-w-[500px] truncate font-semibold text-gray-800">
            {title}
          </div>
        );
      },
    },
    // 8. Scheduled For
    {
      accessorKey: "late_scheduled_for",
      header: ({ column }) => <ColumnHeader column={column} title="Scheduled For" />,
      cell: ({ row }) => {
        const scheduledFor = row.getValue("late_scheduled_for") as string;
        const publishedAt = row.original.late_published_at;
        const latePostId = row.original.late_post_id;

        // If published, show published date instead
        if (publishedAt) {
          return (
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-purple-500" />
              <div className="text-sm">
                <div className="font-medium text-purple-700">Published</div>
                <div className="text-xs text-gray-500">{new Date(publishedAt).toLocaleDateString()}</div>
                <div className="text-xs text-gray-500">{new Date(publishedAt).toLocaleTimeString()}</div>
              </div>
              {latePostId && (
                <a
                  href={`https://getlate.dev/posts/${latePostId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                  title="View on Late.dev"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          );
        }

        if (!scheduledFor) return <span className="text-xs text-gray-400">Not scheduled</span>;

        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-blue-500" />
            <div className="text-sm">
              <div className="font-medium">{new Date(scheduledFor).toLocaleDateString()}</div>
              <div className="text-xs text-gray-500">{new Date(scheduledFor).toLocaleTimeString()}</div>
            </div>
            {latePostId && (
              <a
                href={`https://getlate.dev/posts/${latePostId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
                title="View on Late.dev"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        );
      },
    },
    // 9. Platforms
    {
      accessorKey: "late_platforms",
      header: ({ column }) => <ColumnHeader column={column} title="Platforms" />,
      cell: ({ row }) => {
        const platforms = row.getValue("late_platforms") as any;

        if (!platforms || !Array.isArray(platforms)) {
          return <span className="text-xs text-gray-400">None</span>;
        }

        return (
          <div className="flex flex-wrap gap-1">
            {platforms.map((p: any, i: number) => (
              <Badge key={i} variant="secondary" className="text-xs capitalize">
                {p.platform || p}
              </Badge>
            ))}
          </div>
        );
      },
    },
    // 10. Source
    {
      accessorKey: "url",
      header: ({ column }) => <ColumnHeader column={column} title="Source" />,
      cell: ({ row }) => {
        const url = row.getValue("url") as string;
        return (
          <div className="max-w-[200px] truncate">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              <span className="truncate">View</span>
            </a>
          </div>
        );
      },
    },
    // 11. Date Added
    {
      accessorKey: "created_at",
      header: ({ column }) => <ColumnHeader column={column} title="Date Added" />,
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return (
          <div className="text-sm">
            <div className="font-medium text-gray-700">{date.toLocaleDateString()}</div>
            <div className="text-xs text-gray-500">{date.toLocaleTimeString()}</div>
          </div>
        );
      },
    },
    // 12. Date Last Edited
    {
      accessorKey: "updated_at",
      header: ({ column }) => <ColumnHeader column={column} title="Date Last Edited" />,
      cell: ({ row }) => {
        const date = new Date(row.getValue("updated_at"));
        const createdDate = new Date(row.getValue("created_at"));
        
        // Check if the post was actually edited (updated_at is different from created_at)
        const wasEdited = date.getTime() !== createdDate.getTime();
        
        return (
          <div className="text-sm">
            {wasEdited ? (
              <>
                <div className="font-medium text-gray-700">{date.toLocaleDateString()}</div>
                <div className="text-xs text-gray-500">{date.toLocaleTimeString()}</div>
              </>
            ) : (
              <span className="text-xs text-gray-400">Not edited</span>
            )}
          </div>
        );
      },
    }
  );

  return columns;
};

export const columns = createColumns();
