import MediaUploadForm from '@/components/MediaUploadForm';
import UploadedMediaList from '@/components/UploadedMediaList';
import { getSite } from '@/services/SiteService';
import { Site } from '@/types/site';
import { notFound } from 'next/navigation';
import PageSidebar from '@/components/PageSidebar';
import AdminBreadcrumbs from '@/components/AdminBreadcrumbs';

// 動的レンダリングを強制する
export const dynamic = 'force-dynamic';

interface SiteMediaPageProps {
  params: {
    siteId: string;
  };
}

export default async function SiteMediaPage({ params }: SiteMediaPageProps) {
  const { siteId } = params;

  const site = await getSite(parseInt(siteId, 10));

  if (!site) {
    notFound();
  }

  // MediaUploadForm に渡す sites は、プルダウンを表示しないため空配列でOK
  const sitesForForm: Site[] = [];

  return (
    <div className='media'>
      <AdminBreadcrumbs siteId={site.id} pageName='media' />
      <div className='flex flex-row'>
        <PageSidebar siteId={site.id} />
        <div className='p-4 md:p-6 flex-auto'>
          <h1 className='text-2xl font-bold mb-4'>メディアライブラリ</h1>

          <div className='mb-8'>
            <MediaUploadForm sites={sitesForForm} fixedSiteId={siteId} />
          </div>

          <UploadedMediaList siteId={siteId} />
        </div>
      </div>
    </div>
  );
}
