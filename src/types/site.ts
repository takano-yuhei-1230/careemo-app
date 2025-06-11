export interface Site {
  id: number;
  slug: string;
  name: string;
  status: 'draft' | 'published' | 'private';
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateSitePayload {
  slug: string;
  name: string;
  status?: 'draft' | 'published' | 'private';
}

export interface UpdateSitePayload {
  slug?: string;
  name?: string;
  status?: 'draft' | 'published' | 'private';
}

export interface DeleteSitePayload {
  id: number;
}
