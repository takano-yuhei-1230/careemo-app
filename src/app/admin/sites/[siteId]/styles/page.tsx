import AdminBreadcrumbs from '@/components/AdminBreadcrumbs';
import PageSidebar from '@/components/PageSidebar';
import StyleForm from '@/components/StyleForm';
import { getStyle } from '@/services/StyleService';

export const dynamic = 'force-dynamic';

// 新規サイト作成時にスタイルシートも作成する
// サイトとスタイルは1対1とするためPOST、PUTともにこのページで対応
export default async function StylesPage({ params }: { params: { siteId: string } }) {
  const siteId = parseInt(params.siteId, 10);
  const style = await getStyle(siteId);

  return (
    <div className='style'>
      <AdminBreadcrumbs siteId={siteId} pageName='CSS' />
      <div className='flex flex-row'>
        <PageSidebar siteId={siteId} />
        <div className='p-4 md:p-6 flex-auto'>
          <h1 className='text-2xl font-bold mb-4'>スタイルシート</h1>
          {style ? <StyleForm siteId={siteId} styleId={style.id} initialData={style} /> : <StyleForm siteId={siteId} />}
        </div>
      </div>
    </div>
  );
}
