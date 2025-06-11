import Link from 'next/link';
import PageList from '@/components/PageList';
import LayoutList from '@/components/LayoutList';
import StyleList from '@/components/StyleList';
import { getSite } from '@/services/SiteService';
import { formatDateTime } from '@/lib/DateFormatter';
import AdminSidebar from '@/components/AdminSidebar';
import { ArrowTopRightOnSquareIcon, Cog6ToothIcon, PhotoIcon } from '@heroicons/react/20/solid';

// 動的レンダリングを強制する
export const dynamic = 'force-dynamic';

interface AdminSiteDetailPageProps {
  params: {
    siteId: string;
  };
}

export default async function AdminSiteDetailPage({ params }: AdminSiteDetailPageProps) {
  const siteId = Number(params.siteId);
  const site = await getSite(siteId);
  const publicUrlBase = process.env.PUBLIC_URL_BASE;

  if (!site) {
    return (
      <div>
        <p>指定されたサイト (ID: {siteId}) が見つかりません。</p>
        <Link href='/admin/sites'>サイト一覧へ戻る</Link>
      </div>
    );
  }

  return (
    <div className='site-detail'>
      <div className='flex flex-row'>
        <AdminSidebar />
        <div className='p-4 md:p-6 flex-auto'>
          <div className='relative'>
            <div className='site-header flex flex-row gap-4 mb-4 items-center'>
              <h1 className='text-2xl font-bold'>{site.name}</h1>
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
            <div className='site-metadata mb-6 flex flex-col gap-2 text-sm text-neutral-500'>
              <p className='flex items-center'>
                <ArrowTopRightOnSquareIcon className='w-4 h-4 text-neutral-400 mr-1' />
                <a
                  href={`${publicUrlBase}/${site.slug}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-sm text-neutral-400 hover:text-neutral-500 underline'
                >
                  {publicUrlBase}/{site.slug}
                </a>
              </p>
              <div className='flex flex-row gap-4'>
                <p className='text-xs text-neutral-400'>ID: {site.id}</p>
                <p className='text-xs text-neutral-400'>更新: {formatDateTime(site.updated_at)}</p>
              </div>
            </div>
            <div className='absolute top-0 right-0'>
              <Link href={`/admin/sites/${siteId}/edit`} className='bg-neutral-100 text-neutral-400 hover:text-neutral-500 py-2 px-3 rounded-full flex items-center gap-1'>
                <Cog6ToothIcon className='w-5 h-5' />
                <span className='text-sm'>サイト設定</span>
              </Link>
            </div>
          </div>
          <div className='page-list'>
            <div className='mb-4'>
              <Link
                href={`/admin/sites/${siteId}/pages/new`}
                className='inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
              >
                ページを作成
              </Link>
            </div>
            <PageList siteId={siteId} />
            <LayoutList siteId={siteId} />
            <StyleList siteId={siteId} />
            <div className='layout-list rounded-lg border border-neutral-200 overflow-hidden mt-4'>
              <table className='w-full border-collapse'>
                <tbody>
                  <tr className=''>
                    <td className='py-2 px-4 flex items-center gap-3'>
                      <PhotoIcon className='w-6 h-6 text-neutral-400' />
                      <Link href={`/admin/sites/${siteId}/media`} className='text-blue-500 hover:underline'>
                        <span className='block text-sm'>media</span>
                        <span className='block font-bold'>メディアライブラリ</span>
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
