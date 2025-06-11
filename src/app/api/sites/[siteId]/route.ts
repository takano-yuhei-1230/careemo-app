import { NextResponse } from 'next/server';
import type { Site, UpdateSitePayload } from '@/types/site'; // 型定義をインポート
import { getDB } from '@/lib/DB';

interface RouteParams {
  params: {
    siteId: string;
  };
}

// GET: 特定のサイト情報を取得
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const DB = await getDB();
    const siteId = parseInt(params.siteId, 10);

    if (isNaN(siteId)) {
      return NextResponse.json({ message: '無効なサイトIDです。' }, { status: 400 });
    }

    const stmt = DB.prepare(
      'SELECT id, slug, name, status, created_at, updated_at FROM Sites WHERE id = ? AND deleted_at IS NULL',
    );
    const site = await stmt.bind(siteId).first<Site>();

    if (!site) {
      return NextResponse.json({ message: 'サイトが見つかりません。' }, { status: 404 });
    }
    return NextResponse.json(site);
  } catch (error) {
    console.error(`Error fetching site ${params.siteId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'サイト情報の取得に失敗しました。';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

// PUT: 特定のサイト情報を更新
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const DB = await getDB();
    const siteId = parseInt(params.siteId, 10);

    if (isNaN(siteId)) {
      return NextResponse.json({ message: '無効なサイトIDです。' }, { status: 400 });
    }

    const body = (await request.json()) as UpdateSitePayload;
    const { slug, name, status } = body;

    if (!slug && !name && !status) {
      return NextResponse.json({ message: '更新するデータがありません。' }, { status: 400 });
    }
    if (status && status !== 'draft' && status !== 'published' && status !== 'private') {
      return NextResponse.json(
        { message: 'status は "draft" または "published" または "private" である必要があります。' },
        { status: 400 },
      );
    }

    // 更新対象の項目と値を動的に構築
    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (slug) {
      updates.push('slug = ?');
      values.push(slug);
    }
    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (status) {
      updates.push('status = ?');
      values.push(status);
    }
    // updated_at はトリガーで自動更新される想定

    if (updates.length === 0) {
      return NextResponse.json({ message: '更新する有効なデータがありません。' }, { status: 400 });
    }

    values.push(siteId); // WHERE句用の siteId

    const stmt = DB.prepare(`UPDATE Sites SET ${updates.join(', ')} WHERE id = ? AND deleted_at IS NULL`);
    const info = await stmt.bind(...values).run();

    if (!info.success) {
      console.error(`Failed to update site ${siteId}:`, info.error || 'Unknown D1 error during update');
      // slugのユニーク制約違反の可能性も考慮
      const errorMessageFromError = (info.error as any)?.message as string | undefined; // エラーメッセージを安全に取得
      if (errorMessageFromError && errorMessageFromError.includes('UNIQUE constraint failed')) {
        return NextResponse.json({ message: '指定されたslugは既に他のサイトで使用されています。' }, { status: 409 });
      }
      return NextResponse.json({ message: 'サイト情報の更新に失敗しました。' }, { status: 500 });
    }
    if (info.meta.changes === 0) {
      return NextResponse.json({ message: '更新対象のサイトが見つからないか、既に同じ内容です。' }, { status: 404 });
    }

    // 更新後のデータを取得して返す
    const selectStmt = DB.prepare(
      'SELECT id, slug, name, status, created_at, updated_at FROM Sites WHERE id = ? AND deleted_at IS NULL',
    );
    const updatedSite = await selectStmt.bind(siteId).first<Site>();

    if (!updatedSite) {
      return NextResponse.json({ message: 'サイト更新後、データの再取得に失敗しました。' }, { status: 404 });
    }

    return NextResponse.json(updatedSite);
  } catch (error) {
    console.error(`Error updating site ${params.siteId}:`, error);
    let errorMessage = 'サイト情報の更新中にエラーが発生しました。';
    if (error instanceof Error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        errorMessage = '指定されたslugは既に他のサイトで使用されています。';
        return NextResponse.json({ message: errorMessage }, { status: 409 });
      }
      errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

// DELETE: 特定のサイトを削除 (ソフトデリート)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const DB = await getDB();
    const siteId = parseInt(params.siteId, 10);

    if (isNaN(siteId)) {
      return NextResponse.json({ message: '無効なサイトIDです。' }, { status: 400 });
    }

    // トランザクションを開始 (関連するページもソフトデリートするため)
    const batch: D1PreparedStatement[] = [];

    // 1. Sitesテーブルの対象サイトをソフトデリート
    batch.push(
      DB.prepare("UPDATE Sites SET deleted_at = datetime('now') WHERE id = ? AND deleted_at IS NULL").bind(siteId),
    );
    // 2. Pagesテーブルの関連するページもソフトデリート
    batch.push(
      DB.prepare("UPDATE Pages SET deleted_at = datetime('now') WHERE site_id = ? AND deleted_at IS NULL").bind(siteId),
    );

    const results = await DB.batch(batch);

    // 最初のSitesテーブルの更新結果を確認
    const siteUpdateResult = results[0];
    if (!siteUpdateResult.success) {
      console.error(
        `Failed to soft delete site ${siteId}:`,
        siteUpdateResult.error || 'Unknown D1 error during site soft delete',
      );
      return NextResponse.json({ message: 'サイトの削除に失敗しました。' }, { status: 500 });
    }
    if (siteUpdateResult.meta.changes === 0) {
      return NextResponse.json(
        { message: '削除対象のサイトが見つからないか、既に削除されています。' },
        { status: 404 },
      );
    }

    // Pagesの更新結果はここでは特にチェックしない (エラーがあればbatch全体が失敗するはず)

    return NextResponse.json({ message: `サイト (ID: ${siteId}) および関連ページを削除しました。` }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting site ${params.siteId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'サイトの削除中にエラーが発生しました。';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
