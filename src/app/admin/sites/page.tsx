import Link from 'next/link';
import SiteList from '@/components/SiteList';
import AdminSidebar from '@/components/AdminSidebar';

// 動的レンダリングを強制する
export const dynamic = 'force-dynamic';

export default function AdminSitesPage() {
  return (
    <div className='sites'>
      <div className='flex flex-row'>
        <AdminSidebar />
        <div className='p-4 md:p-6 flex-auto'>
          <h1 className='text-lg font-bold mb-4'>サイト管理</h1>
          <div className='flex justify-end mb-4'>
            <Link href='/admin/sites/new' className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'>
              サイトを作成
            </Link>
          </div>
          <SiteList />
        </div>
      </div>
    </div>
  );
}
