import { getDB } from '@/lib/DB';
import { Layout } from '@/types/layout';

export async function getLayout(layoutId: number): Promise<Layout | null> {
  const DB = await getDB();
  const stmt = DB.prepare(
    'SELECT id, site_id, name, html_content, created_at, updated_at FROM Layouts WHERE id = ? AND deleted_at IS NULL',
  );
  const layout = (await stmt.bind(layoutId).first()) as Layout | null;
  return layout || null;
}

export async function getLayoutByName(siteId: number, name: string): Promise<Layout | null> {
  const DB = await getDB();
  const stmt = (await DB).prepare(
    'SELECT id, site_id, name, html_content, created_at, updated_at FROM Layouts WHERE site_id = ? AND name = ? AND deleted_at IS NULL',
  );
  const layout = (await stmt.bind(siteId, name).first()) as Layout | null;
  return layout || null;
}
