import Link from 'next/link';
import { getSite } from '@/services/SiteService';
import { getPage } from '@/services/PageService';
import { ChevronRightIcon, SlashIcon } from '@heroicons/react/24/outline';

export interface AdminBreadcrumbsProps {
  siteId: number;
  pageId?: number;
  pageName?: string;
}

export default async function AdminBreadcrumbs({ siteId, pageId, pageName }: AdminBreadcrumbsProps) {
  const siteData = await getSite(siteId);
  let pageSlug = '';
  if (pageId) {
    const pageData = await getPage(pageId);
    if (pageData) {
      pageSlug = pageData.slug;
    }
  }

  return (
    <nav className='breadcrumbs w-full p-4 bg-white sticky top-0 z-10 border-b border-neutral-200'>
      <div className='flex items-center gap-2'>
        <Link
          href={`/admin/sites/${siteId}`}
          className='block px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-md text-xs md:text-sm font-bold text-neutral-600'
        >
          {siteData?.slug}
        </Link>
        {pageSlug && (
          <>
            <div className='text-sm text-neutral-500'>
              <SlashIcon className='w-4 h-4' />
            </div>
            <span className='block py-1 rounded-md text-xs md:text-sm text-neutral-500'>{pageSlug}</span>
          </>
        )}
        {pageName && (
          <>
            <div className='text-sm text-neutral-500'>
              <ChevronRightIcon className='w-4 h-4' />
            </div>
            <span className='block py-1 rounded-md text-xs md:text-sm text-neutral-500'>{pageName}</span>
          </>
        )}
      </div>
    </nav>
  );
}
