"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { PostData } from '@/types/post';
import { CaptionVariation } from '@/types/ai';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, ImageIcon, Type, Hash, Sparkles, Loader2, Instagram, Facebook, Calendar, Save, X } from 'lucide-react';
import { RewriteResponse, EditResponse } from '@/types/ai';

interface AIEditorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postData: PostData;
  onCaptionUpdate: (caption: string) => void;
  onHashtagsUpdate: (hashtags: string) => void;
  onPlatformToggle: (platform: 'instagram' | 'facebook', enabled: boolean) => void;
  onSchedule: () => void;
  onSave: () => void;
  postId?: number;
  latePostId?: string | null;
  isScheduled?: boolean;
}

// Helper function to render markdown-style text with bold formatting
function renderFormattedText(text: string) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const boldRegex = /\*\*(.+?)\*\*/g;
  let match;
  let key = 0;

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the bold part
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    // Add the bold part
    parts.push(<strong key={key++} className="font-semibold">{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export function AIEditorSheet({
  open,
  onOpenChange,
  postData,
  onCaptionUpdate,
  onHashtagsUpdate,
  onPlatformToggle,
  onSchedule,
  onSave,
  postId,
  latePostId,
  isScheduled
}: AIEditorSheetProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previews, setPreviews] = useState<Array<{ caption: string; explanation: string; tone?: string }>>([]);
  const [customInstruction, setCustomInstruction] = useState('');
  const [includeCaption, setIncludeCaption] = useState(true);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [editedCaption, setEditedCaption] = useState(postData.caption);
  const [editedHashtags, setEditedHashtags] = useState(postData.hashtags);
  const [isSaving, setIsSaving] = useState(false);
  const captionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [mouseDownPosition, setMouseDownPosition] = useState({ x: 0, y: 0 });

  const { toast } = useToast();

  const debouncedCaptionUpdate = useMemo(
    () => {
      let timeoutId: NodeJS.Timeout;
      return (caption: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          onCaptionUpdate(caption);
        }, 300);
      };
    },
    [onCaptionUpdate]
  );

  useEffect(() => {
    setEditedCaption(postData.caption);
    setEditedHashtags(postData.hashtags);
  }, [postData.caption, postData.hashtags]);

  useEffect(() => {
    if (open && captionTextareaRef.current) {
      setTimeout(() => {
        captionTextareaRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const getPlatform = (): 'instagram' | 'facebook' | 'both' => {
    if (postData.postOnInstagram && postData.postOnFacebook) return 'both';
    if (postData.postOnInstagram) return 'instagram';
    if (postData.postOnFacebook) return 'facebook';
    return 'both';
  };

  const handleRewrite = async () => {
    setIsGenerating(true);
    setPreviews([]);

    try {
      const response = await fetch('/api/ai/rewrite-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: editedCaption,
          context: {
            hashtags: editedHashtags,
            platform: getPlatform()
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to rewrite caption');
      }

      const data: RewriteResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred');
      }

      setPreviews(data.variations.map(v => ({ 
        caption: v.caption, 
        explanation: `${v.tone} variation`,
        tone: v.tone 
      })));
      toast({
        title: "Success",
        description: `Generated ${data.variations.length} caption variations`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rewrite caption. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCustomEdit = async () => {
    if (!customInstruction.trim()) {
      toast({
        title: "Error",
        description: "Please enter an instruction",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setPreviews([]);

    try {
      const response = await fetch('/api/ai/edit-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction: customInstruction,
          caption: includeCaption ? editedCaption : undefined,
          context: {
            hashtags: editedHashtags,
            platform: getPlatform()
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to edit caption');
      }

      const data: EditResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred');
      }

      setPreviews([{
        caption: data.editedCaption,
        explanation: data.explanation || "Caption edited successfully"
      }]);

      toast({
        title: "Preview Ready",
        description: "Review the edited caption below",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to edit caption. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePreview = async () => {
    // If custom instruction is provided, use custom edit
    if (customInstruction.trim()) {
      await handleCustomEdit();
      return;
    }

    // If styles are selected, generate variations for those styles
    if (selectedStyles.length > 0) {
      setIsGenerating(true);
      setPreviews([]);

      try {
        const response = await fetch('/api/ai/rewrite-caption', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caption: editedCaption,
            context: {
              hashtags: editedHashtags,
              platform: getPlatform()
            }
          })
        });

        if (!response.ok) {
          throw new Error('Failed to rewrite caption');
        }

        const data: RewriteResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Unknown error occurred');
        }

        // Filter variations to only show selected styles
        const filteredVariations = data.variations
          .filter(v => selectedStyles.includes(v.tone))
          .map(v => ({ 
            caption: v.caption, 
            explanation: `${v.tone} variation`,
            tone: v.tone 
          }));

        setPreviews(filteredVariations);
        toast({
          title: "Success",
          description: `Generated ${filteredVariations.length} caption variation${filteredVariations.length > 1 ? 's' : ''}`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to generate variations. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // If nothing is selected or entered, show error
    toast({
      title: "Error",
      description: "Please enter a custom instruction or select at least one style",
      variant: "destructive"
    });
  };

  const handleSaveToDatabase = async () => {
    if (!postId) {
      console.log('⚠️ No postId provided, falling back to draft save');
      // If no postId, fall back to the original onSave (draft save)
      onSave();
      return;
    }

    console.log('💾 Starting save to database...', { postId, editedCaption, editedHashtags });
    setIsSaving(true);
    try {
      // Convert hashtags string to array
      const hashtagsArray = editedHashtags
        .split(/\s+/)
        .filter(tag => tag.startsWith("#"))
        .map(tag => tag.replace("#", "").trim());

      console.log('📋 Processed hashtags:', hashtagsArray);

      // Prepare full content with hashtags for Late.dev
      // Check if caption already contains the hashtags to avoid duplication
      const captionHasHashtags = editedHashtags && editedCaption.includes(editedHashtags.trim());
      const fullContent = editedHashtags && !captionHasHashtags
        ? `${editedCaption}\n\n${editedHashtags}`
        : editedCaption;

      // If this is a scheduled post, update it on Late.dev
      if (isScheduled && latePostId) {
        console.log('📅 Updating scheduled post on Late.dev...', latePostId);
        try {
          const lateResponse = await fetch(`/api/late/posts/${latePostId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: fullContent
            })
          });

          if (!lateResponse.ok) {
            const errorData = await lateResponse.json();
            console.error('❌ Late.dev update failed:', errorData);
            throw new Error(errorData.error || 'Failed to update scheduled post on Late.dev');
          }

          console.log('✅ Late.dev post updated successfully');
          toast({
            title: "Success",
            description: "Scheduled post updated on Late.dev",
          });
        } catch (lateError) {
          console.error('❌ Error updating Late.dev post:', lateError);
          toast({
            title: "Error",
            description: lateError instanceof Error ? lateError.message : "Failed to update scheduled post",
            variant: "destructive"
          });
          setIsSaving(false);
          return;
        }
      }

      // Update the local database
      const updates = {
        ai_caption: editedCaption,
        ai_hashtags: hashtagsArray,
        posted_on_instagram: postData.postOnInstagram,
        posted_on_facebook: postData.postOnFacebook,
      };

      console.log('📤 Sending update to database:', { postId, updates });

      const response = await fetch('/api/posts/edit', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          updates
        })
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Database update failed:', errorData);
        throw new Error(errorData.error || 'Failed to save post to database');
      }

      const result = await response.json();
      console.log('✅ Database updated successfully:', result);

      toast({
        title: "Success",
        description: isScheduled
          ? "Post updated successfully on Late.dev and database"
          : "Post saved successfully to database",
      });

      // Call the original onSave to refresh the parent
      onSave();

      // Close the sheet
      onOpenChange(false);
    } catch (error) {
      console.error('❌ Error saving post:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[50vw] sm:max-w-[800px] p-0 flex flex-col"
        aria-label="AI Post Editor"
      >
        <div className="p-6 border-b">
          <SheetHeader>
            <SheetTitle>Edit with AI</SheetTitle>
            <SheetDescription>
              Use AI to enhance your social media caption
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Save Status Indicator */}
          {/* <div className="flex items-center justify-center">
            {postData.isSaved ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                Saved
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                <AlertCircle className="h-3 w-3 mr-1" />
                Unsaved
              </Badge>
            )}
          </div> */}

          {/* Image Preview */}
          {postData.imageUrl ? (
            <div className="rounded-lg overflow-hidden border">
              <img
                src={postData.imageUrl}
                alt="Post media"
                className="w-full max-h-[300px] object-cover"
              />
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 flex flex-col items-center justify-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">No image attached</p>
            </div>
          )}

          {/* Editable Caption */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Type className="h-4 w-4" />
              Caption
            </Label>
            <Textarea
              ref={captionTextareaRef}
              placeholder="What's on your mind? Share your story..."
              value={editedCaption}
              onChange={(e) => {
                setEditedCaption(e.target.value);
                debouncedCaptionUpdate(e.target.value);
              }}
              className="min-h-[150px] resize-none"
              aria-label="Post caption"
              aria-describedby="caption-char-count"
            />
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span id="caption-char-count">
                {editedCaption.length} / 2200 characters
              </span>
              <span className="sr-only">
                {editedCaption.length} of 2200 characters used
              </span>
            </div>
          </div>

          {/* Hashtags Display */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Hashtags
            </Label>
            {editedHashtags && (
              <div className="flex flex-wrap gap-2 mb-2">
                {editedHashtags.split(' ').filter(tag => tag.trim()).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-300">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <Input
              placeholder="Add hashtags (space-separated)"
              value={editedHashtags}
              onChange={(e) => {
                setEditedHashtags(e.target.value);
                onHashtagsUpdate(e.target.value);
              }}
              className="w-full"
            />
          </div>

          {/* AI Tools Section */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              AI Tools
            </h3>

            {/* Style Selection Checkboxes */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Select Writing Styles
              </Label>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="style-professional"
                    checked={selectedStyles.includes('professional')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedStyles([...selectedStyles, 'professional']);
                      } else {
                        setSelectedStyles(selectedStyles.filter(s => s !== 'professional'));
                      }
                    }}
                  />
                  <label
                    htmlFor="style-professional"
                    className="text-sm cursor-pointer"
                  >
                    Professional
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="style-casual"
                    checked={selectedStyles.includes('casual')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedStyles([...selectedStyles, 'casual']);
                      } else {
                        setSelectedStyles(selectedStyles.filter(s => s !== 'casual'));
                      }
                    }}
                  />
                  <label
                    htmlFor="style-casual"
                    className="text-sm cursor-pointer"
                  >
                    Casual
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="style-empathetic"
                    checked={selectedStyles.includes('empathetic')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedStyles([...selectedStyles, 'empathetic']);
                      } else {
                        setSelectedStyles(selectedStyles.filter(s => s !== 'empathetic'));
                      }
                    }}
                  />
                  <label
                    htmlFor="style-empathetic"
                    className="text-sm cursor-pointer"
                  >
                    Empathetic
                  </label>
                </div>
              </div>
            </div>

            {/* Custom Instruction */}
            <div className="space-y-3 border-t pt-4">
              <Label className="text-sm font-medium">
                Custom AI Instruction (Optional)
              </Label>
              <Textarea
                placeholder="E.g., Make it more empathetic, Add a call to action, Simplify the language..."
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                className="min-h-[80px] resize-none"
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-caption"
                    checked={includeCaption}
                    onCheckedChange={(checked) => setIncludeCaption(checked as boolean)}
                  />
                  <label
                    htmlFor="include-caption"
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    Include current caption
                  </label>
                </div>
                <span className="text-xs text-muted-foreground">
                  {customInstruction.length}/500
                </span>
              </div>
              <Button
                onClick={handleGeneratePreview}
                disabled={isGenerating || (!customInstruction.trim() && selectedStyles.length === 0)}
                className="w-full bg-black hover:bg-gray-800 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Preview'
                )}
              </Button>

              {/* Previews */}
              {previews.length > 0 && (
                <div className="space-y-2 mt-3">
                  <Label className="text-xs text-muted-foreground">
                    {previews.length > 1 ? 'Select a variation:' : 'Preview:'}
                  </Label>
                  {previews.map((preview, index) => (
                    <div
                      key={index}
                      className="group p-3 border rounded-lg hover:border-purple-300 cursor-pointer transition-all duration-300 ease-in-out overflow-hidden"
                      onMouseDown={(e) => {
                        setIsMouseDown(true);
                        setMouseDownPosition({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseUp={(e) => {
                        setIsMouseDown(false);
                      }}
                      onClick={(e) => {
                        // Only apply if this was a click (not a drag/scroll)
                        const deltaX = Math.abs(e.clientX - mouseDownPosition.x);
                        const deltaY = Math.abs(e.clientY - mouseDownPosition.y);
                        const isDrag = deltaX > 5 || deltaY > 5;
                        
                        if (!isDrag) {
                          setEditedCaption(preview.caption);
                          onCaptionUpdate(preview.caption);
                          toast({
                            title: "Variation applied",
                            description: preview.explanation,
                          });
                          setPreviews([]);
                          setCustomInstruction('');
                        }
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-300">
                          {preview.tone ? preview.tone.charAt(0).toUpperCase() + preview.tone.slice(1) : 'Custom Edit'}
                        </Badge>
                      </div>
                      <div className="max-h-[4.5rem] group-hover:max-h-[1000px] transition-all duration-500 ease-in-out overflow-hidden">
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                          {renderFormattedText(preview.caption)}
                        </div>
                      </div>
                      {preview.explanation && !preview.tone && (
                        <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                          {preview.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Platform Selection */}
          <div className="space-y-3 border-t pt-6">
            <Label className="text-sm font-semibold">
              Publish To
            </Label>
            <div className="flex gap-3">
              <Button
                variant={postData.postOnInstagram ? "default" : "outline"}
                className={postData.postOnInstagram ? "flex-1 bg-pink-600 hover:bg-pink-700" : "flex-1"}
                onClick={() => onPlatformToggle('instagram', !postData.postOnInstagram)}
              >
                <Instagram className="h-4 w-4 mr-2" />
                Instagram
              </Button>
              <Button
                variant={postData.postOnFacebook ? "default" : "outline"}
                className={postData.postOnFacebook ? "flex-1 bg-blue-600 hover:bg-blue-700" : "flex-1"}
                onClick={() => onPlatformToggle('facebook', !postData.postOnFacebook)}
              >
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
            </div>
          </div>

        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="border-t bg-background p-6 space-y-2">
          <Button
            onClick={handleSaveToDatabase}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save to Database
              </>
            )}
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
