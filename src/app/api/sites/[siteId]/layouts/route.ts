import { NextResponse } from 'next/server';
import { getDB } from '@/lib/DB';
import type { Layout, CreateLayoutPayload } from '@/types/layout';

interface RouteContext {
  params: {
    siteId: string;
  };
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const DB = await getDB();
    const siteId = parseInt(params.siteId, 10);

    if (isNaN(siteId)) {
      return NextResponse.json({ message: 'Invalid site ID' }, { status: 400 });
    }

    const body = (await request.json()) as CreateLayoutPayload;
    if (body.site_id !== undefined && body.site_id !== siteId) {
      return NextResponse.json({ message: 'URLのサイトIDとリクエストボディのsite_idが一致しません。' }, { status: 400 });
    }
    const { name, html_content } = body;

    if (!name || !html_content) {
      return NextResponse.json({ message: '名前とHTMLコンテンツが必要です' }, { status: 400 });
    }

    // 同名のレイアウトが存在するか確認
    const existingLayout = await DB.prepare('SELECT id FROM Layouts WHERE site_id = ? AND name = ?')
      .bind(siteId, name)
      .first();
    if (existingLayout) {
      return NextResponse.json({ message: '同名のレイアウトが既に作成されています' }, { status: 400 });
    }

    const insertStmt = DB.prepare('INSERT INTO Layouts (site_id, name, html_content) VALUES (?, ?, ?)');
    const info = await insertStmt.bind(siteId, name, html_content).run();

    if (!info.success || info.meta.last_row_id == null) {
      console.error('Failed to insert layout or get last_row_id:', info.error || 'Unknown D1 error');
      return NextResponse.json({ message: 'Failed to create layout' }, { status: 500 });
    }

    const lastRowId = info.meta.last_row_id;
    const layout = await DB.prepare('SELECT * FROM Layouts WHERE id = ?').bind(lastRowId).first<Layout>();

    if (!layout) {
      return NextResponse.json({ message: 'Failed to retrieve layout after creation' }, { status: 500 });
    }

    return NextResponse.json(layout, { status: 201 });
  } catch (error) {
    console.error('Error creating layout:', error);
    return NextResponse.json({ message: 'Failed to create layout' }, { status: 500 });
  }
}
