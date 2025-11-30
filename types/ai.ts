export interface CaptionVariation {
  id: string;
  caption: string;
  tone: 'professional' | 'casual' | 'empathetic' | 'inspirational' | 'educational';
}

export interface RewriteRequest {
  caption: string;
  context?: {
    hashtags?: string;
    platform?: 'instagram' | 'facebook' | 'both';
  };
}

export interface RewriteResponse {
  success: boolean;
  variations: CaptionVariation[];
  error?: string;
}

export interface EditRequest {
  instruction: string;
  caption?: string;
  context?: {
    hashtags?: string;
    platform?: 'instagram' | 'facebook' | 'both';
  };
}

export interface EditResponse {
  success: boolean;
  editedCaption: string;
  explanation?: string;
  error?: string;
}

export interface AIEditorState {
  isRewriting: boolean;
  isEditing: boolean;
  variations: CaptionVariation[];
  selectedVariation: string | null;
  customInstruction: string;
  includeCaption: boolean;
  error: string | null;
}
