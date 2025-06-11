import { Site } from '@/types/site';
import { getDB } from '@/lib/DB';

export async function getSites(): Promise<Site[]> {
  try {
    const DB = await getDB();
    const stmt = DB.prepare(
      'SELECT id, name, slug, status, created_at, updated_at FROM Sites WHERE deleted_at IS NULL',
    );
    const dbResult = await stmt.all();
    const sites = dbResult.results.map((result: any) => ({
      id: result.id,
      name: result.name,
      slug: result.slug,
      status: result.status,
      created_at: result.created_at,
      updated_at: result.updated_at,
    }));
    return sites;
  } catch (error) {
    console.error('Error fetching sites:', error);
    return [];
  }
}

export async function getSite(siteId: number): Promise<Site | null> {
  try {
    const DB = await getDB();
    const stmt = DB.prepare(
      'SELECT id, name, slug, status, created_at, updated_at FROM Sites WHERE id = ? AND deleted_at IS NULL',
    );
    const site = (await stmt.bind(siteId).first()) as Site | null;
    return site || null;
  } catch (error) {
    console.error('Error fetching site details:', error);
    return null;
  }
}

export async function getSiteId(siteSlug: string): Promise<number | null> {
  try {
    const DB = await getDB();
    const stmt = DB.prepare('SELECT id FROM Sites WHERE slug = ? AND deleted_at IS NULL');
    const result = await stmt.bind(siteSlug).first();
    return (result?.id as number) || null;
  } catch (error) {
    console.error('Error fetching site ID:', error);
    return null;
  }
}

export async function getSiteBySlug(siteSlug: string): Promise<Site | null> {
  try {
    const DB = await getDB();
    const stmt = DB.prepare(
      'SELECT id, name, slug, status, created_at, updated_at FROM Sites WHERE slug = ? AND deleted_at IS NULL',
    );
    const result = await stmt.bind(siteSlug).first();
    return result as Site | null;
  } catch (error) {
    console.error('Error fetching site by slug:', error);
    return null;
  }
}
