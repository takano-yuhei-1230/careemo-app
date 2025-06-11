import LayoutForm from '@/components/LayoutForm';
import AdminBreadcrumbs from '@/components/AdminBreadcrumbs';

interface NewLayoutPageProps {
  params: {
    siteId: string;
  };
}

export default function NewLayoutPage({ params }: NewLayoutPageProps) {
  const siteId = Number(params.siteId);

  return (
    <div className='new-layout'>
      <AdminBreadcrumbs siteId={siteId} pageName='New Layout Part' />
      <div className='p-4'>
        <LayoutForm siteId={siteId} />
      </div>
    </div>
  );
}
