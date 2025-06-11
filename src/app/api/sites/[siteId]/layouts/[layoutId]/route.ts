import { NextResponse } from 'next/server';
import type { Layout, UpdateLayoutPayload } from '@/types/layout';
import { getDB } from '@/lib/DB';

interface RouteContext {
  params: {
    siteId: string;
    layoutId: string;
  };
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const db = await getDB();
    const siteId = parseInt(params.siteId, 10);
    const layoutId = parseInt(params.layoutId, 10);

    if (isNaN(siteId) || isNaN(layoutId)) {
      return NextResponse.json({ message: 'Invalid site ID or layout ID' }, { status: 400 });
    }

    const stmt = db.prepare(
      'SELECT id, site_id, name, html_content, created_at, updated_at, deleted_at FROM Layouts WHERE id = ? AND site_id = ? AND deleted_at IS NULL',
    );
    const layout = await stmt.bind(layoutId, siteId).first<Layout>();

    if (!layout) {
      return NextResponse.json({ message: 'Layout not found' }, { status: 404 });
    }

    return NextResponse.json(layout);
  } catch (error) {
    console.error(`Error fetching layout ${params.layoutId} for site ${params.siteId}:`, error);
    return NextResponse.json({ message: 'Failed to fetch layout' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const db = await getDB();
    const siteId = parseInt(params.siteId, 10);
    const layoutId = parseInt(params.layoutId, 10);

    if (isNaN(siteId) || isNaN(layoutId)) {
      return NextResponse.json({ message: 'Invalid site ID or layout ID' }, { status: 400 });
    }

    const body = (await request.json()) as UpdateLayoutPayload;
    const { html_content } = body;

    if (!html_content) {
      return NextResponse.json({ message: 'No valid fields to update' }, { status: 400 });
    }

    const stmt = db.prepare(
      'UPDATE Layouts SET html_content = ? WHERE id = ? AND site_id = ? AND deleted_at IS NULL',
    );
    const info = await stmt.bind(html_content, layoutId, siteId).run();

    if (!info.success) {
      console.error(`Failed to update layout ${layoutId}:`, info.error || 'Unknown D1 error during layout update');
      return NextResponse.json({ message: 'Failed to update layout' }, { status: 500 });
    }

    if (info.meta.changes === 0) {
      return NextResponse.json({ message: 'No changes made to layout' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Layout updated successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error updating layout ${params.layoutId} for site ${params.siteId}:`, error);
    return NextResponse.json({ message: 'Failed to update layout' }, { status: 500 });
  }
}
