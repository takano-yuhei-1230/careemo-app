export interface Style {
  id: number;
  site_id: number;
  css_content: string;
  created_at: string;
  updated_at: string;
}

export interface CreateStylePayload {
  site_id: number;
  css_content: string;
}

export interface UpdateStylePayload {
  css_content?: string;
}
