import { NextResponse } from 'next/server';
import type { Page, UpdatePagePayload } from '@/types/page'; // Page関連の型をインポート
import { getDB } from '@/lib/DB';
import { revalidatePath } from 'next/cache';
interface RouteContext {
  params: {
    siteId: string;
    pageId: string;
  };
}

// GET: 特定のページ情報を取得
export async function GET(request: Request, { params }: RouteContext) {
  try {
    const DB = await getDB();
    const siteId = parseInt(params.siteId, 10);
    const pageId = parseInt(params.pageId, 10);

    if (isNaN(siteId) || isNaN(pageId)) {
      return NextResponse.json({ message: '無効なサイトIDまたはページIDです。' }, { status: 400 });
    }

    const stmt = DB.prepare(
      'SELECT id, site_id, slug, title, html_content, created_at, updated_at, status, description FROM Pages WHERE id = ? AND site_id = ? AND deleted_at IS NULL',
    );
    const page = await stmt.bind(pageId, siteId).first<Page>();

    if (!page) {
      return NextResponse.json({ message: 'ページが見つかりません。' }, { status: 404 });
    }
    return NextResponse.json(page);
  } catch (error) {
    console.error(`Error fetching page ${params.pageId} for site ${params.siteId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'ページ情報の取得に失敗しました。';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

// PUT: 特定のページ情報を更新
export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const DB = await getDB();
    const siteId = parseInt(params.siteId, 10);
    const pageId = parseInt(params.pageId, 10);

    if (isNaN(siteId) || isNaN(pageId)) {
      return NextResponse.json({ message: '無効なサイトIDまたはページIDです。' }, { status: 400 });
    }

    const body = (await request.json()) as UpdatePagePayload;
    const { slug, title, html_content, status, description } = body;

    if (!slug && !title && html_content === undefined && !status) {
      // html_content は null や空文字列での更新を許可するため undefined でチェック
      return NextResponse.json({ message: '更新するデータがありません。' }, { status: 400 });
    }

    const updates: string[] = [];
    const values: (string | number | null)[] = []; // html_content は null の可能性がある

    if (slug) {
      updates.push('slug = ?');
      values.push(slug);
    }
    if (title) {
      updates.push('title = ?');
      values.push(title);
    }
    if (html_content !== undefined) {
      updates.push('html_content = ?');
      values.push(html_content === null ? null : html_content); // 明示的にnullを許容
    }
    if (status) {
      updates.push('status = ?');
      values.push(status);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description === null ? null : description);
    }

    if (updates.length === 0) {
      return NextResponse.json({ message: '更新する有効なデータがありません。' }, { status: 400 });
    }

    values.push(pageId); // WHERE id = ?
    values.push(siteId); // WHERE site_id = ?

    const stmt = DB.prepare(
      `UPDATE Pages SET ${updates.join(', ')} WHERE id = ? AND site_id = ? AND deleted_at IS NULL`,
    );
    const info = await stmt.bind(...values).run();

    if (!info.success) {
      console.error(`Failed to update page ${pageId}:`, info.error || 'Unknown D1 error during page update');
      const errorMessageFromError = (info.error as any)?.message as string | undefined; // エラーメッセージを安全に取得
      if (errorMessageFromError && errorMessageFromError.includes('UNIQUE constraint failed')) {
        return NextResponse.json(
          { message: '指定されたslugはこのサイト内に既に他のページで使用されています。' },
          { status: 409 },
        );
      }
      return NextResponse.json({ message: 'ページ情報の更新に失敗しました。' }, { status: 500 });
    }
    if (info.meta.changes === 0) {
      return NextResponse.json({ message: '更新対象のページが見つからないか、既に同じ内容です。' }, { status: 404 });
    }

    const selectStmt = DB.prepare(
      'SELECT id, site_id, slug, title, html_content, created_at, updated_at, status, description FROM Pages WHERE id = ? AND site_id = ? AND deleted_at IS NULL',
    );
    const updatedPage = await selectStmt.bind(pageId, siteId).first<Page>();

    if (!updatedPage) {
      return NextResponse.json({ message: 'ページ更新後、データの再取得に失敗しました。' }, { status: 404 });
    }

    // ページ更新後、ページ一覧を最新状態にする
    revalidatePath(`/admin/sites/${siteId}`);

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error(`Error updating page ${params.pageId} for site ${params.siteId}:`, error);
    let errorMessage = 'ページ情報の更新中にエラーが発生しました。';
    if (error instanceof Error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        errorMessage = '指定されたslugはこのサイト内に既に他のページで使用されています。';
        return NextResponse.json({ message: errorMessage }, { status: 409 });
      }
      errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

// DELETE: 特定のページを削除 (ソフトデリート)
export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const DB = await getDB();
    const siteId = parseInt(params.siteId, 10);
    const pageId = parseInt(params.pageId, 10);

    if (isNaN(siteId) || isNaN(pageId)) {
      return NextResponse.json({ message: '無効なサイトIDまたはページIDです。' }, { status: 400 });
    }

    const stmt = DB.prepare(
      "UPDATE Pages SET deleted_at = datetime('now') WHERE id = ? AND site_id = ? AND deleted_at IS NULL",
    );
    const info = await stmt.bind(pageId, siteId).run();

    if (!info.success) {
      console.error(`Failed to soft delete page ${pageId}:`, info.error || 'Unknown D1 error during page soft delete');
      return NextResponse.json({ message: 'ページの削除に失敗しました。' }, { status: 500 });
    }
    if (info.meta.changes === 0) {
      return NextResponse.json(
        { message: '削除対象のページが見つからないか、既に削除されています。' },
        { status: 404 },
      );
    }

    // ページ削除後、ページ一覧を最新状態にする
    revalidatePath(`/admin/sites/${siteId}`);

    return NextResponse.json({ message: `ページ (ID: ${pageId}) を削除しました。` }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting page ${params.pageId} for site ${params.siteId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'ページの削除中にエラーが発生しました。';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
