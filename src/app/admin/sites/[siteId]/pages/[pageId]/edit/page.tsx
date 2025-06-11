import Link from 'next/link';
import PageForm from '@/components/PageForm'; // クライアントコンポーネント
import AdminBreadcrumbs from '@/components/AdminBreadcrumbs';
import { getPage } from '@/services/PageService'; // サーバー関数
import PageSidebar from '@/components/PageSidebar';
import { getSite } from '@/services/SiteService';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import { notFound } from 'next/navigation';

// 動的レンダリングを強制する
export const dynamic = 'force-dynamic';

interface EditPagePageProps {
  params: {
    siteId: string;
    pageId: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined }; // クエリパラメータ
}

export default async function EditPagePage({ params }: EditPagePageProps) {
  const siteId = Number(params.siteId);
  const pageId = Number(params.pageId);
  const publicUrlBase = process.env.PUBLIC_URL_BASE;
  const site = await getSite(siteId);

  const pageData = await getPage(pageId);

  if (isNaN(pageId)) {
    return <div>無効なページIDです。</div>;
  }

  if (!pageData) {
    return (
      <div>
        <p>
          ページが見つかりません。(サイトID: {siteId}, ページID: {pageId})
        </p>
        <Link href={`/admin/sites/${siteId}`}>サイト管理に戻る</Link>
      </div>
    );
  }

  if (!site) {
    notFound();
  }

  return (
    <div className='edit-page'>
      <AdminBreadcrumbs siteId={siteId} pageId={pageId} />
      <div className='flex flex-row'>
        <PageSidebar siteId={siteId} />
        <div className='p-4 md:p-6 flex-auto'>
          <div className='mb-4 flex justify-end'>
            <Link href={`${publicUrlBase}/${site.slug}/${pageData.slug}`} target='_blank' rel='noopener noreferrer' className='text-sm text-neutral-400 hover:text-neutral-500 flex items-center gap-1'>
              <ArrowTopRightOnSquareIcon className='w-4 h-4' />
              <span>ページを表示</span>
            </Link>
          </div>
          <PageForm
            siteId={siteId}
            pageId={pageData.id}
            initialData={{
              title: pageData.title,
              slug: pageData.slug,
              html_content: pageData.html_content,
              status: pageData.status,
              description: pageData.description,
            }}
          />
        </div>
      </div>
    </div>
  );
}
