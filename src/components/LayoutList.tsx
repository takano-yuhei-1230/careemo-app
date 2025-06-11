import Link from 'next/link';
import { formatDateTime } from '@/lib/DateFormatter';
import { getLayoutByName } from '@/services/LayoutService';
import { GlobeAltIcon } from '@heroicons/react/20/solid';

export interface LayoutListProps {
  siteId: number;
}

export default async function LayoutList({ siteId }: LayoutListProps) {
  const headerLayout = await getLayoutByName(siteId, 'header');
  const footerLayout = await getLayoutByName(siteId, 'footer');

  return (
    <div className='layout-list rounded-lg border border-neutral-200 overflow-hidden mt-4'>
      <table className='w-full border-collapse'>
        <tbody>
          {headerLayout && (
            <tr className='border-b border-neutral-200'>
              <td className='py-2 px-4 flex items-center gap-3'>
                <GlobeAltIcon className='w-6 h-6 text-neutral-400' />
                <Link href={`/admin/sites/${siteId}/layouts/${headerLayout.id}/edit`} className='text-blue-500 hover:underline'>
                  <span className='block text-sm'>header</span>
                  <span className='block font-bold'>サイトヘッダー</span>
                </Link>
              </td>
              <td className='py-2 px-4 w-1/3 text-right'>
                <span className='block text-xs text-neutral-400 mt-1'>{formatDateTime(headerLayout.updated_at)}</span>
              </td>
            </tr>
          )}
          {footerLayout && (
            <tr className=''>
              <td className='py-2 px-4 flex items-center gap-3'>
                <GlobeAltIcon className='w-6 h-6 text-neutral-400' />
                <Link href={`/admin/sites/${siteId}/layouts/${footerLayout.id}/edit`} className='text-blue-500 hover:underline'>
                  <span className='block text-sm'>footer</span>
                  <span className='block font-bold'>サイトフッター</span>
                </Link>
              </td>
              <td className='py-2 px-4 w-1/3 text-right'>
                <span className='block text-xs text-neutral-400 mt-1'>{formatDateTime(footerLayout.updated_at)}</span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
