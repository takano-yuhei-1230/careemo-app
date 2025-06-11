'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image'; // Next.jsのImageコンポーネントを使用
import { ClipboardDocumentIcon } from '@heroicons/react/20/solid';

interface R2File {
  key: string;
  url: string;
  lastModified?: Date;
  size?: number;
  eTag?: string;
}

interface UploadedMediaListProps {
  siteId?: string; // 特定のサイトID、指定されなければ共通フォルダを対象
}

export default function UploadedMediaList({ siteId }: UploadedMediaListProps) {
  const [files, setFiles] = useState<R2File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMedia() {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = siteId ? `/api/media-list?siteId=${siteId}` : '/api/media-list';
        const response = await fetch(apiUrl);

        // APIからの期待されるレスポンスの型
        interface MediaListApiResponse {
          success: boolean;
          files?: R2File[];
          error?: string;
        }

        if (!response.ok) {
          // エラーレスポンスも型付けを試みる
          const errorData: MediaListApiResponse = await response.json();
          throw new Error(errorData.error || `Failed to fetch media list (status: ${response.status})`);
        }

        const data: MediaListApiResponse = await response.json(); // ★ response.json()に型を適用

        if (data.success && data.files) {
          // data.filesの存在もチェック
          setFiles(data.files);
        } else {
          throw new Error(data.error || 'Failed to retrieve files from API.');
        }
      } catch (e: any) {
        // catch節のエラーオブジェクトはanyのままにするか、型ガードを行う
        console.error('Error fetching media:', e);
        setError(e instanceof Error ? e.message : String(e) || 'メディアの読み込み中にエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    }

    fetchMedia();
  }, [siteId]); // siteIdが変わったら再フェッチ

  if (loading) {
    return (
      <div className='mt-8'>
        <p className='text-gray-500'>メディアを読み込み中です...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='mt-8'>
        <p className='text-red-500'>エラー: {error}</p>
      </div>
    );
  }

  return (
    <div className='mt-8'>
      {files.length === 0 ? (
        <p className='text-gray-500'>アップロードされたメディアはありません。</p>
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
          {files.map(file => (
            <div
              key={file.key}
              className='group relative border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200'
            >
              <div className='aspect-square bg-gray-100'>
                <Image
                  src={file.url}
                  alt={file.key}
                  className='object-cover aspect-square w-full group-hover:opacity-80 transition-opacity duration-200'
                  width={200}
                  height={200}
                  loading='lazy'
                />
              </div>
              <div className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs'>
                <p className='truncate' title={file.key.substring(file.key.lastIndexOf('/') + 1)}>
                  {file.key.substring(file.key.lastIndexOf('/') + 1)}
                </p>
                {file.size && <p>{(file.size / 1024).toFixed(1)} KB</p>}
              </div>
              <button
                type='button'
                onClick={() => navigator.clipboard.writeText(file.url)}
                title='画像URLをコピー'
                className='absolute top-1 right-1 bg-white bg-opacity-75 text-gray-700 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-opacity-100 focus:outline-none'
              >
                <ClipboardDocumentIcon className='w-4 h-4' />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
