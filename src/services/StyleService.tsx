import { getDB } from '@/lib/DB';
import { Style } from '@/types/style';

export async function getStyle(siteId: number): Promise<Style | null> {
  const DB = await getDB();
  const stmt = DB.prepare(
    'SELECT id, site_id, css_content, created_at, updated_at FROM Styles WHERE site_id = ? AND deleted_at IS NULL',
  );
  const style = (await stmt.bind(siteId).first()) as Style | null;
  return style || null;
}
