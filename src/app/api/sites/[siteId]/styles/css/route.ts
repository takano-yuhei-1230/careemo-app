import { NextResponse } from 'next/server';
import { getDB } from '@/lib/DB';

// フロントエンドからCSSを取得するためのAPI
export async function GET(request: Request, { params }: { params: { siteId: string } }) {
  const db = await getDB();
  const siteId = parseInt(params.siteId, 10);
  const style = await db.prepare('SELECT css_content FROM Styles WHERE site_id = ?').bind(siteId).first();

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
