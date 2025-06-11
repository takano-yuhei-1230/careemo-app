export interface Page {
  id: number;
  site_id: number;
  slug: string;
  title: string;
  html_content?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  status: 'draft' | 'published' | 'private';
  description?: string | null;
}

export interface CreatePagePayload {
  site_id: number;
  slug: string;
  title: string;
  html_content?: string;
  status: 'draft' | 'published' | 'private';
  description?: string;
}

export interface UpdatePagePayload {
  slug?: string;
  title?: string;
  html_content?: string;
  status?: 'draft' | 'published' | 'private';
  description?: string;
}
