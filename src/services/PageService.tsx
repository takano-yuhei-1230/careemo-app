import { Page } from '@/types/page';
import { getSiteId } from './SiteService';
import { getDB } from '@/lib/DB';

export async function getPage(pageId: number): Promise<Page | null> {
  const DB = await getDB();
  const stmt = DB.prepare(
    'SELECT id, title, slug, html_content, created_at, updated_at, status, description FROM Pages WHERE id = ? AND deleted_at IS NULL',
  );
  const page = (await stmt.bind(pageId).first()) as Page | null;
  return page || null;
}

export async function getPages(siteId: number): Promise<Page[]> {
  try {
    const DB = await getDB();
    const stmt = DB.prepare(
      'SELECT id, title, slug, html_content, created_at, updated_at, status, description FROM Pages WHERE site_id = ? AND deleted_at IS NULL',
    );
    const dbResult = await stmt.bind(siteId).all();
    const pages = dbResult.results.map((result: any) => result);
    return pages;
  } catch (error) {
    console.error('Error fetching pages:', error);
    return [];
  }
}

export async function getPageBySlug(siteSlug: string, pageSlug: string): Promise<Page | null> {
  const DB = await getDB();
  const siteId = await getSiteId(siteSlug);
  if (!siteId) {
    return null;
  }
  const stmt = DB.prepare(
    'SELECT id, title, slug, html_content, created_at, updated_at, status, description FROM Pages WHERE site_id = ? AND slug = ? AND deleted_at IS NULL',
  );
  const page = (await stmt.bind(siteId, pageSlug).first()) as Page | null;
  return page || null;
}
