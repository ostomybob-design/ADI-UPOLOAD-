"use client";

import * as React from "react";
import {
  X,
  Image as ImageIcon,
  Calendar,
  Instagram,
  Facebook,
  Hash,
  Type,
  Upload,
  Eye,
  Send,
  Save,
  Clock,
  Sparkles
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { draftUtils } from "@/lib/draft-utils";
import { AIEditorSheet } from "@/components/ai-editor-sheet";
import { getProxiedImageUrl } from "@/lib/image-proxy";
import { 
  ResizableDialog as Dialog, 
  ResizableDialogContent as DialogContent,
  ResizableDialogHeader as DialogHeader,
  ResizableDialogTitle as DialogTitle,
  ResizableDialogDescription as DialogDescription,
  ResizableDialogFooter as DialogFooter
} from "@/components/ui/resizable-dialog";

// Component to handle individual additional image loading
function AdditionalImageThumbnail({
  imgUrl,
  index,
  onSetAsMain
}: {
  imgUrl: string;
  index: number;
  onSetAsMain: (url: string) => void;
}) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageFailed, setImageFailed] = React.useState(false);

  // Don't render if image failed to load
  if (imageFailed) {
    return null;
  }

  return (
    <div
      className="relative rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all group h-24"
      onClick={() => onSetAsMain(imgUrl)}
      style={{ display: imageLoaded ? 'block' : 'none' }}
    >
      <img
        src={getProxiedImageUrl(imgUrl) || imgUrl}
        alt={`Additional ${index + 1}`}
        className="w-full h-full object-cover block"
        style={{ display: 'block', minHeight: '96px' }}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageFailed(true)}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center pointer-events-none">
        <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity font-medium">
          Set as Main
        </span>
      </div>
    </div>
  );
}

export function CreatePostModal({
  open,
  onOpenChange,
  onPostCreated,
  draftId,
  postId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated?: () => void;
  draftId?: string;
  postId?: number;
}) {
  const [imageVideo, setImageVideo] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = React.useState<string[]>([]);
  const [caption, setCaption] = React.useState("");
  const [hashtags, setHashtags] = React.useState("");
  const [schedulePost, setSchedulePost] = React.useState(false);
  const [scheduledDate, setScheduledDate] = React.useState("");
  const [addToQueue, setAddToQueue] = React.useState(false);
  const [selectedProfileId, setSelectedProfileId] = React.useState<string>("");
  const [profiles, setProfiles] = React.useState<any[]>([]);
  const [postOnInstagram, setPostOnInstagram] = React.useState(true);
  const [postOnFacebook, setPostOnFacebook] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSavingDraft, setIsSavingDraft] = React.useState(false);
  const [currentDraftId, setCurrentDraftId] = React.useState<string | null>(draftId || null);
  const [connectedAccounts, setConnectedAccounts] = React.useState<any[]>([]);
  const [selectedInstagramAccount, setSelectedInstagramAccount] = React.useState<string>("");
  const [selectedFacebookAccount, setSelectedFacebookAccount] = React.useState<string>("");
  const [isLoadingAccounts, setIsLoadingAccounts] = React.useState(false);
  const [aiEditorOpen, setAiEditorOpen] = React.useState(false);
  const [latePostId, setLatePostId] = React.useState<string | null>(null);
  const [lateScheduledFor, setLateScheduledFor] = React.useState<string | null>(null);
  
  // Resizable columns state
  const [leftPanelWidth, setLeftPanelWidth] = React.useState(60); // percentage
  const [isResizingColumns, setIsResizingColumns] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  // Text overlay state
  const [overlayText, setOverlayText] = React.useState("");
  const [textPosition, setTextPosition] = React.useState({ x: 50, y: 50 }); // percentage-based
  const [fontSize, setFontSize] = React.useState(32);
  const [textColor, setTextColor] = React.useState("#FFFFFF");
  const [isDraggingText, setIsDraggingText] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const imagePreviewRef = React.useRef<HTMLDivElement>(null);

  // Fetch connected accounts and profiles on mount
  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoadingAccounts(true);
      try {
        // Fetch accounts
        const accountsResponse = await fetch("/api/late/accounts");
        if (accountsResponse.ok) {
          const accounts = await accountsResponse.json();
          setConnectedAccounts(accounts);

          // Auto-select first account of each platform
          const instagramAccount = accounts.find((acc: any) => acc.platform === "instagram");
          const facebookAccount = accounts.find((acc: any) => acc.platform === "facebook");

          if (instagramAccount) {
            setSelectedInstagramAccount(instagramAccount.id || instagramAccount._id);
            // Set profile ID from first account
            if (instagramAccount.profileId) {
              setSelectedProfileId(instagramAccount.profileId);
            }
          }
          if (facebookAccount) {
            setSelectedFacebookAccount(facebookAccount.id || facebookAccount._id);
            if (!selectedProfileId && facebookAccount.profileId) {
              setSelectedProfileId(facebookAccount.profileId);
            }
          }

          // Extract unique profiles
          const uniqueProfiles = Array.from(
            new Map(accounts.map((acc: any) => [acc.profileId, acc.profileId])).values()
          );
          setProfiles(uniqueProfiles.map(id => ({ id })));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoadingAccounts(false);
      }
    };

    if (open) {
      fetchData();
    } else {
      // Reset overlay text when modal closes
      setOverlayText("");
      setTextPosition({ x: 50, y: 50 });
    }
  }, [open]);

  // Column resize handlers
  const handleColumnResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingColumns(true);
  };

  React.useEffect(() => {
    if (!isResizingColumns) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Constrain between 30% and 70%
      const constrainedWidth = Math.min(Math.max(newLeftWidth, 30), 70);
      setLeftPanelWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsResizingColumns(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingColumns]);

  // Text dragging handler
  React.useEffect(() => {
    if (!isDraggingText) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!imagePreviewRef.current) return;
      
      const rect = imagePreviewRef.current.getBoundingClientRect();
      const newX = ((e.clientX - rect.left) / rect.width) * 100 - dragOffset.x;
      const newY = ((e.clientY - rect.top) / rect.height) * 100 - dragOffset.y;
      
      // Constrain to image boundaries
      const constrainedX = Math.min(Math.max(newX, 5), 95);
      const constrainedY = Math.min(Math.max(newY, 5), 95);
      
      setTextPosition({ x: constrainedX, y: constrainedY });
    };

    const handleMouseUp = () => {
      setIsDraggingText(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingText, dragOffset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageVideo(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      // Reset text overlay when new image is uploaded
      setOverlayText("");
      setTextPosition({ x: 50, y: 50 });
    }
  };

  const removeMedia = () => {
    setImageVideo(null);
    setImagePreview(null);
    setOverlayText("");
    setTextPosition({ x: 50, y: 50 });
  };

  // Function to apply text overlay to image and return data URL
  const applyTextOverlayToImage = async (): Promise<string | null> => {
    if (!imagePreview || !overlayText) return imagePreview;
    
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          console.warn("❌ Failed to get canvas context");
          resolve(imagePreview);
          return;
        }

        // Instagram's max landscape aspect ratio is 1.91:1
        // If image is wider than this, crop it to fit
        const maxAspectRatio = 1.91;
        const currentAspectRatio = img.width / img.height;
        
        let finalWidth = img.width;
        let finalHeight = img.height;
        let cropX = 0;
        let cropY = 0;
        
        if (currentAspectRatio > maxAspectRatio) {
          // Image is too wide, crop the width
          finalWidth = Math.floor(img.height * maxAspectRatio);
          cropX = Math.floor((img.width - finalWidth) / 2); // Center crop
          console.log(`📐 Cropping image for Instagram: ${img.width}×${img.height} (${currentAspectRatio.toFixed(2)}:1) → ${finalWidth}×${finalHeight} (${maxAspectRatio}:1)`);
        }
        
        canvas.width = finalWidth;
        canvas.height = finalHeight;

        // Draw cropped image
        ctx.drawImage(
          img,
          cropX, cropY, finalWidth, finalHeight, // Source crop area
          0, 0, finalWidth, finalHeight           // Destination
        );

        // Draw text overlay
        const x = (textPosition.x / 100) * canvas.width;
        const y = (textPosition.y / 100) * canvas.height;
        
        // Scale font size based on image size
        const scaledFontSize = (fontSize / 500) * Math.min(canvas.width, canvas.height);
        ctx.font = `bold ${scaledFontSize}px Arial, sans-serif`;
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add text shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillText(overlayText, x, y);

        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        console.log(`✅ Canvas created data URL, size: ${finalWidth}×${finalHeight}, length: ${dataUrl.length}`);
        resolve(dataUrl);
      };
      
      img.onerror = (error) => {
        console.error("❌ Image failed to load:", error);
        resolve(imagePreview);
      };
      
      // Use proxy for external URLs to avoid CORS issues
      const isExternalUrl = imagePreview.startsWith('http://') || imagePreview.startsWith('https://');
      if (isExternalUrl) {
        console.log("🔄 Using proxy for external image:", imagePreview);
        img.src = `/api/proxy-image?url=${encodeURIComponent(imagePreview)}`;
      } else {
        img.src = imagePreview;
      }
    });
  };

  const setAsMainImage = (imageUrl: string) => {
    if (!imagePreview) return;

    // Swap: current main becomes additional, selected additional becomes main
    const newAdditionalImages = additionalImages.filter(img => img !== imageUrl);
    newAdditionalImages.push(imagePreview);

    setImagePreview(imageUrl);
    setAdditionalImages(newAdditionalImages);
  };

  const parseHashtags = (text: string) => {
    return text.match(/#[\w\u00C0-\u017F]+/g) || [];
  };

  const formatCaption = (text: string) => {
    // First, convert newlines to <br> tags, then format hashtags
    return text
      .replace(/\n/g, '<br>')
      .replace(/#([\w\u00C0-\u017F]+)/g, '<span class="text-blue-500 font-medium">#$1</span>');
  };

  const getCharacterCount = () => {
    return caption.length + hashtags.length;
  };

  const isOverLimit = () => {
    return getCharacterCount() > 2200;
  };

  // Load draft data when modal opens with a draft ID
  React.useEffect(() => {
    if (open && currentDraftId) {
      const draft = draftUtils.getDraft(currentDraftId);
      if (draft) {
        setCaption(draft.caption);
        setHashtags(draft.hashtags);
        setSchedulePost(draft.schedulePost);
        setScheduledDate(draft.scheduledDate || "");
        setPostOnInstagram(draft.postOnInstagram);
        setPostOnFacebook(draft.postOnFacebook);
        setImagePreview(draft.imagePreview);
        // Note: We can't restore the File object, only the preview
      }
    }
  }, [open, currentDraftId]);

  // Load post data when modal opens with a post ID
  React.useEffect(() => {
    const fetchPost = async () => {
      if (open && postId) {
        // Handle Late.dev-only posts (id: -1)
        if (postId === -1) {
          alert("This post exists only in Late.dev and cannot be edited from the dashboard. Please edit it directly in Late.dev.");
          onOpenChange(false);
          return;
        }
        
        try {
          console.log("📥 Fetching post data for ID:", postId);
          const response = await fetch(`/api/posts/${postId}`);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Failed to fetch post. Status:", response.status);
            console.error("❌ Error response:", errorText);
            throw new Error(`Failed to fetch post: ${response.status}`);
          }

          const post = await response.json();
          console.log("✅ Post loaded successfully:", post);
          
          setCaption(post.ai_caption || "");

          // Convert hashtags array to string
          const hashtagsStr = Array.isArray(post.ai_hashtags)
            ? post.ai_hashtags.map((tag: string) => `#${tag}`).join(" ")
            : typeof post.ai_hashtags === "string"
              ? post.ai_hashtags
              : "";
          setHashtags(hashtagsStr);

          setPostOnInstagram(post.posted_on_instagram || false);
          setPostOnFacebook(post.posted_on_facebook || false);
          setImagePreview(post.main_image_url || null);

          // Parse additional_images - handle both JSON string and array
          let parsedAdditionalImages: string[] = [];
          if (post.additional_images) {
            console.log('Raw additional_images:', post.additional_images);
            console.log('Type:', typeof post.additional_images);
            if (typeof post.additional_images === 'string') {
              try {
                parsedAdditionalImages = JSON.parse(post.additional_images);
                console.log('Parsed additional_images:', parsedAdditionalImages);
              } catch (e) {
                console.error('Failed to parse additional_images:', e);
                parsedAdditionalImages = [];
              }
            } else if (Array.isArray(post.additional_images)) {
              parsedAdditionalImages = post.additional_images;
              console.log('1Additional_images is already an array:', parsedAdditionalImages);
            }
          }
          console.log('Setting additional images:', parsedAdditionalImages);
          setAdditionalImages(parsedAdditionalImages);

          // Load text overlay settings from raw_data if present
          if (post.raw_data && typeof post.raw_data === 'object') {
            const rawData = post.raw_data as any;
            if (rawData.textOverlay) {
              setOverlayText(rawData.textOverlay.text || "");
              setTextPosition(rawData.textOverlay.position || { x: 50, y: 50 });
              setFontSize(rawData.textOverlay.fontSize || 32);
              setTextColor(rawData.textOverlay.color || "#FFFFFF");
            }
          }

          // Handle scheduled dates
          if (post.instagram_posted_at || post.facebook_posted_at) {
            const date = post.instagram_posted_at || post.facebook_posted_at;
            const futureDate = new Date(date) > new Date();
            setSchedulePost(futureDate);
            if (futureDate) {
              setScheduledDate(new Date(date).toISOString().slice(0, 16));
            }
          }

          // Set Late.dev data
          setLatePostId(post.late_post_id || null);
          setLateScheduledFor(post.late_scheduled_for || null);
        } catch (error) {
          console.error("Error fetching post:", error);
          alert("Failed to load post data");
        }
      }
    };

    fetchPost();
  }, [open, postId]);

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      // If editing an existing post (postId exists), update the database
      if (postId) {
        console.log("💾 Saving changes to existing post:", postId);

        // Convert hashtags string to array
        const hashtagsArray = hashtags
          .split(/\s+/)
          .filter(tag => tag.startsWith("#"))
          .map(tag => tag.replace("#", "").trim());

        // Prepare updates - use imagePreview as the main image URL
        const updates: any = {
          ai_caption: caption,
          ai_hashtags: hashtagsArray,
          main_image_url: imagePreview, // This is the swapped main image
          additional_images: additionalImages, // This is the updated array
          posted_on_instagram: postOnInstagram,
          posted_on_facebook: postOnFacebook,
        };

        console.log("📤 Updating database with:", updates);

        // Update the post in database
        const updateResponse = await fetch("/api/posts/edit", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postId: postId,
            updates
          })
        });

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          console.error("❌ Database update failed:", errorText);
          throw new Error("Failed to update post");
        }

        const updatedPost = await updateResponse.json();
        console.log("✅ Post updated in database:", updatedPost);

        alert("Changes saved successfully! 💾");

        // Refresh parent component
        if (onPostCreated) {
          onPostCreated();
        }

        // Close modal
        onOpenChange(false);
      } else {
        // Save as draft to localStorage (for new posts)
        const draftData = {
          imageVideo,
          imagePreview,
          caption,
          hashtags,
          schedulePost,
          scheduledDate,
          postOnInstagram,
          postOnFacebook,
        };

        let savedDraftId: string;
        if (currentDraftId) {
          // Update existing draft
          const success = draftUtils.updateDraft(currentDraftId, draftData);
          if (success) {
            savedDraftId = currentDraftId;
          } else {
            throw new Error("Failed to update draft");
          }
        } else {
          // Create new draft
          savedDraftId = draftUtils.saveDraft(draftData);
          if (!savedDraftId) {
            throw new Error("Failed to save draft");
          }
          setCurrentDraftId(savedDraftId);
        }

        alert("Draft saved successfully! 💾");

        // Refresh data to show the draft in the table
        if (onPostCreated) {
          onPostCreated();
        }
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handlePost = async () => {
    setIsLoading(true);
    try {
      // Apply text overlay to image if needed
      let finalImagePreview = imagePreview;
      
      console.log("🔍 Text overlay check:");
      console.log("  - overlayText:", overlayText);
      console.log("  - imagePreview exists:", !!imagePreview);
      console.log("  - imagePreview type:", imagePreview?.substring(0, 50));
      console.log("  - imageVideo:", imageVideo);
      console.log("  - imageVideo type:", imageVideo?.type);
      
      if (overlayText && imagePreview && !imageVideo?.type.startsWith('video/')) {
        console.log("🎨 Applying text overlay to image...");
        console.log("Overlay text:", overlayText);
        console.log("Original image preview length:", imagePreview?.length);
        const imageWithText = await applyTextOverlayToImage();
        if (imageWithText) {
          finalImagePreview = imageWithText;
          console.log("✅ Text applied! New image preview length:", finalImagePreview?.length);
          console.log("Final image preview starts with:", finalImagePreview?.substring(0, 50));
        } else {
          console.warn("⚠️ applyTextOverlayToImage returned null/undefined");
        }
      } else {
        console.log("⏭️ Skipping text overlay - Reasons:");
        console.log("  - No overlay text:", !overlayText);
        console.log("  - No image preview:", !imagePreview);
        console.log("  - Is video:", imageVideo?.type?.startsWith('video/'));
      }

      // If editing an existing post, just update the database
      if (postId) {
        console.log("🔧 Editing post:", postId);
        console.log("📅 Schedule settings:", { schedulePost, scheduledDate });

        // Upload media to Supabase if there's a new image OR if text overlay was applied
        let mediaUrl: string | null = null;

        // Always upload if we have a data URL (new upload or text overlay applied)
        if (finalImagePreview && finalImagePreview.startsWith('data:')) {
          try {
            console.log("📤 Uploading media to Supabase...");
            console.log("Has text overlay:", !!overlayText);
            const uploadResponse = await fetch("/api/upload", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                file: finalImagePreview,
                folder: "posts"
              }),
            });

            if (!uploadResponse.ok) {
              const errorText = await uploadResponse.text();
              console.error("❌ Upload failed. Status:", uploadResponse.status);
              console.error("❌ Error response:", errorText);
              throw new Error(`Failed to upload media to Supabase: ${uploadResponse.status} - ${errorText}`);
            }

            const uploadResult = await uploadResponse.json();
            mediaUrl = uploadResult.publicUrl;
            console.log("✅ Media uploaded successfully:", mediaUrl);
          } catch (uploadError) {
            console.error("❌ Error uploading media:", uploadError);
            alert(`Failed to upload media: ${(uploadError as Error).message}. Please try again.`);
            setIsLoading(false);
            return;
          }
        } else if (finalImagePreview) {
          // Use existing URL
          mediaUrl = finalImagePreview;
          console.log("Using existing media URL:", mediaUrl);
        }

        // Convert hashtags string to array
        const hashtagsArray = hashtags
          .split(/\s+/)
          .filter(tag => tag.startsWith("#"))
          .map(tag => tag.replace("#", "").trim());

        // Prepare raw_data with text overlay settings
        const rawData: any = {};
        if (overlayText) {
          rawData.textOverlay = {
            text: overlayText,
            position: textPosition,
            fontSize: fontSize,
            color: textColor
          };
        }

        // Prepare updates object
        const updates: any = {
          ai_caption: caption,
          ai_hashtags: hashtagsArray,
          main_image_url: mediaUrl,
          additional_images: additionalImages,
          posted_on_instagram: postOnInstagram,
          posted_on_facebook: postOnFacebook,
          raw_data: rawData,
        };
        
        console.log("📝 Updates object:", {
          ...updates,
          main_image_url: mediaUrl,
          has_text_overlay: !!overlayText,
          text_overlay_data: rawData
        });

        // Handle Late.dev post updates
        if (latePostId) {
          // If post already exists on Late.dev, update it
          console.log("🔄 Updating existing Late.dev post:", latePostId);
          try {
            // Check if caption already contains the hashtags to avoid duplication
            const captionHasHashtags = hashtags && caption.includes(hashtags.trim());
            const fullContent = hashtags && !captionHasHashtags ? `${caption}\n\n${hashtags}` : caption;

            const updateData: any = {
              content: fullContent,
            };

            // Update media if we have a new URL (with text overlay)
            if (mediaUrl) {
              updateData.media = [mediaUrl];
              console.log("📸 Updating media with new image (with text overlay):", mediaUrl);
            }

            // Only update schedule if it's being changed
            if (schedulePost && scheduledDate && scheduledDate !== lateScheduledFor) {
              updateData.scheduledFor = new Date(scheduledDate).toISOString();
              updates.late_scheduled_for = new Date(scheduledDate);
            }

            console.log("Updating Late.dev post with:", updateData);

            const lateUpdateResponse = await fetch(`/api/late/posts/${latePostId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updateData),
            });

            if (!lateUpdateResponse.ok) {
              const errorData = await lateUpdateResponse.json();
              console.warn("⚠️ Failed to update Late.dev post:", errorData);
              // Don't fail the whole operation, just warn
            } else {
              console.log("✅ Late.dev post updated successfully");
            }
          } catch (lateError: any) {
            console.warn("⚠️ Late.dev update error (non-critical):", lateError);
            // Don't fail the whole operation
          }
        } else if (schedulePost && scheduledDate) {
          // If scheduling a new post to Late.dev
          console.log("📅 Scheduling post to Late.dev...");
          console.log("📸 mediaUrl value before scheduling:", mediaUrl);
          console.log("📸 finalImagePreview type:", finalImagePreview ? finalImagePreview.substring(0, 50) : 'null');
          try {
            // Get connected accounts
            console.log("🔍 Fetching Late.dev accounts...");
            const accountsResponse = await fetch("/api/late/accounts");
            if (!accountsResponse.ok) {
              throw new Error("Failed to fetch accounts");
            }
            const accounts = await accountsResponse.json();

            if (accounts.length === 0) {
              alert("No connected accounts found. Please connect accounts in Late.dev.");
              setIsLoading(false);
              return;
            }

            const profileId = accounts[0].profileId;

            // Prepare content with hashtags
            // Check if caption already contains the hashtags to avoid duplication
            const captionHasHashtags = hashtags && caption.includes(hashtags.trim());
            const fullContent = hashtags && !captionHasHashtags ? `${caption}\n\n${hashtags}` : caption;

            // Prepare platforms
            const platforms = accounts.map((acc: any) => ({
              platform: acc.platform as "instagram" | "facebook" | "linkedin" | "twitter" | "threads" | "tiktok" | "youtube" | "pinterest" | "reddit" | "bluesky",
              accountId: acc.id || acc._id,
              platformSpecificData:
                acc.platform === "instagram"
                  ? { contentType: "post" as const }
                  : undefined,
            }));

            // Prepare media items
            const mediaItems: any[] = [];
            if (mediaUrl) {
              console.log("📸 Checking mediaUrl for scheduling:", mediaUrl);
              const isValidUrl = mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://');
              console.log("Is valid URL:", isValidUrl);
              if (isValidUrl) {
                mediaItems.push({
                  type: "image",
                  url: mediaUrl,
                });
                console.log("✅ Added media item to Late.dev post");
              } else {
                console.warn("⚠️ Media URL is not valid HTTP/HTTPS:", mediaUrl);
              }
            } else {
              console.warn("⚠️ No mediaUrl available for scheduling");
            }

            // Create Late.dev post
            const latePostData = {
              content: fullContent,
              platforms,
              mediaItems: mediaItems.length > 0 ? mediaItems : undefined,
              scheduledFor: new Date(scheduledDate).toISOString(),
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              queuedFromProfile: profileId,
            };

            console.log("Creating Late.dev post:", latePostData);

            const lateResponse = await fetch("/api/late/posts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(latePostData),
            });

            if (!lateResponse.ok) {
              const errorData = await lateResponse.json();
              throw new Error(errorData.error || "Failed to schedule post");
            }

            const latePost = await lateResponse.json();

            // Update local post with Late.dev info and approve it
            updates.late_post_id = latePost.id;
            updates.late_status = latePost.status;
            updates.late_scheduled_for = new Date(scheduledDate);
            updates.late_platforms = platforms.map((p: any) => ({ platform: p.platform }));
            updates.approval_status = "approved";
            updates.approved_at = new Date();
            updates.approved_by = "user";

            console.log("✅ Late.dev post created:", latePost.id);
          } catch (scheduleError: any) {
            console.error("❌ Scheduling error:", scheduleError);
            alert(`Failed to schedule post: ${scheduleError.message}`);
            setIsLoading(false);
            return;
          }
        } else {
          console.log("⏭️ Skipping Late.dev scheduling:", { schedulePost, scheduledDate });
        }

        // Update the post in database
        console.log("💾 Updating post in database with:", updates);
        const updateResponse = await fetch("/api/posts/edit", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postId: postId,
            updates
          })
        });

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          console.error("❌ Database update failed:", errorText);
          throw new Error("Failed to update post");
        }

        const updatedPost = await updateResponse.json();
        console.log("✅ Post updated in database:", updatedPost);

        const successMessage = schedulePost && scheduledDate
          ? `Post scheduled successfully for ${new Date(scheduledDate).toLocaleString()}! 📅`
          : "Post updated successfully! ✅";

        alert(successMessage);

        if (onPostCreated) {
          onPostCreated();
        }

        onOpenChange(false);

        // Reset form
        setImageVideo(null);
        setImagePreview(null);
        setCaption("");
        setHashtags("");
        setSchedulePost(false);
        setScheduledDate("");
        setPostOnInstagram(true);
        setPostOnFacebook(false);
        setCurrentDraftId(null);

        setIsLoading(false);
        return;
      }

      // Validate account selection for new posts
      if (postOnInstagram && !selectedInstagramAccount) {
        alert("Please select an Instagram account");
        setIsLoading(false);
        return;
      }
      if (postOnFacebook && !selectedFacebookAccount) {
        alert("Please select a Facebook account");
        setIsLoading(false);
        return;
      }

      // Prepare content with hashtags
      // Check if caption already contains the hashtags to avoid duplication
      const captionHasHashtags = hashtags && caption.includes(hashtags.trim());
      const fullContent = hashtags && !captionHasHashtags ? `${caption}\n\n${hashtags}` : caption;

      // Prepare platforms array for Late API
      const platforms: any[] = [];

      if (postOnInstagram && selectedInstagramAccount) {
        platforms.push({
          platform: "instagram",
          accountId: selectedInstagramAccount,
          platformSpecificData: {
            contentType: "post"
          }
        });
      }

      if (postOnFacebook && selectedFacebookAccount) {
        platforms.push({
          platform: "facebook",
          accountId: selectedFacebookAccount
        });
      }

      // Upload media to Supabase first if present
      let mediaUrl: string | null = null;
      if (finalImagePreview) {
        // Only upload if it's a data URL (new upload), not an existing URL
        if (finalImagePreview.startsWith('data:')) {
          try {
            console.log("📤 Uploading media to Supabase...");
            const uploadResponse = await fetch("/api/upload", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                file: finalImagePreview,
                folder: "posts"
              }),
            });

            if (!uploadResponse.ok) {
              const errorData = await uploadResponse.json();
              throw new Error(errorData.error || "Failed to upload media to Supabase");
            }

            const uploadResult = await uploadResponse.json();
            mediaUrl = uploadResult.publicUrl;

            if (!mediaUrl) {
              throw new Error("Upload succeeded but no URL returned");
            }

            console.log("✅ Media uploaded successfully:", mediaUrl);
          } catch (uploadError) {
            console.error("❌ Error uploading media:", uploadError);
            alert(`Failed to upload media: ${(uploadError as Error).message}. Please try again.`);
            setIsLoading(false);
            return;
          }
        } else if (finalImagePreview.startsWith('http://') || finalImagePreview.startsWith('https://')) {
          // It's already a URL, use it directly
          mediaUrl = finalImagePreview;
          console.log("✅ Using existing image URL:", mediaUrl);
        } else {
          // Invalid image format
          alert("Invalid image format. Please upload a new image.");
          setIsLoading(false);
          return;
        }
      }

      // Prepare media items with the uploaded URL
      const mediaItems: any[] = [];
      if (mediaUrl) {
        mediaItems.push({
          type: imageVideo?.type.startsWith('video/') ? "video" : "image",
          url: mediaUrl
        });
      }

      // Prepare Late API request
      const lateAPIRequest: any = {
        content: fullContent,
        platforms,
        mediaItems: mediaItems.length > 0 ? mediaItems : undefined,
      };

      // Handle queue scheduling
      if (addToQueue && selectedProfileId) {
        try {
          // Get next available queue slot
          const queueResponse = await fetch(`/api/late/queue/next-slot?profileId=${selectedProfileId}`);
          if (queueResponse.ok) {
            const queueData = await queueResponse.json();
            lateAPIRequest.scheduledFor = queueData.nextSlot;
            lateAPIRequest.timezone = queueData.timezone;
            lateAPIRequest.queuedFromProfile = selectedProfileId;
            console.log("Using queue slot:", queueData.nextSlot);
          } else {
            throw new Error("Failed to get next queue slot. Make sure queue is configured.");
          }
        } catch (queueError) {
          console.error("Queue error:", queueError);
          alert("Failed to add to queue. Please configure your queue schedule first or use manual scheduling.");
          setIsLoading(false);
          return;
        }
      }
      // Add manual scheduling if enabled
      else if (schedulePost && scheduledDate) {
        lateAPIRequest.scheduledFor = new Date(scheduledDate).toISOString();
      }

      // Call Late API
      console.log("Creating post via Late API...", lateAPIRequest);
      const response = await fetch("/api/late/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lateAPIRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create post via Late API");
      }

      const result = await response.json();
      console.log("Post created successfully via Late API:", result);

      // Also save to local database for tracking
      try {
        console.log("💾 Saving post to database with image URL:", mediaUrl);
        
        // Prepare raw_data with text overlay settings
        const rawData: any = {};
        if (overlayText) {
          rawData.textOverlay = {
            text: overlayText,
            position: textPosition,
            fontSize: fontSize,
            color: textColor
          };
        }
        
        const dbResponse = await fetch("/api/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageVideo: mediaUrl, // Always use the Supabase URL, never data URL
            caption,
            hashtags,
            schedulePost,
            scheduledDate,
            postOnInstagram,
            postOnFacebook,
            latePostId: result.id,
            lateStatus: result.status,
            rawData: rawData,
          }),
        });

        if (!dbResponse.ok) {
          const errorText = await dbResponse.text();
          console.warn("⚠️ Could not save to local database:", errorText);
        } else {
          console.log("✅ Post saved to database successfully");
        }
      } catch (dbError) {
        console.warn("⚠️ Local database save failed (non-critical):", dbError);
        // Don't fail the whole operation if local save fails
        // The post is already on Late.dev which is what matters
      }

      // Delete draft if it was published from a draft
      if (currentDraftId) {
        draftUtils.deleteDraft(currentDraftId);
      }

      // Call the callback to refresh data
      if (onPostCreated) {
        onPostCreated();
      }

      // Show success feedback
      const statusMessage = schedulePost
        ? `Post scheduled successfully for ${new Date(scheduledDate).toLocaleString()}! 📅`
        : "Post created and will be published shortly! 🎉";
      alert(statusMessage);

      onOpenChange(false);

      // Reset form
      setImageVideo(null);
      setImagePreview(null);
      setCaption("");
      setHashtags("");
      setSchedulePost(false);
      setScheduledDate("");
      setPostOnInstagram(true);
      setPostOnFacebook(false);
      setCurrentDraftId(null);
    } catch (error) {
      console.error("Error creating post:", error);
      alert(`Failed to create post: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        defaultWidth={896} 
        defaultHeight={700}
        minWidth={600} 
        minHeight={500}
        className="p-0"
      >
        <div ref={containerRef} className="flex h-full overflow-hidden">
          {/* Left Panel - Form */}
          <div 
            className="flex flex-col overflow-hidden"
            style={{ width: `${leftPanelWidth}%` }}
          >
            <div className="p-6 pb-0 flex-shrink-0">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <Send className="h-6 w-6 text-blue-500" />
                  {postId ? "Edit Post" : "Create New Post"}
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  {postId ? "Update your post" : "Share your moment with the world"}
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6">
              <div className="space-y-6 pb-6">
                {/* Media Upload */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Media
                  </Label>

                  {!imagePreview ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer group">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="media-upload"
                      />
                      <label htmlFor="media-upload" className="cursor-pointer">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3 group-hover:text-blue-500 transition-colors" />
                        <p className="text-gray-600 font-medium">Click to upload media</p>
                        <p className="text-sm text-gray-400 mt-1">PNG, JPG, MP4 up to 10MB</p>
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Main Image */}
                      <div 
                        ref={imagePreviewRef}
                        className="relative rounded-xl overflow-hidden bg-gray-100"
                      >
                        <div className="absolute top-2 left-2 z-10">
                          <Badge className="bg-blue-600 text-white">Main Photo</Badge>
                        </div>
                        {imageVideo?.type.startsWith('video/') ? (
                          <video
                            src={imagePreview}
                            className="w-full h-48 object-cover"
                            controls
                          />
                        ) : (
                          <>
                            <img
                              src={getProxiedImageUrl(imagePreview) || imagePreview}
                              alt="Main preview"
                              className="w-full h-48 object-cover"
                            />
                            {/* Draggable Text Overlay */}
                            {overlayText && (
                              <div
                                className="absolute cursor-move select-none"
                                style={{
                                  left: `${textPosition.x}%`,
                                  top: `${textPosition.y}%`,
                                  transform: 'translate(-50%, -50%)',
                                  fontSize: `${fontSize}px`,
                                  color: textColor,
                                  fontWeight: 'bold',
                                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                                  pointerEvents: 'auto',
                                  zIndex: 20,
                                }}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setIsDraggingText(true);
                                  if (imagePreviewRef.current) {
                                    const rect = imagePreviewRef.current.getBoundingClientRect();
                                    const offsetX = ((e.clientX - rect.left) / rect.width) * 100 - textPosition.x;
                                    const offsetY = ((e.clientY - rect.top) / rect.height) * 100 - textPosition.y;
                                    setDragOffset({ x: offsetX, y: offsetY });
                                  }
                                }}
                              >
                                {overlayText}
                              </div>
                            )}
                          </>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={removeMedia}
                          className="absolute top-2 right-2 z-10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Additional Images */}
                      {additionalImages.length > 0 && (
                        <div>
                          <Label className="text-xs text-gray-600 mb-2 block">
                            Additional Images (click to set as main)
                          </Label>
                          <div className="grid grid-cols-3 gap-2">
                            {additionalImages.map((imgUrl, index) => (
                              <AdditionalImageThumbnail
                                key={index}
                                imgUrl={imgUrl}
                                index={index}
                                onSetAsMain={setAsMainImage}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Text Overlay Controls */}
                {imagePreview && !imageVideo?.type.startsWith('video/') && (
                  <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      Text Overlay (Drag text on image to position)
                    </Label>
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-600 mb-1 block">Text</Label>
                        <Input
                          value={overlayText}
                          onChange={(e) => setOverlayText(e.target.value)}
                          placeholder="Enter text to overlay on image..."
                          className="bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-600 mb-1 block">Font Size: {fontSize}px</Label>
                          <input
                            type="range"
                            min="16"
                            max="72"
                            value={fontSize}
                            onChange={(e) => setFontSize(Number(e.target.value))}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-gray-600 mb-1 block">Text Color</Label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              className="w-12 h-9 rounded cursor-pointer"
                            />
                            <Input
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              className="flex-1 bg-white text-xs"
                              placeholder="#FFFFFF"
                            />
                          </div>
                        </div>
                      </div>

                      {overlayText && (
                        <p className="text-xs text-blue-600">
                          💡 Tip: Click and drag the text on the image above to reposition it
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Caption */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      Caption
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAiEditorOpen(true);
                        onOpenChange(false);
                      }}
                      className="text-purple-600 border-purple-300 hover:bg-purple-50"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Edit with AI
                    </Button>
                  </div>
                  <Textarea
                    placeholder="What's on your mind? Share your story..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="min-h-[120px] resize-none border-gray-300 focus:border-blue-500 rounded-xl"
                  />
                  <div className={cn(
                    "text-xs text-right",
                    isOverLimit() ? "text-red-500" : "text-gray-500"
                  )}>
                    {getCharacterCount()}/2200 characters
                  </div>
                </div>

                {/* Hashtags */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Hashtags
                  </Label>
                  <Input
                    placeholder="Add hashtags... #lifestyle #photography #inspiration"
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    className="border-gray-300 focus:border-blue-500 rounded-xl"
                  />
                  {hashtags && (
                    <div className="flex flex-wrap gap-2">
                      {parseHashtags(hashtags).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-blue-600 bg-blue-50">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Scheduling */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="schedule-post"
                      checked={schedulePost}
                      onChange={(e) => {
                        setSchedulePost(e.target.checked);
                        if (e.target.checked) setAddToQueue(false);
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <Label htmlFor="schedule-post" className="text-sm font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Schedule for specific time
                    </Label>
                  </div>

                  {schedulePost && (
                    <div className="ml-7 space-y-2">
                      <Input
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="border-gray-300 focus:border-blue-500 rounded-xl"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="add-to-queue"
                      checked={addToQueue}
                      onChange={(e) => {
                        setAddToQueue(e.target.checked);
                        if (e.target.checked) setSchedulePost(false);
                      }}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <Label htmlFor="add-to-queue" className="text-sm font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Add to queue (auto-schedule)
                    </Label>
                  </div>

                  {addToQueue && (
                    <div className="ml-7 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="text-xs text-purple-700 dark:text-purple-300">
                        Post will be automatically scheduled to the next available time slot in your queue.
                      </p>
                    </div>
                  )}
                </div>

                {/* Platform Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Publish to:</Label>

                  {isLoadingAccounts ? (
                    <div className="text-center py-4 text-gray-500">
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2" />
                      Loading accounts...
                    </div>
                  ) : connectedAccounts.length === 0 ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-sm text-amber-700">
                        No social media accounts connected. Please connect your accounts in Late.dev first.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Instagram */}
                      {connectedAccounts.some(acc => acc.platform === "instagram") && (
                        <div className="space-y-2">
                          <div
                            className={cn(
                              "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                              postOnInstagram
                                ? "border-pink-500 bg-pink-50"
                                : "border-gray-200 hover:border-gray-300"
                            )}
                            onClick={() => setPostOnInstagram(!postOnInstagram)}
                          >
                            <input
                              type="checkbox"
                              checked={postOnInstagram}
                              onChange={() => { }}
                              className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                            />
                            <Instagram className="h-5 w-5 text-pink-600" />
                            <span className="font-medium">Instagram</span>
                          </div>

                          {postOnInstagram && (
                            <select
                              value={selectedInstagramAccount}
                              onChange={(e) => setSelectedInstagramAccount(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                            >
                              <option value="">Select Instagram account</option>
                              {connectedAccounts
                                .filter(acc => acc.platform === "instagram")
                                .map(acc => (
                                  <option key={acc.id || acc._id} value={acc.id || acc._id}>
                                    @{acc.username || acc.displayName || acc.id}
                                  </option>
                                ))}
                            </select>
                          )}
                        </div>
                      )}

                      {/* Facebook */}
                      {connectedAccounts.some(acc => acc.platform === "facebook") && (
                        <div className="space-y-2">
                          <div
                            className={cn(
                              "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                              postOnFacebook
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            )}
                            onClick={() => setPostOnFacebook(!postOnFacebook)}
                          >
                            <input
                              type="checkbox"
                              checked={postOnFacebook}
                              onChange={() => { }}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <Facebook className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">Facebook</span>
                          </div>

                          {postOnFacebook && (
                            <select
                              value={selectedFacebookAccount}
                              onChange={(e) => setSelectedFacebookAccount(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Select Facebook account</option>
                              {connectedAccounts
                                .filter(acc => acc.platform === "facebook")
                                .map(acc => (
                                  <option key={acc.id || acc._id} value={acc.id || acc._id}>
                                    {acc.username || acc.displayName || acc.id}
                                  </option>
                                ))}
                            </select>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Fixed Footer with Validation Messages */}
            <div className="flex-shrink-0 p-6 pt-0 border-t bg-white">
              {/* Validation Messages */}
              {(!postOnInstagram && !postOnFacebook) && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-700">Please select at least one platform to publish to.</p>
                </div>
              )}

              {(postOnInstagram && !selectedInstagramAccount) && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-700">Please select an Instagram account.</p>
                </div>
              )}

              {(postOnFacebook && !selectedFacebookAccount) && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-700">Please select a Facebook account.</p>
                </div>
              )}

              {isOverLimit() && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-700">Your post exceeds the character limit. Please shorten your content.</p>
                </div>
              )}

              {/* Action Buttons */}
              <DialogFooter className="pt-4">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft || (!caption.trim() && !imageVideo)}
                  className="rounded-xl border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  {isSavingDraft ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save as Draft
                    </>
                  )}
                </Button>
                <Button
                  onClick={handlePost}
                  disabled={
                    isLoading ||
                    (!caption.trim() && !imagePreview) ||
                    isOverLimit() ||
                    (!postOnInstagram && !postOnFacebook) ||
                    (postOnInstagram && !selectedInstagramAccount) ||
                    (postOnFacebook && !selectedFacebookAccount)
                  }
                  className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {postId ? "Updating..." : "Posting..."}
                    </div>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {postId ? "Update Post" : (schedulePost ? "Schedule Post" : "Post Now")}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          </div>

          {/* Resize Handle */}
          <div 
            className="relative w-1 bg-gray-200 hover:bg-blue-400 active:bg-blue-500 cursor-col-resize transition-colors hidden md:block group"
            onMouseDown={handleColumnResizeStart}
            style={{ flexShrink: 0 }}
          >
            <div className="absolute inset-y-0 -left-1 -right-1" title="Drag to resize columns" />
            {/* Visual indicator on hover */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-12 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Right Panel - Preview */}
          <div 
            className="bg-gray-50 border-l overflow-y-auto hidden md:block"
            style={{ width: `${100 - leftPanelWidth}%` }}
          >
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">Preview</h3>
              </div>

              {/* Mock Social Media Post */}
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {/* Post Header */}
                <div className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    U
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Your Account</p>
                    <p className="text-xs text-gray-500">
                      {schedulePost && scheduledDate
                        ? `Scheduled for ${new Date(scheduledDate).toLocaleDateString()}`
                        : "Just now"
                      }
                    </p>
                  </div>
                </div>

                {/* Post Media */}
                {imagePreview && (
                  <div className="w-full bg-gray-100 flex items-center justify-center relative" style={{ minHeight: '300px', maxHeight: '500px' }}>
                    {imageVideo?.type.startsWith('video/') ? (
                      <video
                        src={imagePreview}
                        className="w-full h-auto object-contain"
                        style={{ maxHeight: '500px' }}
                      />
                    ) : (
                      <>
                        <img
                          src={imagePreview}
                          alt="Post preview"
                          className="w-full h-auto object-contain"
                          style={{ maxHeight: '500px' }}
                        />
                        {/* Text Overlay in Preview */}
                        {overlayText && (
                          <div
                            className="absolute select-none pointer-events-none"
                            style={{
                              left: `${textPosition.x}%`,
                              top: `${textPosition.y}%`,
                              transform: 'translate(-50%, -50%)',
                              fontSize: `${fontSize}px`,
                              color: textColor,
                              fontWeight: 'bold',
                              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                            }}
                          >
                            {overlayText}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Post Content */}
                <div className="p-4">
                  {caption && (
                    <div
                      className="text-sm mb-3 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: formatCaption(caption)
                      }}
                    />
                  )}

                  {hashtags && (
                    <div className="flex flex-wrap gap-1">
                      {parseHashtags(hashtags).map((tag, index) => (
                        <span key={index} className="text-blue-500 text-sm font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Platform Indicators */}
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    {postOnInstagram && (
                      <Badge variant="secondary" className="text-pink-600 bg-pink-50">
                        <Instagram className="h-3 w-3 mr-1" />
                        Instagram
                      </Badge>
                    )}
                    {postOnFacebook && (
                      <Badge variant="secondary" className="text-blue-600 bg-blue-50">
                        <Facebook className="h-3 w-3 mr-1" />
                        Facebook
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Empty State */}
              {!caption && !imagePreview && (
                <div className="text-center py-12 text-gray-400">
                  <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Your post preview will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent >

      <AIEditorSheet
        open={aiEditorOpen}
        onOpenChange={setAiEditorOpen}
        postData={{
          caption,
          hashtags,
          imageUrl: imagePreview || undefined,
          status: currentDraftId ? 'draft' : 'pending',
          isSaved: !!currentDraftId,
          postOnInstagram,
          postOnFacebook
        }}
        onCaptionUpdate={setCaption}
        onHashtagsUpdate={setHashtags}
        onPlatformToggle={(platform, enabled) => {
          if (platform === 'instagram') setPostOnInstagram(enabled);
          if (platform === 'facebook') setPostOnFacebook(enabled);
        }}
        onSchedule={() => setSchedulePost(true)}
        onSave={handleSaveDraft}
        postId={postId}
        latePostId={latePostId}
        isScheduled={!!lateScheduledFor && !latePostId?.includes('published')}
      />
    </Dialog >
  );
}
