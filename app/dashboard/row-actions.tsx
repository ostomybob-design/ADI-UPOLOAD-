"use client";

import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Share2, Trash, Edit, FileEdit } from "lucide-react";
import { SearchResult } from "./columns";
import { useState } from "react";

interface RowActionsProps {
  row: Row<SearchResult>;
  onEditDraft?: (draftId: string) => void;
  onEditPost?: (postId: number) => void;
  onRefresh?: () => void;
  onViewPost?: (post: SearchResult) => void;
}

export function RowActions({ row, onEditDraft, onEditPost, onRefresh, onViewPost }: RowActionsProps) {
  const isDraft = row.original.is_draft;
  const isRejected = row.original.approval_status === "rejected";
  const draftId = isDraft ? row.original.url.replace("draft://", "") : null;
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMovingToDrafts, setIsMovingToDrafts] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      // Handle draft deletion (localStorage)
      if (isDraft && draftId) {
        const { draftUtils } = await import("@/lib/draft-utils");
        const success = draftUtils.deleteDraft(draftId);
        if (success) {
          alert("✅ Draft deleted successfully");
          if (onRefresh) {
            onRefresh();
          } else {
            window.location.reload();
          }
        } else {
          throw new Error("Failed to delete draft from localStorage");
        }
      } else {
        // Handle database post deletion
        const response = await fetch(
          `/api/search-results/${row.original.id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete post");
        }

        if (onRefresh) {
          onRefresh();
        } else {
          window.location.reload();
        }
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    const post = row.original;

    // Check if post is published
    if (post.late_published_at) {
      alert("❌ Published posts cannot be edited from the dashboard.\n\nPublished posts are locked and cannot be modified.");
      return;
    }

    // For scheduled posts, we'll allow editing but it will update via Late.dev API
    if (isDraft && draftId) {
      onEditDraft?.(draftId);
    } else {
      onEditPost?.(row.original.id);
    }
  };

  const handleMoveToDrafts = async () => {
    if (!confirm("Move this post back to drafts?")) {
      return;
    }

    setIsMovingToDrafts(true);
    try {
      const response = await fetch("/api/posts/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: row.original.id,
          is_draft: true,
          approval_status: "pending",
          rejection_reason: null
        })
      });

      if (response.ok) {
        alert("✅ Post moved to drafts");
        onRefresh?.();
      } else {
        alert("Failed to move post to drafts. Please try again.");
      }
    } catch (error) {
      console.error("Error moving to drafts:", error);
      alert("Failed to move post to drafts. Please try again.");
    } finally {
      setIsMovingToDrafts(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          disabled={isDeleting}
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white border border-gray-200">
        <DropdownMenuItem
          onClick={() => onViewPost?.(row.original)}
          className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
        >
          <Eye className="mr-2 h-4 w-4" />
          View Post
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleEdit}
          className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Post
        </DropdownMenuItem>
        {isRejected && (
          <DropdownMenuItem
            onClick={handleMoveToDrafts}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            disabled={isMovingToDrafts}
          >
            <FileEdit className="mr-2 h-4 w-4" />
            {isMovingToDrafts ? "Moving..." : "Move to Drafts"}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => window.open(row.original.url, "_blank")}
          className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
        >
          <Eye className="mr-2 h-4 w-4" />
          View Original
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          disabled={isDeleting}
        >
          <Trash className="mr-2 h-4 w-4" />
          {isDeleting ? "Deleting..." : "Delete Post"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
