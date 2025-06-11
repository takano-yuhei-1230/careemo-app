import { getPages } from '@/services/PageService';
import { getLayoutByName } from '@/services/LayoutService';
import { getStyle } from '@/services/StyleService';
import Link from 'next/link';
import { headers } from 'next/headers';

export default async function PageSidebar({ siteId }: { siteId: number }) {
  const pages = await getPages(Number(siteId));
  const headerLayout = await getLayoutByName(Number(siteId), 'header');
  const footerLayout = await getLayoutByName(Number(siteId), 'footer');
  const styles = await getStyle(Number(siteId));

  const indexPage = pages.find(p => p.slug === 'index');
  const otherPages = pages.filter(p => p.slug !== 'index').sort((a, b) => a.slug.localeCompare(b.slug));
  const sortedPages = indexPage ? [indexPage, ...otherPages] : otherPages;

  const headerList = headers();
  const currentPath = headerList.get('x-current-path');

  return (
    <div className='hidden md:block flex-none w-48 py-4 border-r border-neutral-200 bg-neutral-50 min-h-screen relative'>
      <ul className='space-y-1 mb-4'>
        {sortedPages.map(page => {
          const href = `/admin/sites/${siteId}/pages/${page.id}/edit`;
          const isActive = currentPath === href;
          return (
            <li key={page.id}>
              <Link
                href={href}
                className={`block py-2 px-4 hover:bg-neutral-100 ${
                  isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-neutral-700'
                }`}
              >
                <span className='block text-md'>{page.slug}</span>
                <span className={`block text-xs ${isActive ? 'text-blue-600' : 'text-neutral-500'}`}>{page.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <ul className='space-y-1 mb-4'>
        {headerLayout &&
          (() => {
            const href = `/admin/sites/${siteId}/layouts/${headerLayout.id}/edit`;
            const isActive = currentPath === href;
            return (
              <li key={headerLayout.id}>
                <Link
                  href={href}
                  className={`block py-2 px-4 hover:bg-neutral-100 ${
                    isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-neutral-700'
                  }`}
                >
                  <span className='block text-md'>header</span>
                  <span className={`block text-xs ${isActive ? 'text-blue-600' : 'text-neutral-500'}`}>
                    サイトヘッダー
                  </span>
                </Link>
              </li>
            );
          })()}
        {footerLayout &&
          (() => {
            const href = `/admin/sites/${siteId}/layouts/${footerLayout.id}/edit`;
            const isActive = currentPath === href;
            return (
              <li key={footerLayout.id}>
                <Link
                  href={href}
                  className={`block py-2 px-4 hover:bg-neutral-100 ${
                    isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-neutral-700'
                  }`}
                >
                  <span className='block text-md'>footer</span>
                  <span className={`block text-xs ${isActive ? 'text-blue-600' : 'text-neutral-500'}`}>
                    サイトフッター
                  </span>
                </Link>
              </li>
            );
          })()}
      </ul>
      <ul className='space-y-1 mb-4'>
        {styles &&
          (() => {
            const href = `/admin/sites/${siteId}/styles`;
            const isActive = currentPath === href;
            return (
              <li key={styles.id}>
                <Link
                  href={href}
                  className={`block py-2 px-4 hover:bg-neutral-100 ${
                    isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-neutral-700'
                  }`}
                >
                  <span className='block text-md'>css</span>
                  <span className={`block text-xs ${isActive ? 'text-blue-600' : 'text-neutral-500'}`}>
                    スタイルシート
                  </span>
                </Link>
              </li>
            );
          })()}
      </ul>
      <ul className='space-y-1'>
        {(() => {
          const href = `/admin/sites/${siteId}/media`;
          const isActive = currentPath === href;
          return (
            <li>
              <Link
                href={href}
                className={`block py-2 px-4 hover:bg-neutral-100 ${
                  isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-neutral-700'
                }`}
              >
                <span className='block text-md'>media</span>
                <span className={`block text-xs ${isActive ? 'text-blue-600' : 'text-neutral-500'}`}>
                  メディアライブラリ
                </span>
              </Link>
            </li>
          );
        })()}
      </ul>
      <div className='absolute bottom-0 left-0 right-0 py-4 w-48'>
        <p className='text-center text-xs text-neutral-500'>© 2025 Careemo</p>
      </div>
    </div>
  );
}
