import { NextResponse } from 'next/server';
import type { Page, CreatePagePayload } from '@/types/page'; // Page関連の型をインポート
import { getDB } from '@/lib/DB';
import { revalidatePath } from 'next/cache';

interface RouteContext {
  params: {
    siteId: string; // URLからsiteIdを取得
  };
}

// GET: 特定サイトのページ一覧を取得
export async function GET(request: Request, { params }: RouteContext) {
  try {
    const DB = await getDB();
    const siteId = parseInt(params.siteId, 10);

    if (isNaN(siteId)) {
      return NextResponse.json({ message: '無効なサイトIDです。' }, { status: 400 });
    }

    // サイトの存在確認 (任意だが、より親切)
    const siteExistsStmt = DB.prepare('SELECT id FROM Sites WHERE id = ? AND deleted_at IS NULL');
    const site = await siteExistsStmt.bind(siteId).first();
    if (!site) {
      return NextResponse.json({ message: '指定されたサイトが見つかりません。' }, { status: 404 });
    }

    const stmt = DB.prepare(
      'SELECT id, site_id, slug, title, html_content, created_at, updated_at FROM Pages WHERE site_id = ? AND deleted_at IS NULL ORDER BY created_at DESC',
    );
    const { results } = await stmt.bind(siteId).all<Page>();

    return NextResponse.json(results || []);
  } catch (error) {
    console.error(`Error fetching pages for site ${params.siteId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'ページ一覧の取得に失敗しました。';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

// POST: 特定サイトに新しいページを作成
export async function POST(request: Request, { params }: RouteContext) {
  try {
    const DB = await getDB();
    const siteIdFromParams = parseInt(params.siteId, 10);

    if (isNaN(siteIdFromParams)) {
      return NextResponse.json({ message: '無効なサイトIDです。' }, { status: 400 });
    }

    const body = (await request.json()) as CreatePagePayload;
    // site_id はURLパラメータとボディで一致確認 (またはURLパラメータを正とする)
    if (body.site_id !== undefined && body.site_id !== siteIdFromParams) {
      return NextResponse.json(
        { message: 'URLのサイトIDとリクエストボディのsite_idが一致しません。' },
        { status: 400 },
      );
    }
    const site_id = siteIdFromParams; // URLパラメータを正とする
    const { slug, title, html_content, description, status } = body;

    if (!slug || !title) {
      return NextResponse.json({ message: 'slug と title は必須です。' }, { status: 400 });
    }

    // サイトの存在確認
    const siteExistsStmt = DB.prepare('SELECT id FROM Sites WHERE id = ? AND deleted_at IS NULL');
    const existingSite = await siteExistsStmt.bind(site_id).first();
    if (!existingSite) {
      return NextResponse.json({ message: 'ページを作成する対象のサイトが見つかりません。' }, { status: 404 });
    }

    const insertStmt = DB.prepare(
      'INSERT INTO Pages (site_id, slug, title, html_content, description, status) VALUES (?, ?, ?, ?, ?, ?)',
    );
    const info = await insertStmt.bind(site_id, slug, title, html_content, description, status).run();

    if (!info.success || info.meta.last_row_id == null) {
      console.error('Failed to insert page or get last_row_id:', info.error || 'Unknown D1 error');
      return NextResponse.json(
        { message: 'ページの作成に失敗しました。slugが既に存在する可能性があります。' },
        { status: 500 },
      );
    }

    const lastRowId = info.meta.last_row_id;
    const selectStmt = DB.prepare(
      'SELECT id, site_id, slug, title, html_content, created_at, updated_at, description, status FROM Pages WHERE id = ? AND deleted_at IS NULL',
    );
    const newPage = await selectStmt.bind(lastRowId).first<Page>();

    if (!newPage) {
      console.error('Failed to fetch the newly created page with id:', lastRowId);
      return NextResponse.json({ message: 'ページ作成後、データの取得に失敗しました。' }, { status: 500 });
    }

    // ページ作成後、ページ一覧を最新状態にする
    revalidatePath(`/admin/sites/${siteIdFromParams}`);

    return NextResponse.json(newPage, { status: 201 });
  } catch (error) {
    console.error(`Error creating page for site ${params.siteId}:`, error);
    let errorMessage = 'ページの作成に失敗しました。';
    if (error instanceof Error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        errorMessage = '指定されたslugはこのサイト内に既に存在します。';
        return NextResponse.json({ message: errorMessage }, { status: 409 });
      }
      errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
