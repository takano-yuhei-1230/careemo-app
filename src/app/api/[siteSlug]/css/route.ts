import { NextResponse } from 'next/server';
import { getDB } from '@/lib/DB';
import { getSiteBySlug } from '@/services/SiteService';

// フロントエンドからCSSを取得するためのAPI
export async function GET(request: Request, { params }: { params: { siteSlug: string } }) {
  const db = await getDB();
  const site = await getSiteBySlug(params.siteSlug);
  if (!site) {
    return new NextResponse('', { status: 404 });
  }

  const style = await db.prepare('SELECT css_content FROM Styles WHERE site_id = ?').bind(site.id).first();

  if (!style) {
    return new NextResponse('', { status: 404 });
  }

  const css = style.css_content as string;

  return new NextResponse(css, {
    status: 200,
    headers: {
      'Content-Type': 'text/css; charset=utf-8',
      'Cache-Control': 'no-store', // 必要に応じてキャッシュ制御
    },
  });
}
