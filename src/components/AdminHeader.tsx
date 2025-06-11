'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminHeader() {
  const { data: session, status } = useSession();
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' }); // ログアウト後にログインページへリダイレクト
  };

  const pathname = usePathname();

  if (pathname === '/admin/login') {
    return <></>;
  }

  return (
    <header>
      <div className='flex justify-between items-center p-4 bg-neutral-100 border-b border-neutral-200'>
        <div>
          <Link href='/admin' className='text-md font-bold'>
            Dashboard
          </Link>
        </div>
        <nav>
          {status === 'authenticated' && ( // 認証済みの場合のみ表示
            <>
              <span className='mr-4 text-sm'>こんにちは、{session.user?.name || '管理者'}さん</span>
              <button
                onClick={handleLogout}
                className='bg-neutral-500 hover:bg-neutral-700 text-sm text-white py-2 px-3 rounded'
              >
                ログアウト
              </button>
            </>
          )}
          {status === 'unauthenticated' && ( // 未認証の場合 (通常はログインページにいるはず)
            <Link href='/admin/login' className='hover:text-gray-300'>
              ログイン
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
