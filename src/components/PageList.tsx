import Link from 'next/link';
import { getPages } from '@/services/PageService';
import { formatDateTime } from '@/lib/DateFormatter';
import { HomeIcon, DocumentTextIcon, ClockIcon } from '@heroicons/react/20/solid';

export interface PageListProps {
  siteId: number;
}

export default async function PageList({ siteId }: PageListProps) {
  const pagesData = await getPages(Number(siteId));

  if (pagesData.length === 0) {
    return (
      <div>
        <p>ページがありません。上記ボタンから作成してください。</p>
      </div>
    );
  }

  // Sort pages: 'index' first, then by slug ascending
  const indexPage = pagesData.find(p => p.slug === 'index');
  const otherPages = pagesData.filter(p => p.slug !== 'index').sort((a, b) => a.slug.localeCompare(b.slug));

  const sortedPages = indexPage ? [indexPage, ...otherPages] : otherPages;

  return (
    <div className='page-list rounded-lg border border-neutral-200 overflow-hidden'>
      {sortedPages.length === 0 ? (
        <p className='text-center text-neutral-500 p-8'>まだページがありません。</p>
      ) : (
        <table className='w-full border-collapse'>
          <thead>
            <tr className='bg-gray-100 border-b border-neutral-200'>
              <th className='p-2'></th>
              <th className='py-2 px-4 w-1/3 text-right'>
                <div className='flex items-center justify-end gap-1'>
                  <ClockIcon className='w-4 h-4 text-neutral-400' />
                  <span className='text-sm font-normal text-neutral-400'>更新日時</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPages.map(page => (
              <tr key={page.id} className='border-b last:border-b-0 border-neutral-200'>
                <td className='py-2 px-4 flex items-center gap-3'>
                  {page.slug === 'index' ? (
                    <HomeIcon className='w-6 h-6 text-neutral-400' />
                  ) : (
                    <DocumentTextIcon className='w-6 h-6 text-neutral-400' />
                  )}
                  <Link href={`/admin/sites/${siteId}/pages/${page.id}/edit`} className='text-blue-500 hover:underline'>
                    <span className='block text-sm'>{page.slug}</span>
                    <span className='block font-bold'>{page.title}</span>
                  </Link>
                </td>
                <td className='py-2 px-4 w-1/3 text-right'>
                  {page.status === 'published' && (
                    <span className='inline-block text-xs text-white bg-teal-400 rounded-full px-2 leading-5'>
                      公開中
                    </span>
                  )}
                  {page.status === 'draft' && (
                    <span className='inline-block text-xs text-white bg-neutral-400 rounded-full px-2 leading-5'>
                      下書き
                    </span>
                  )}
                  {page.status === 'private' && (
                    <span className='inline-block text-xs text-white bg-red-400 rounded-full px-2 leading-5'>
                      非公開
                    </span>
                  )}
                  <span className='block text-xs text-neutral-400 mt-1'>{formatDateTime(page.updated_at)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
