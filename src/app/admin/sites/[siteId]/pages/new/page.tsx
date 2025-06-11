import PageForm from '@/components/PageForm';
import AdminBreadcrumbs from '@/components/AdminBreadcrumbs';
import PageSidebar from '@/components/PageSidebar';

interface NewPageProps {
  params: {
    siteId: string;
  };
}

export default async function NewPage({ params }: NewPageProps) {
  const siteId = Number(params.siteId as string);

  return (
    <div className='new-page'>
      <AdminBreadcrumbs siteId={siteId} pageName='New Page' />
      <div className='flex flex-row'>
        <PageSidebar siteId={siteId} />
        <div className='p-4 md:p-6 flex-auto'>
          <h1 className='text-lg font-bold mb-4'>新しいページを作成</h1>
          <PageForm siteId={siteId} />
        </div>
      </div>
    </div>
  );
}
