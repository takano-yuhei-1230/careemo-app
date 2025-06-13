'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image'; // Next.jsのImageコンポーネントを使用
import { ClipboardDocumentIcon, CodeBracketIcon, LinkIcon } from '@heroicons/react/20/solid';

interface R2File {
  key: string;
  url: string;
  lastModified?: Date;
  size?: number;
  eTag?: string;
}

interface FileWithMetadata extends R2File {
  width?: number;
  height?: number;
}

interface UploadedMediaListProps {
  siteId?: string; // 特定のサイトID、指定されなければ共通フォルダを対象
}

export default function UploadedMediaList({ siteId }: UploadedMediaListProps) {
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  const getImageMetadata = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
      };
      img.onerror = () => {
        reject(new Error('画像のメタデータを取得できませんでした。'));
      };
      img.src = url;
    });
  };

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
          // 各ファイルのメタデータを取得
          const filesWithMetadata = await Promise.all(
            data.files.map(async (file) => {
              try {
                const metadata = await getImageMetadata(file.url);
                return {
                  ...file,
                  width: metadata.width,
                  height: metadata.height
                };
              } catch (err) {
                console.error(`Error getting metadata for ${file.url}:`, err);
                return file;
              }
            })
          );
          setFiles(filesWithMetadata);
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

  const handleCopy = async (text: string, fileKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [fileKey]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [fileKey]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const generateImgTag = (file: FileWithMetadata) => {
    const width = file.width ? `width="${file.width}"` : '';
    const height = file.height ? `height="${file.height}"` : '';
    return `<img src="${file.url}" ${width} ${height} alt="${file.key.split('/').pop()}" />`;
  };

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
              <div className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                <div className='flex flex-col gap-1'>
                  <p className='truncate text-xs' title={file.key.substring(file.key.lastIndexOf('/') + 1)}>
                    {file.key.substring(file.key.lastIndexOf('/') + 1)}
                  </p>
                  {file.size && <p className='text-xs'>{(file.size / 1024).toFixed(1)} KB</p>}
                  {(file.width || file.height) && (
                    <p className='text-xs'>
                      {file.width} × {file.height}px
                    </p>
                  )}
                  <div className='flex items-center gap-2 mt-1'>
                    <button
                      type='button'
                      onClick={() => handleCopy(file.url, `${file.key}-url`)}
                      className='flex items-center gap-1 px-2 py-1 text-xs bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors'
                    >
                      <LinkIcon className='w-3 h-3' />
                      {copiedStates[`${file.key}-url`] ? 'Copied!' : 'URL'}
                    </button>
                    <button
                      type='button'
                      onClick={() => handleCopy(generateImgTag(file), `${file.key}-img`)}
                      className='flex items-center gap-1 px-2 py-1 text-xs bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors'
                    >
                      <CodeBracketIcon className='w-3 h-3' />
                      {copiedStates[`${file.key}-img`] ? 'Copied!' : 'IMG'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
