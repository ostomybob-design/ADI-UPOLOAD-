/**
 * Generate a proxied image URL to bypass CORS restrictions
 * @param imageUrl - The original image URL
 * @returns Proxied URL or original URL if it's already from our domain
 */
export function getProxiedImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;

  // If it's a data URL or already from our domain, return as-is
  if (imageUrl.startsWith('data:') || imageUrl.startsWith('/') || imageUrl.includes(window.location.hostname)) {
    return imageUrl;
  }

  // Proxy external images through our API
  return `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
}
