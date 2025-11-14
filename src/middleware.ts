import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withAuth, NextRequestWithAuth } from 'next-auth/middleware';

// ミドルウェアを適用するパス
export const config = {
  matcher: ['/admin/:path*'],
};

export default withAuth(
  // このミドルウェア関数は authorized コールバック関数が true を返した場合のみ実行される
  function middleware(request: NextRequestWithAuth) {
    const { pathname } = request.nextUrl;

    // 既に認証済みで /admin/login にいる場合は /admin へリダイレクト
    if (request.nextauth.token && pathname === '/admin/login') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // 上記以外で認証済みの場合、x-current-path ヘッダーを設定して続行
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-current-path', pathname);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  },
  // withAuth のオプション
  {
    // 認証が必要かどうかをページごとに制御するコールバック
    callbacks: {
      // true を返すとミドルウェア関数を実行
      // false を返すと、signIn ページにリダイレクト
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // ログインページ自体へのアクセスは、常に許可
        // ログイン済みの場合のリダイレクトは上記のミドルウェア関数で行う
        if (pathname === '/admin/login') {
          return true;
        }

        // それ以外の /admin/ 以下のページはトークンがなければアクセス不可
        return !!token;
      },
    },
    // 未認証時のリダイレクト先を指定
    pages: {
      signIn: '/admin/login',
    },
  },
);
