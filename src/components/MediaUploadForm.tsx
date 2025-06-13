'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Site } from '@/types/site';
import Image from 'next/image';
import { LinkIcon } from '@heroicons/react/20/solid';

interface ApiResponse {
  success?: boolean;
  message?: string;
  url?: string;
  error?: string;
  r2Key?: string;
}

interface MediaUploadFormProps {
  sites: Site[];
  fixedSiteId?: string;
}

export default function MediaUploadForm({ sites, fixedSiteId }: MediaUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [imgTag, setImgTag] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [siteIdForUpload, setSiteIdForUpload] = useState<string>(fixedSiteId || '');
  const [imageMetadata, setImageMetadata] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (fixedSiteId) {
      setSiteIdForUpload(fixedSiteId);
    } else {
      setSiteIdForUpload('');
    }
  }, [fixedSiteId]);

  const getImageMetadata = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
        });
      };
      img.onerror = () => {
        reject(new Error('画像のメタデータを取得できませんでした。'));
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setUploadedFileUrl(null);
      setImageMetadata(null);

      try {
        // 画像のメタデータを取得
        const metadata = await getImageMetadata(selectedFile);
        setImageMetadata(metadata);
      } catch (err) {
        console.error('Error getting image metadata:', err);
        // メタデータの取得に失敗しても処理は続行
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFile(null);
      setPreview(null);
      setImageMetadata(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError('ファイルを選択してください。');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadedFileUrl(null);

    const formData = new FormData();
    formData.append('file', file);
    const currentSiteId = fixedSiteId || siteIdForUpload;
    if (currentSiteId) {
      formData.append('siteId', currentSiteId);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'アップロードに失敗しました。');
      }

      if (data.url) {
        setUploadedFileUrl(data.url);
        // メタデータがある場合はそれを使用し、ない場合は空文字列を設定
        const width = imageMetadata?.width || '';
        const height = imageMetadata?.height || '';
        setImgTag(
          `<img src="${data.url}" ${width ? `width="${width}"` : ''} ${height ? `height="${height}"` : ''} alt="${
            file.name
          }" />`,
        );
      } else {
        throw new Error('アップロード成功しましたが、URLが返されませんでした。');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('アップロード中に不明なエラーが発生しました。');
      }
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6 bg-white p-6 md:p-8 rounded-lg border border-gray-200'>
      {!fixedSiteId && (
        <div>
          <label htmlFor='siteIdInput' className='block text-sm font-medium text-gray-700 mb-2'>
            アップロード先を選択
          </label>
          <select
            id='siteIdInput'
            name='siteIdInput'
            value={siteIdForUpload}
            onChange={e => setSiteIdForUpload(e.target.value)}
            className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            disabled={uploading || sites.length === 0}
          >
            <option value=''>共通フォルダ</option>
            {sites.map(site => (
              <option key={site.id} value={site.id.toString()}>
                {site.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className='mb-6'>
        <label
          htmlFor='file-upload'
          className='inline-block py-2 px-4 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-bold cursor-pointer'
        >
          ファイルを選択してアップロード
        </label>
        <input
          id='file-upload'
          name='file-upload'
          type='file'
          onChange={handleFileChange}
          className='hidden'
          accept='image/*'
          disabled={uploading}
        />
        {preview && file && (
          <div className='mt-4 border border-gray-200 rounded-lg p-4'>
            <p className='text-sm text-gray-600 mb-2'>選択中:</p>
            <Image
              src={preview}
              alt='選択されたファイルのプレビュー'
              className='max-h-60 rounded border border-gray-300'
              width={200}
              height={200}
            />
            <p className='text-xs text-gray-500 mt-2'>
              {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          </div>
        )}
      </div>

      {error && <p className='mt-2 text-sm text-red-600 bg-red-50 p-3 rounded-md'>エラー: {error}</p>}
      {uploadedFileUrl && (
        <div className='mt-2 text-sm text-green-700 bg-green-50 p-4 rounded-md'>
          <p className='font-semibold'>アップロード成功！</p>
          <div className='flex items-center gap-2 mt-2'>
            <LinkIcon className='w-4 h-4 text-green-600' />
            <p className='flex-initial'>
              <a
                href={uploadedFileUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='underline hover:text-green-800 break-all'
              >
                {uploadedFileUrl}
              </a>
            </p>
            <button
              type='button'
              onClick={() => navigator.clipboard.writeText(uploadedFileUrl)}
              className='flex-none px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
            >
              URLをコピー
            </button>
          </div>
          {imgTag && (
            <div className='mt-3'>
              <input
                type='text'
                value={imgTag}
                readOnly
                className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600'
              />
              <button
                type='button'
                onClick={() => navigator.clipboard.writeText(imgTag)}
                className='mt-3 px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
              >
                IMGタグをコピー
              </button>
            </div>
          )}
        </div>
      )}

      <div>
        <button
          type='submit'
          disabled={!file || uploading}
          className='w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                    bg-blue-600 hover:bg-blue-700
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    disabled:bg-gray-400 disabled:cursor-not-allowed'
        >
          {uploading ? (
            <>
              <svg
                className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
              アップロード中...
            </>
          ) : (
            'アップロード実行'
          )}
        </button>
      </div>
    </form>
  );
}
