import Link from 'next/link';
import type { Site } from '@/types/site';
import { getSites } from '@/services/SiteService';
import { formatDateTime } from '@/lib/DateFormatter';

export default async function SiteList() {
  const sites = await getSites();

  if (sites.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-8'>
        <p>サイトがありません</p>
      </div>
    );
  }

  return (
    <div className='site-list'>
      <ul className='flex flex-col gap-4'>
        {sites.map((site: Site) => (
          <li key={site.id} className='border border-neutral-200 rounded-md py-4 px-4'>
            <div className='flex flex-row gap-4 mb-2 items-center'>
              <Link href={`/admin/sites/${site.id}`} className='text-md font-bold text-blue-500 hover:underline'>
                {site.name}
              </Link>
              {site.status === 'published' && (
                <span className='block text-xs text-white bg-teal-400 rounded-full px-2 py-1'>公開中</span>
              )}
              {site.status === 'draft' && (
                <span className='block text-xs text-white bg-neutral-400 rounded-full px-2 py-1'>下書き</span>
              )}
              {site.status === 'private' && (
                <span className='block text-xs text-white bg-red-400 rounded-full px-2 py-1'>非公開</span>
              )}
            </div>
            <div className='flex flex-row gap-4 text-xs text-neutral-500'>
              <span>ID: {site.id}</span>
              <span>{site.slug}</span>
              <span>{formatDateTime(site.updated_at)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
