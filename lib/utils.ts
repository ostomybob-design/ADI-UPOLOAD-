import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Ensures a URL uses HTTPS instead of HTTP to avoid mixed content warnings
 */
export function ensureHttps(url: string | null | undefined): string | null {
  if (!url) return null;
  
  // If it's an HTTP URL, convert to HTTPS
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  
  return url;
}
