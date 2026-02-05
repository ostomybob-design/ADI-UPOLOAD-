import { DraftPost, SearchResult } from "@/app/dashboard/columns";

const DRAFTS_STORAGE_KEY = "post_drafts";

export const draftUtils = {
  // Get all drafts from localStorage
  getAllDrafts: (): DraftPost[] => {
    if (typeof window === "undefined") return [];
    
    try {
      const drafts = localStorage.getItem(DRAFTS_STORAGE_KEY);
      return drafts ? JSON.parse(drafts) : [];
    } catch (error) {
      console.error("Error reading drafts from localStorage:", error);
      return [];
    }
  },

  // Save a draft to localStorage
  saveDraft: (draft: Omit<DraftPost, "id" | "created_at" | "updated_at">): string => {
    if (typeof window === "undefined") return "";

    const drafts = draftUtils.getAllDrafts();
    const draftId = `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const newDraft: DraftPost = {
      ...draft,
      id: draftId,
      created_at: now,
      updated_at: now,
    };

    drafts.push(newDraft);
    
    try {
      localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
      return draftId;
    } catch (error) {
      console.error("Error saving draft to localStorage:", error);
      return "";
    }
  },

  // Update an existing draft
  updateDraft: (draftId: string, updates: Partial<DraftPost>): boolean => {
    if (typeof window === "undefined") return false;

    const drafts = draftUtils.getAllDrafts();
    const draftIndex = drafts.findIndex(d => d.id === draftId);
    
    if (draftIndex === -1) return false;

    drafts[draftIndex] = {
      ...drafts[draftIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    try {
      localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
      return true;
    } catch (error) {
      console.error("Error updating draft in localStorage:", error);
      return false;
    }
  },

  // Delete a draft
  deleteDraft: (draftId: string): boolean => {
    if (typeof window === "undefined") return false;

    const drafts = draftUtils.getAllDrafts();
    const filteredDrafts = drafts.filter(d => d.id !== draftId);
    
    try {
      localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(filteredDrafts));
      return true;
    } catch (error) {
      console.error("Error deleting draft from localStorage:", error);
      return false;
    }
  },

  // Get a specific draft by ID
  getDraft: (draftId: string): DraftPost | null => {
    const drafts = draftUtils.getAllDrafts();
    return drafts.find(d => d.id === draftId) || null;
  },

  // Convert draft to SearchResult format for table display
  draftToSearchResult: (draft: DraftPost): SearchResult => {
    return {
      id: parseInt(draft.id.replace("draft_", "")) || 0,
      title: draft.caption.substring(0, 100) || "Untitled Draft",
      url: `draft://${draft.id}`,
      snippet: draft.caption.substring(0, 250) || null,
      position: 0,
      date: null,
      search_query: null,
      posted_on_instagram: draft.postOnInstagram,
      posted_on_facebook: draft.postOnFacebook,
      instagram_posted_at: null,
      facebook_posted_at: null,
      raw_data: null,
      created_at: draft.created_at,
      updated_at: draft.updated_at,
      html_content: null,
      content_extraction_date: null,
      ai_caption: draft.caption,
      ai_hashtags: draft.hashtags,
      ai_summary: null,
      content_processed: true, // Set to true so it shows up in pending
      main_image_url: draft.imagePreview,
      additional_images: null,
      is_draft: true,
      approval_status: "pending", // Drafts appear as pending
    };
  },
};