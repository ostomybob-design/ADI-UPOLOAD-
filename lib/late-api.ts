/**
 * Late API Client
 * Documentation: https://getlate.dev/docs
 */

const LATE_API_BASE_URL = "https://getlate.dev/api/v1";
const LATE_API_KEY = process.env.LATE_API_KEY;

if (!LATE_API_KEY) {
  console.error("❌ LATE_API_KEY is not set in environment variables");
  console.error("Please add LATE_API_KEY to your .env.local file");
} else {
  console.log("✅ LATE_API_KEY loaded:", LATE_API_KEY.substring(0, 10) + "...");
}

export interface LateMediaItem {
  type: "image" | "video";
  url: string;
}

export interface LatePlatformConfig {
  platform: "instagram" | "facebook" | "linkedin" | "twitter" | "threads" | "tiktok" | "youtube" | "pinterest" | "reddit" | "bluesky";
  accountId: string;
  platformSpecificData?: {
    contentType?: "story" | "reel" | "post";
    firstComment?: string;
    [key: string]: any;
  };
}

export interface CreatePostRequest {
  content: string;
  platforms: LatePlatformConfig[];
  mediaItems?: LateMediaItem[];
  scheduledFor?: string; // ISO 8601 format
  profileId?: string;
  addToQueue?: boolean;
}

export interface LatePostResponse {
  id: string;
  content: string;
  status: "scheduled" | "published" | "failed" | "draft";
  platforms: LatePlatformConfig[];
  scheduledFor?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LateAccount {
  _id: string;
  id?: string;
  platform: string;
  username: string;
  displayName?: string;
  profileId: string;
  profilePicture?: string;
  isActive: boolean;
  tokenExpiresAt?: string;
  permissions?: string[];
}

export interface LateProfile {
  id: string;
  name: string;
  accounts: LateAccount[];
}

export interface LateUser {
  id: string;
  email: string;
  name: string;
  profiles: LateProfile[];
}

class LateAPIClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || LATE_API_KEY || "";
    this.baseUrl = LATE_API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Check if API key is available
    if (!this.apiKey) {
      console.error("❌ Late API: No API key available");
      throw new Error("Late API key is not configured. Please set LATE_API_KEY in .env.local");
    }
    
    const headers = {
      "Authorization": `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    console.log(`🌐 Late API Request: ${options.method || 'GET'} ${url}`);
    console.log(`🔑 Using API key: ${this.apiKey.substring(0, 10)}...`);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(`📡 Late API Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Late API Error:", errorData);
      throw new Error(
        errorData.message || `Late API error: ${response.status} ${response.statusText}`
      );
    }

    const jsonResponse = await response.json();
    console.log(`📦 Late API JSON Response:`, JSON.stringify(jsonResponse, null, 2));
    
    return jsonResponse;
  }

  /**
   * Create and schedule a post
   */
  async createPost(data: CreatePostRequest): Promise<LatePostResponse> {
    console.log("🚀 createPost called with:", JSON.stringify(data, null, 2));
    const result = await this.request<LatePostResponse>("/posts", {
      method: "POST",
      body: JSON.stringify(data),
    });
    console.log("🎯 createPost returning:", JSON.stringify(result, null, 2));
    return result;
  }

  /**
   * Get all posts (with pagination support)
   * Late.dev returns: { posts: [...], pagination: {...} }
   */
  async getPosts(params?: {
    page?: number;
    limit?: number;
    status?: string;
    platform?: string;
    profileId?: string;
  }): Promise<LatePostResponse[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    const response = await this.request<{ posts: LatePostResponse[]; pagination?: any }>(
      `/posts${query ? `?${query}` : ""}`
    );
    
    // Late.dev API returns { posts: [...] }
    return response.posts || [];
  }

  /**
   * Get a specific post by ID
   */
  async getPost(postId: string): Promise<LatePostResponse> {
    return this.request<LatePostResponse>(`/posts/${postId}`);
  }

  /**
   * Update a post
   */
  async updatePost(postId: string, data: Partial<CreatePostRequest>): Promise<LatePostResponse> {
    return this.request<LatePostResponse>(`/posts/${postId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a post
   */
  async deletePost(postId: string): Promise<void> {
    return this.request<void>(`/posts/${postId}`, {
      method: "DELETE",
    });
  }

  /**
   * Get connected accounts
   * Uses the /v1/accounts endpoint to fetch all connected social media accounts
   */
  async getAccounts(profileId?: string): Promise<LateAccount[]> {
    try {
      const endpoint = profileId 
        ? `/accounts?profileId=${profileId}` 
        : "/accounts";
      
      const response = await this.request<{ accounts: LateAccount[] }>(endpoint);
      
      // Transform the response to ensure consistent format
      return response.accounts.map((acc: any) => ({
        id: acc._id || acc.id,
        _id: acc._id || acc.id,
        platform: acc.platform,
        username: acc.username || acc.displayName,
        displayName: acc.displayName,
        profileId: acc.profileId?._id || acc.profileId?.id || acc.profileId,
        profilePicture: acc.profilePicture,
        isActive: acc.isActive !== false,
        tokenExpiresAt: acc.tokenExpiresAt,
        permissions: acc.permissions,
      }));
    } catch (error) {
      console.error("Error fetching accounts:", error);
      throw error;
    }
  }

  /**
   * Get users (team members) and their profiles
   */
  async getUsers(): Promise<LateUser[]> {
    return this.request<LateUser[]>("/users");
  }

  /**
   * Get profiles
   * Late.dev returns: { profiles: [...] }
   */
  async getProfiles(): Promise<LateProfile[]> {
    const response = await this.request<{ profiles: any[] }>("/profiles");
    
    // Transform the response to ensure consistent format
    return response.profiles.map((profile: any) => ({
      id: profile._id || profile.id,
      name: profile.name,
      accounts: profile.accounts || [],
    }));
  }

  /**
   * Get queue schedule for a profile
   */
  async getQueueSlots(profileId: string): Promise<any> {
    return this.request<any>(`/queue/slots?profileId=${profileId}`);
  }

  /**
   * Create or update queue schedule
   */
  async updateQueueSlots(data: {
    profileId: string;
    timezone: string;
    slots: Array<{ dayOfWeek: number; time: string }>;
    active: boolean;
    reshuffleExisting?: boolean;
  }): Promise<any> {
    return this.request<any>("/queue/slots", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete queue schedule
   */
  async deleteQueueSlots(profileId: string): Promise<void> {
    return this.request<void>(`/queue/slots?profileId=${profileId}`, {
      method: "DELETE",
    });
  }

  /**
   * Preview upcoming queue slots
   */
  async previewQueueSlots(profileId: string, count: number = 20): Promise<any> {
    return this.request<any>(`/queue/preview?profileId=${profileId}&count=${count}`);
  }

  /**
   * Get next available queue slot
   */
  async getNextQueueSlot(profileId: string): Promise<{
    profileId: string;
    nextSlot: string;
    timezone: string;
  }> {
    return this.request<any>(`/queue/next-slot?profileId=${profileId}`);
  }

  /**
   * Get analytics for posts
   */
  async getAnalytics(params?: {
    postId?: string;
    platform?: string;
    profileId?: string;
    fromDate?: string;
    toDate?: string;
    limit?: number;
    page?: number;
    sortBy?: "date" | "engagement";
    order?: "asc" | "desc";
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return this.request<any>(`/analytics${query ? `?${query}` : ""}`);
  }
}

// Export singleton instance
export const lateAPI = new LateAPIClient();

// Export class for custom instances
export default LateAPIClient;
