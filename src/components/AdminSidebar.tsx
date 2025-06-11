import { ListBulletIcon, PhotoIcon, UserIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { headers } from 'next/headers';

export default async function AdminSidebar() {
  const headerList = await headers();
  const currentPath = headerList.get('x-current-path');

  return (
    <div className='hidden md:block flex-none w-48 py-4 border-r border-neutral-200 bg-neutral-50 min-h-screen relative'>
      <ul className='space-y-1'>
        <li>
          {(() => {
            const isActive = currentPath?.startsWith('/admin/sites');
            return (
              <Link href='/admin/sites' className={`flex items-center gap-2 py-2 px-4 ${isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-neutral-700 hover:bg-neutral-100'}`}>
                <ListBulletIcon className='w-5 h-5' />
                <span className='block text-md'>サイト</span>
              </Link>
            );
          })()}
        </li>
        <li>
          {(() => {
            const href = '/admin/media';
            const isActive = currentPath === href;
            return (
              <Link href={href} className={`flex items-center gap-2 py-2 px-4 ${isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-neutral-700 hover:bg-neutral-100'}`}>
                <PhotoIcon className='w-5 h-5' />
                <span className='block text-md'>メディア</span>
              </Link>
            );
          })()}
        </li>
        <li>
          {(() => {
            const href = '/admin/users';
            const isActive = currentPath === href;
            return (
              <Link href={href} className={`flex items-center gap-2 py-2 px-4 ${isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-neutral-700 hover:bg-neutral-100'}`}>
                <UserIcon className='w-5 h-5' />
                <span className='block text-md'>ユーザー</span>
              </Link>
            );
          })()}
        </li>
      </ul>
      <div className='absolute bottom-0 left-0 right-0 py-4 w-48'>
        <p className='text-center text-xs text-neutral-500'>© 2025 Careemo</p>
      </div>
    </div>
  );
}
