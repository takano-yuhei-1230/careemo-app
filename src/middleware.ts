import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withAuth, NextRequestWithAuth } from 'next-auth/middleware';

// ミドルウェアを適用するパスを指定します。
// next-auth用とカスタムロジック用の両方の要件を満たすようにします。
// 今回は両方とも '/admin/:path*' を対象としています。
export const config = {
  matcher: ['/admin/:path*'],
};

export default withAuth(
  // 1. このミドルウェア関数は、`authorized` が true を返した場合にのみ実行されます。
  function middleware(request: NextRequestWithAuth) {
    const { pathname } = request.nextUrl;

    // 既に認証済みで、かつ /admin/login にいる場合は /admin へリダイレクト
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
  // 2. withAuth のオプション
  {
    callbacks: {
      // authorized コールバックで、認証が必要かどうかをより詳細に制御できます。
      // true を返すとミドルウェア関数が実行されます。
      // false を返すと、signIn ページにリダイレクトされます（pages オプションで指定されたページ）。
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // ログインページ自体へのアクセスは、常に許可 (トークンの有無を問わない)
        // ログイン済みの場合のリダイレクトは上記のミドルウェア関数内で行う
        if (pathname === '/admin/login') {
          return true;
        }

        // それ以外の /admin/ 配下のページは、トークンがなければアクセス不許可 (signInページへリダイレクト)
        return !!token;
      },
    },
    // ログインページを指定します。未認証時にここにリダイレクトされます。
    pages: {
      signIn: '/admin/login',
      // error: '/error', // (optional) error page
    },
  }
);
