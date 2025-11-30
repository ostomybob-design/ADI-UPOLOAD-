export interface PostData {
  id?: number;
  caption: string;
  hashtags: string;
  imageUrl?: string;
  status: PostStatus;
  isSaved: boolean;
  postOnInstagram: boolean;
  postOnFacebook: boolean;
  scheduledDate?: string;
}

export type PostStatus = 
  | 'draft' 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'scheduled' 
  | 'published';
