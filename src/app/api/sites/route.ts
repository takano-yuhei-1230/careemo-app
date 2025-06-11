import { NextResponse } from 'next/server';
import { Site, CreateSitePayload } from '@/types/site';
import { getDB } from '@/lib/DB';

// GET: サイト一覧を取得
export async function GET(request: Request) {
  try {
    const DB = await getDB();

    const stmt = DB.prepare(
      'SELECT id, slug, name, status, created_at, updated_at FROM Sites WHERE deleted_at IS NULL ORDER BY created_at DESC',
    );
    const { results } = await stmt.all<Site>();

    return NextResponse.json(results || []);
  } catch (error) {
    console.error('Error fetching sites:', error);
    const errorMessage = error instanceof Error ? error.message : 'サイト一覧の取得に失敗しました。';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

// POST: 新しいサイトを作成
export async function POST(request: Request) {
  try {
    const DB = await getDB();
    const body = (await request.json()) as CreateSitePayload;
    const { slug, name } = body;
    const status = body.status || 'draft';

    if (!slug || !name) {
      return NextResponse.json({ message: 'slug と name は必須です。' }, { status: 400 });
    }
    if (status !== 'draft' && status !== 'published' && status !== 'private') {
      return NextResponse.json(
        { message: 'status は "draft", "published", "private" のいずれかである必要があります。' },
        { status: 400 },
      );
    }

    const insertStmt = DB.prepare('INSERT INTO Sites (slug, name, status) VALUES (?, ?, ?)');
    const info = await insertStmt.bind(slug, name, status).run();

    if (!info.success || info.meta.last_row_id == null) {
      console.error('Failed to insert site or get last_row_id:', info.error || 'Unknown D1 error');
      return NextResponse.json(
        { message: 'サイトの作成に失敗しました。slugが既に存在する可能性があります。' },
        { status: 500 },
      );
    }

    const lastRowId = info.meta.last_row_id;
    const selectStmt = DB.prepare(
      'SELECT id, slug, name, status, created_at, updated_at FROM Sites WHERE id = ? AND deleted_at IS NULL',
    );
    const newSite = await selectStmt.bind(lastRowId).first<Site>();

    if (!newSite) {
      console.error('Failed to fetch the newly created site with id:', lastRowId);
      return NextResponse.json({ message: 'サイト作成後、データの取得に失敗しました。' }, { status: 500 });
    }

    // 新規作成したサイトIDでトップページ, デフォルトレイアウト, デフォルトスタイルを作成
    const indexPageSlug = 'index';
    const indexPageTitle = newSite.name;
    const indexPageContent = '<!-- INDEX PAGE -->';
    const indexPageStatus = 'draft';

    const indexPageInsertStmt = DB.prepare(
      'INSERT INTO Pages (site_id, slug, title, html_content, status) VALUES (?, ?, ?, ?, ?)',
    );
    await indexPageInsertStmt.bind(newSite.id, indexPageSlug, indexPageTitle, indexPageContent, indexPageStatus).run();

    const headerLayoutName = 'header';
    const headerLayoutContent = '<!-- HEADER -->';
    const headerLayoutInsertStmt = DB.prepare('INSERT INTO Layouts (site_id, name, html_content) VALUES (?, ?, ?)');
    await headerLayoutInsertStmt.bind(newSite.id, headerLayoutName, headerLayoutContent).run();

    const footerLayoutName = 'footer';
    const footerLayoutContent = '<!-- FOOTER -->';
    const footerLayoutInsertStmt = DB.prepare('INSERT INTO Layouts (site_id, name, html_content) VALUES (?, ?, ?)');
    await footerLayoutInsertStmt.bind(newSite.id, footerLayoutName, footerLayoutContent).run();

    const defaultStyleContent = '/* CSS */';
    const defaultStyleInsertStmt = DB.prepare('INSERT INTO Styles (site_id, css_content) VALUES (?, ?)');
    await defaultStyleInsertStmt.bind(newSite.id, defaultStyleContent).run();
    // D1がトランザクション未対応＆ページは後からでも作成可能なためここでのエラーチェックは省略

    return NextResponse.json(newSite, { status: 201 });
  } catch (error) {
    console.error('Error creating site:', error);
    let errorMessage = 'サイトの作成に失敗しました。';
    if (error instanceof Error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        errorMessage = '指定されたslugは既に存在します。';
        return NextResponse.json({ message: errorMessage }, { status: 409 });
      }
      errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
