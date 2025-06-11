import LayoutForm from '@/components/LayoutForm';
import { getLayout } from '@/services/LayoutService';
import AdminBreadcrumbs from '@/components/AdminBreadcrumbs';
import PageSidebar from '@/components/PageSidebar';

// 動的レンダリングを強制する
export const dynamic = 'force-dynamic';

interface EditLayoutPageProps {
  params: {
    siteId: string;
    layoutId: string;
  };
}

export default async function EditLayoutPage({ params }: EditLayoutPageProps) {
  const siteId = Number(params.siteId);
  const layoutId = Number(params.layoutId);

  const layout = await getLayout(layoutId);

  if (!layout) {
    return <div>Layout not found</div>;
  }

  return (
    <div className='edit-layout'>
      <AdminBreadcrumbs siteId={siteId} pageName={layout.name} />
      <div className='flex flex-row'>
        <PageSidebar siteId={siteId} />
        <div className='p-4 md:p-6 flex-auto'>
          <h1 className='text-2xl font-bold mb-4'>
            {layout.name === 'header' ? 'サイトヘッダー' : layout.name === 'footer' ? 'サイトフッター' : layout.name}
          </h1>
          <LayoutForm siteId={siteId} layoutId={layoutId} initialData={layout} />
        </div>
      </div>
    </div>
  );
}
