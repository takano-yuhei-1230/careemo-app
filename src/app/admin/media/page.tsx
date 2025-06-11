import { getSites } from '@/services/SiteService';
import MediaUploadForm from '@/components/MediaUploadForm';
import UploadedMediaList from '@/components/UploadedMediaList';
import { Site } from '@/types/site';
import AdminSidebar from '@/components/AdminSidebar';
import MediaFolderList from '@/components/MediaFolderList';

// 動的レンダリングを強制する
export const dynamic = 'force-dynamic';

export default async function MediaUploadPage() {
  const sites: Site[] = await getSites();

  return (
    <div className='media'>
      <div className='flex flex-row'>
        <AdminSidebar />
        <div className='p-4 md:p-6 flex-auto'>
          <h1 className='text-xl font-bold mb-2 text-gray-800'>メディアライブラリ</h1>
          <p className='text-sm text-gray-600 mb-6'>
            すべてのサイトで共通利用するメディアはここからアップロードできます。
          </p>

          <div className='mb-8'>
            <MediaUploadForm sites={sites} />
          </div>

          <div className='mb-8'>
            <UploadedMediaList />
          </div>

          <div>
            <h2 className='text-lg font-bold mb-2 text-gray-800'>サイト別フォルダ</h2>
            <MediaFolderList />
          </div>
        </div>
      </div>
    </div>
  );
}
