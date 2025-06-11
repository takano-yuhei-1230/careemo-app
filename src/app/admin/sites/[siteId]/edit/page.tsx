import { getSite } from '@/services/SiteService';
import SiteForm from '@/components/SiteForm';
import AdminSidebar from '@/components/AdminSidebar';
import Link from 'next/link';

// 動的レンダリングを強制する
export const dynamic = 'force-dynamic';

interface EditSitePageProps {
  params: {
    siteId: string;
  };
}

export default async function EditSitePage({ params }: EditSitePageProps) {
  const siteId = params.siteId as string;
  const site = await getSite(Number(siteId));

  if (!site) {
    return <div className='flex flex-col items-center justify-center py-8'>サイトが見つかりません</div>;
  }

  return (
    <div className='edit-site'>
      <div className='flex flex-row'>
        <AdminSidebar />
        <div className='p-4 md:p-6 flex-auto'>
          <div className='mb-6'>
            <Link href={`/admin/sites/${siteId}`} className='text-blue-500 hover:text-blue-700 hover:underline'>
              &larr; 戻る
            </Link>
          </div>
          <h1 className='text-lg font-bold mb-4'>サイト設定</h1>
          <SiteForm
            siteId={site.id}
            initialData={{
              name: site.name,
              slug: site.slug,
              status: site.status,
            }}
          />
        </div>
      </div>
    </div>
  );
}
