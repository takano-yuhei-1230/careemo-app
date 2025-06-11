import AdminSidebar from '@/components/AdminSidebar';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className='admin'>
      <div className='flex flex-row'>
        <AdminSidebar />
        <div className='p-4 md:p-6 flex-auto'>
          <h3 className='text-lg font-bold mb-4'>ようこそ管理画面へ</h3>
          <div className='flex flex-col gap-4'>
            <p>ここには何もありません。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
