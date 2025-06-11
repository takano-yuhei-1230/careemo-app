import Link from 'next/link';
import { formatDateTime } from '@/lib/DateFormatter';
import { getStyle } from '@/services/StyleService';
import { DocumentIcon } from '@heroicons/react/20/solid';

export interface StyleListProps {
  siteId: number;
}

export default async function StyleList({ siteId }: StyleListProps) {
  const style = await getStyle(siteId);

  return (
    <div className='layout-list rounded-lg border border-neutral-200 overflow-hidden mt-4'>
      <table className='w-full border-collapse'>
        <tbody>
          <tr className=''>
            <td className='py-2 px-4 flex items-center gap-3'>
              <DocumentIcon className='w-6 h-6 text-neutral-400' />
              <Link href={`/admin/sites/${siteId}/styles`} className='text-blue-500 hover:underline'>
                <span className='block text-sm'>CSS</span>
                <span className='block font-bold'>スタイルシート</span>
              </Link>
            </td>
            <td className='py-2 px-4 w-1/3 text-right'>
              <span className='block text-xs text-neutral-400 mt-1'>{formatDateTime(style?.updated_at)}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
