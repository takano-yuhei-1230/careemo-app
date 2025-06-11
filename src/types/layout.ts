export interface Layout {
  id: number;
  site_id: number;
  name: string;
  html_content: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLayoutPayload {
  site_id: number;
  name: string;
  html_content: string;
}

export interface UpdateLayoutPayload {
  html_content?: string;
}
