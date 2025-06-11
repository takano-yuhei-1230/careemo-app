import AdminSidebar from '@/components/AdminSidebar';
import SiteForm from '@/components/SiteForm';

export default function NewSitePage() {
  return (
    <div className='new-site'>
      <div className='flex flex-row'>
        <AdminSidebar />
        <div className='p-4 md:p-6 flex-auto'>
          <h1 className='text-lg font-bold mb-4'>新しいサイトを作成</h1>
          <SiteForm />
        </div>
      </div>
    </div>
  );
}
