"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SearchResult } from "@/app/dashboard/columns";
import { Badge } from "@/components/ui/badge";
import { Instagram, Facebook, Calendar, Link as LinkIcon } from "lucide-react";

interface ViewPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: SearchResult | null;
}

export function ViewPostModal({ open, onOpenChange, post }: ViewPostModalProps) {
  if (!post) return null;

  const formatHashtags = (hashtags: string | string[] | null) => {
    if (!hashtags) return "";

    let formattedHashtags = '';

    if (Array.isArray(hashtags)) {
      // If it's an array, join with spaces
      formattedHashtags = hashtags
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
        .join(' ');
    } else if (typeof hashtags === 'string') {
      // If it's a string, split by comma and format
      formattedHashtags = hashtags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
        .join(' ');
    } else {
      // Try to convert to string as fallback
      formattedHashtags = String(hashtags);
    }

    return formattedHashtags;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Post Preview</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            {post.is_draft && (
              <Badge className="bg-orange-100 text-orange-700">
                Draft
              </Badge>
            )}
            {post.content_processed && !post.is_draft && (
              <Badge className="bg-green-100 text-green-700">
                Published
              </Badge>
            )}
            {post.posted_on_instagram && (
              <Badge className="bg-pink-100 text-pink-700">
                <Instagram className="mr-1 h-3 w-3" />
                Posted on Instagram
              </Badge>
            )}
            {post.posted_on_facebook && (
              <Badge className="bg-blue-100 text-blue-700">
                <Facebook className="mr-1 h-3 w-3" />
                Posted on Facebook
              </Badge>
            )}
          </div>

          {/* Images */}
          {post.main_image_url && (
            <div className="space-y-3">
              {/* Main Image */}
              <div className="rounded-lg overflow-hidden border border-gray-200 relative">
                <div className="absolute top-2 left-2 z-10">
                  <Badge className="bg-blue-600 text-white">Main Photo</Badge>
                </div>
                <img
                  src={post.main_image_url}
                  alt={post.title}
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>

              {/* Additional Images */}
              {(() => {
                // Parse additional_images - handle both JSON string and array
                let parsedAdditionalImages: string[] = [];
                const additionalImagesData = (post as any).additional_images;
                if (additionalImagesData) {
                  if (typeof additionalImagesData === 'string') {
                    try {
                      parsedAdditionalImages = JSON.parse(additionalImagesData);
                    } catch (e) {
                      console.error('Failed to parse additional_images:', e);
                    }
                  } else if (Array.isArray(additionalImagesData)) {
                    parsedAdditionalImages = additionalImagesData;
                  }
                }

                return parsedAdditionalImages.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Additional Images</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {parsedAdditionalImages.map((imgUrl: string, index: number) => (
                        <div
                          key={index}
                          className="rounded-lg overflow-hidden border border-gray-200"
                        >
                          <img
                            src={imgUrl}
                            alt={`Additional ${index + 1}`}
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Title */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Title</h3>
            <p className="text-lg font-semibold text-gray-900">{post.title}</p>
          </div>

          {/* Caption */}
          {post.ai_caption && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Caption</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{post.ai_caption}</p>
            </div>
          )}

          {/* Hashtags */}
          {post.ai_hashtags && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Hashtags</h3>
              <p className="text-indigo-600">{formatHashtags(post.ai_hashtags)}</p>
            </div>
          )}

          {/* Summary */}
          {post.ai_summary && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">AI Summary</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{post.ai_summary}</p>
            </div>
          )}

          {/* Snippet */}
          {post.snippet && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Snippet</h3>
              <p className="text-gray-600 text-sm">{post.snippet}</p>
            </div>
          )}

          {/* Source URL */}
          {post.url && !post.is_draft && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Source URL</h3>
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center gap-2 text-sm"
              >
                <LinkIcon className="h-4 w-4" />
                {post.url}
              </a>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
              <p className="text-sm text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(post.created_at).toLocaleString()}
              </p>
            </div>
            {post.content_extraction_date && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Extracted</h3>
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.content_extraction_date).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Posted Dates */}
          {(post.instagram_posted_at || post.facebook_posted_at) && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              {post.instagram_posted_at && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Instagram Posted</h3>
                  <p className="text-sm text-gray-700 flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    {new Date(post.instagram_posted_at).toLocaleString()}
                  </p>
                </div>
              )}
              {post.facebook_posted_at && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Facebook Posted</h3>
                  <p className="text-sm text-gray-700 flex items-center gap-2">
                    <Facebook className="h-4 w-4" />
                    {new Date(post.facebook_posted_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
