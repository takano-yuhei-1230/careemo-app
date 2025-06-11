import { listDirectoriesInR2 } from '@/services/R2Service';
import { getSite } from '@/services/SiteService';
import { FolderIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default async function MediaFolderList() {
  let directories: string[] = [];
  try {
    directories = await listDirectoriesInR2('images');
  } catch (error) {
    console.error('Failed to get directory list:', error);
    return (
      <div className='mt-8 p-4 bg-red-50 text-red-700 rounded-lg'>
        <p>ディレクトリの読み込みに失敗しました。</p>
      </div>
    );
  }

  if (directories.length === 0) {
    return <></>;
  }

  return (
    <div className='media-folder-list'>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
        {directories.map(async directory => {
          const linkPath = `/admin/sites/${directory}/media`;
          const site = await getSite(Number(directory));
          const siteName = site?.name || directory;

          return (
            <Link
              href={linkPath}
              key={directory}
              className='group block aspect-square p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
            >
              <div className='flex flex-col items-center justify-center h-full'>
                <FolderIcon className='h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors' />
                <p
                  className='mt-2 text-sm font-medium text-gray-700 group-hover:text-blue-600 truncate text-center'
                  title={directory}
                >
                  {siteName}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
