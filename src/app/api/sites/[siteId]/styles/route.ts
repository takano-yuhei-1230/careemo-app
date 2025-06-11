import { NextResponse } from 'next/server';
import { getDB } from '@/lib/DB';
import { Style, CreateStylePayload, UpdateStylePayload } from '@/types/style';

interface RouteContext {
  params: {
    siteId: string;
  };
}

export async function POST(request: Request, { params }: RouteContext) {
  const db = await getDB();
  const siteId = parseInt(params.siteId, 10);
  if (isNaN(siteId)) {
    return NextResponse.json({ message: 'Invalid site ID' }, { status: 400 });
  }

  const body = (await request.json()) as CreateStylePayload;
  const { css_content } = body;

  if (!css_content) {
    return NextResponse.json({ message: 'No valid fields to create' }, { status: 400 });
  }

  const existingStyle = await db.prepare('SELECT id FROM Styles WHERE site_id = ?').bind(siteId).first();
  if (existingStyle) {
    return NextResponse.json({ message: 'スタイルが既に作成されています' }, { status: 400 });
  }

  const stmt = db.prepare('INSERT INTO Styles (site_id, css_content) VALUES (?, ?)');
  const info = await stmt.bind(siteId, css_content).run();

  if (!info.success || info.meta.last_row_id == null) {
    console.error('Failed to insert style or get last_row_id:', info.error || 'Unknown D1 error');
    return NextResponse.json({ message: 'Failed to create style' }, { status: 500 });
  }

  const lastRowId = info.meta.last_row_id;
  const style = await db.prepare('SELECT * FROM Styles WHERE id = ?').bind(lastRowId).first<Style>();

  if (!style) {
    return NextResponse.json({ message: 'Failed to retrieve style after creation' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Style created successfully' }, { status: 201 });
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const db = await getDB();
    const siteId = parseInt(params.siteId, 10);
    const body = (await request.json()) as UpdateStylePayload;
    const { css_content } = body;

    if (!css_content) {
      return NextResponse.json({ message: 'No valid fields to update' }, { status: 400 });
    }

    const stmt = db.prepare('UPDATE Styles SET css_content = ? WHERE site_id = ?');
    const info = await stmt.bind(css_content, siteId).run();

    if (!info.success) {
      console.error('Failed to update style:', info.error || 'Unknown D1 error');
      return NextResponse.json({ message: 'Failed to update style' }, { status: 500 });
    }

    if (info.meta.changes === 0) {
      return NextResponse.json({ message: 'No changes made to style' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Style updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating style:', error);
    return NextResponse.json({ message: 'Failed to update style' }, { status: 500 });
  }
}
