"use client"

import { useState, useEffect } from "react"
console.log('🔵 EditPostModal v2.0 - Module Loaded');
import { ResizableDialog as Dialog, ResizableDialogContent as DialogContent, ResizableDialogDescription as DialogDescription, ResizableDialogHeader as DialogHeader, ResizableDialogTitle as DialogTitle } from "@/components/ui/resizable-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, X, Sparkles, Image as ImageIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getProxiedImageUrl } from "@/lib/image-proxy"
import { useToast } from "@/hooks/use-toast"
import { AIEditorSheet } from "@/components/ai-editor-sheet"

interface Post {
  id: number
  title: string
  ai_caption: string | null
  ai_summary: string | null
  ai_hashtags: string | string[] | null
}

interface EditPostModalProps {
  post: Post | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditComplete: () => void
}

export function EditPostModal({ post, open, onOpenChange, onEditComplete }: EditPostModalProps) {
  console.log('🔵 EditPostModal v2.0 - Component Loaded');
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [aiEditorOpen, setAiEditorOpen] = useState(false)
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null)
  const [additionalImages, setAdditionalImages] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: "",
    ai_caption: "",
    ai_summary: "",
    ai_hashtags: ""
  })

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || "",
        ai_caption: post.ai_caption || "",
        ai_summary: post.ai_summary || "",
        ai_hashtags: Array.isArray(post.ai_hashtags)
          ? post.ai_hashtags.join(" ")
          : typeof post.ai_hashtags === "string"
            ? post.ai_hashtags
            : ""
      })
      setMainImageUrl((post as any).main_image_url || null)

      // Parse additional_images - handle both JSON string and array
      let parsedAdditionalImages: string[] = [];
      const additionalImagesData = (post as any).additional_images;
      if (additionalImagesData) {
        console.log('Raw additional_images:', additionalImagesData);
        console.log('Type:', typeof additionalImagesData);
        if (typeof additionalImagesData === 'string') {
          try {
            parsedAdditionalImages = JSON.parse(additionalImagesData);
            console.log('Parsed additional_images:', parsedAdditionalImages);
          } catch (e) {
            console.error('Failed to parse additional_images:', e);
            parsedAdditionalImages = [];
          }
        } else if (Array.isArray(additionalImagesData)) {
          parsedAdditionalImages = additionalImagesData;
          console.log('2Additional_images is already an array:', parsedAdditionalImages);
        }
      }
      console.log('Setting additional images:', parsedAdditionalImages);
      setAdditionalImages(parsedAdditionalImages)
    }
  }, [post])

  const setAsMainImage = (imageUrl: string) => {
    if (!mainImageUrl) return;

    // Swap: current main becomes additional, selected additional becomes main
    const newAdditionalImages = additionalImages.filter(img => img !== imageUrl);
    newAdditionalImages.push(mainImageUrl);

    setMainImageUrl(imageUrl);
    setAdditionalImages(newAdditionalImages);
  };

  const handleSave = async () => {
    if (!post) return

    try {
      setSaving(true)

      // Convert hashtags string back to array
      const hashtagsArray = formData.ai_hashtags
        .split(/\s+/)
        .filter(tag => tag.startsWith("#"))
        .map(tag => tag.trim())

      const response = await fetch("/api/posts/edit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.id,
          updates: {
            title: formData.title,
            ai_caption: formData.ai_caption,
            ai_summary: formData.ai_summary,
            ai_hashtags: hashtagsArray,
            main_image_url: mainImageUrl,
            additional_images: additionalImages
          }
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Post updated successfully"
        })
        onEditComplete()
        onOpenChange(false)
      } else {
        throw new Error("Failed to update post")
      }
    } catch (error) {
      console.error("Edit error:", error)
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (!post) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent defaultWidth={800} minWidth={600} minHeight={400}>
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
          <DialogDescription>
            Make changes to the post content before approval
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Images Section */}
          {(mainImageUrl || additionalImages.length > 0) && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Images
              </Label>

              {mainImageUrl && (
                <div className="space-y-3">
                  {/* Main Image */}
                  <div className="relative rounded-xl overflow-hidden bg-gray-100">
                    <div className="absolute top-2 left-2 z-10">
                      <Badge className="bg-blue-600 text-white">Main Photo</Badge>
                    </div>
                    <img
                      src={getProxiedImageUrl(mainImageUrl) || mainImageUrl}
                      alt="Main preview"
                      className="w-full h-48 object-cover"
                    />
                  </div>

                  {/* Additional Images */}
                  {additionalImages.length > 0 && (
                    <div>
                      <Label className="text-xs text-gray-600 mb-2 block">
                        🔴 NEW VERSION - Additional Images (click to set as main)
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {additionalImages.map((imgUrl, index) => {
                          const proxiedUrl = getProxiedImageUrl(imgUrl) || imgUrl;
                          console.log(`[DEBUG Image ${index}] Original:`, imgUrl);
                          console.log(`[DEBUG Image ${index}] Proxied:`, proxiedUrl);
                          return (
                            <div
                              key={index}
                              className="relative rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all group"
                              style={{
                                width: '100%',
                                paddingBottom: '100%',
                                backgroundColor: '#e5e7eb',
                                position: 'relative'
                              }}
                              onClick={() => setAsMainImage(imgUrl)}
                            >
                              <img
                                src={proxiedUrl}
                                alt={`Additional ${index + 1}`}
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  console.error(`[DEBUG Image ${index}] ❌ FAILED TO LOAD`);
                                  console.error(`[DEBUG Image ${index}] Attempted URL:`, target.src);
                                  console.error(`[DEBUG Image ${index}] Natural dimensions:`, target.naturalWidth, 'x', target.naturalHeight);
                                }}
                                onLoad={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  console.log(`[DEBUG Image ${index}] ✅ LOADED SUCCESSFULLY`);
                                  console.log(`[DEBUG Image ${index}] Final URL:`, target.src);
                                  console.log(`[DEBUG Image ${index}] Dimensions:`, target.naturalWidth, 'x', target.naturalHeight);
                                  console.log(`[DEBUG Image ${index}] Display:`, window.getComputedStyle(target).display);
                                  console.log(`[DEBUG Image ${index}] Opacity:`, window.getComputedStyle(target).opacity);
                                  console.log(`[DEBUG Image ${index}] Z-index:`, window.getComputedStyle(target).zIndex);
                                }}
                              />
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(0,0,0,0)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                pointerEvents: 'none',
                                transition: 'background-color 0.3s'
                              }}
                                className="group-hover:bg-black/40">
                                <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                                  Set as Main
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Post title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              value={formData.ai_summary}
              onChange={(e) => setFormData({ ...formData, ai_summary: e.target.value })}
              placeholder="Post summary"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="caption">Caption</Label>
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
              id="caption"
              value={formData.ai_caption}
              onChange={(e) => setFormData({ ...formData, ai_caption: e.target.value })}
              placeholder="Social media caption"
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              {formData.ai_caption.length} characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hashtags">Hashtags</Label>
            <Input
              id="hashtags"
              value={formData.ai_hashtags}
              onChange={(e) => setFormData({ ...formData, ai_hashtags: e.target.value })}
              placeholder="#ostomy #ostomylife #ostomyawareness"
            />
            <p className="text-xs text-muted-foreground">
              Separate hashtags with spaces
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              console.log('🔴 DEBUG INFO:');
              console.log('Main Image URL:', mainImageUrl);
              console.log('Additional Images:', additionalImages);
              console.log('Additional Images Count:', additionalImages.length);
              additionalImages.forEach((url, i) => {
                const proxied = getProxiedImageUrl(url);
                console.log(`Image ${i}:`, { original: url, proxied });
              });
              toast({
                title: "Debug Info Logged",
                description: "Check browser console for details"
              });
            }}
          >
            🐛 DEBUG
          </Button>
          <div className="flex gap-2">
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
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>

      <AIEditorSheet
        open={aiEditorOpen}
        onOpenChange={setAiEditorOpen}
        postData={{
          id: post.id,
          caption: formData.ai_caption,
          hashtags: formData.ai_hashtags,
          status: 'draft',
          isSaved: true,
          postOnInstagram: false,
          postOnFacebook: false
        }}
        onCaptionUpdate={(caption) => setFormData({ ...formData, ai_caption: caption })}
        onHashtagsUpdate={(hashtags) => setFormData({ ...formData, ai_hashtags: hashtags })}
        onPlatformToggle={() => { }}
        onSchedule={() => { }}
        onSave={handleSave}
        postId={post.id}
        latePostId={(post as any).late_post_id || null}
        isScheduled={!!(post as any).late_scheduled_for && !(post as any).late_published_at}
      />
    </Dialog>
  )
}
