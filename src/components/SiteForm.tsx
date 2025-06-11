'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Site, CreateSitePayload, UpdateSitePayload } from '@/types/site';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

export interface SiteFormProps {
  siteId?: number; // 編集の場合に指定
  initialData?: Partial<Omit<Site, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>; // 編集時の初期データ
}

export default function SiteForm({ siteId, initialData }: SiteFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'private'>('draft');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const isEditMode = !!siteId;

  useEffect(() => {
    if (isEditMode && initialData) {
      setName(initialData.name || '');
      setSlug(initialData.slug || '');
      setStatus(initialData.status || 'draft');
    }
  }, [isEditMode, initialData]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setToast(null);

    const payload: CreateSitePayload | UpdateSitePayload = {
      name,
      slug,
      status,
    };

    const apiPath = isEditMode ? `/api/sites/${siteId}` : '/api/sites';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(apiPath, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as Site | { message: string };

      if (!response.ok) {
        const errorMessage = isEditMode ? '更新に失敗しました' : '作成に失敗しました';
        const errorDetail = (data as { message: string }).message || '不明なエラーが発生しました';
        throw new Error(`${errorMessage}: ${errorDetail}`);
      }

      console.log(isEditMode ? 'サイトが更新されました:' : 'サイトが作成されました:', data as Site);

      router.push(isEditMode ? `/admin/sites/${siteId}` : '/admin/sites');
      router.refresh();
    } catch (err) {
      const finalErrorMessage = (err as Error).message || '不明なエラーが発生しました';
      setError(finalErrorMessage);
      setToast({ message: finalErrorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='site-form mb-12'>
      {isEditMode ? <p className='text-xs text-gray-500 mb-4 text-right'>サイトID: {siteId}</p> : ''}
      {error && <p className='text-red-400 text-sm mb-4'>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className='mb-4'>
          <label htmlFor='name' className='block text-sm mb-1 text-neutral-400'>
            サイト名
          </label>
          <input
            type='text'
            id='name'
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className='border border-gray-300 rounded-md px-3 py-2 w-full'
          />
        </div>
        <div className='mb-4'>
          <label htmlFor='slug' className='block text-sm mb-1 text-neutral-400'>
            スラッグ
          </label>
          <input
            type='text'
            id='slug'
            value={slug}
            onChange={e => setSlug(e.target.value)}
            required
            className='border border-gray-300 rounded-md px-3 py-2 w-full'
          />
        </div>
        <div className='mb-6'>
          <label className='block text-sm mb-1 text-neutral-400'>
            ステータス
          </label>
          <div className='flex items-center space-x-4'>
            <div className='flex items-center'>
              <input
                type='radio'
                id='status-draft'
                name='status'
                value='draft'
                checked={status === 'draft'}
                onChange={() => setStatus('draft')}
                className='mr-1 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300'
              />
              <label htmlFor='status-draft' className='text-sm font-medium text-gray-700'>
                下書き
              </label>
            </div>
            <div className='flex items-center'>
              <input
                type='radio'
                id='status-published'
                name='status'
                value='published'
                checked={status === 'published'}
                onChange={() => setStatus('published')}
                className='mr-1 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300'
              />
              <label htmlFor='status-published' className='text-sm font-medium text-gray-700'>
                公開
              </label>
            </div>
            <div className='flex items-center'>
              <input
                type='radio'
                id='status-private'
                name='status'
                value='private'
                checked={status === 'private'}
                onChange={() => setStatus('private')}
                className='mr-1 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300'
              />
              <label htmlFor='status-private' className='text-sm font-medium text-gray-700'>
                非公開
              </label>
            </div>
          </div>
        </div>
        <button type='submit' className='bg-blue-500 text-white px-4 py-2 rounded-md' disabled={isLoading}>
          {isLoading ? '処理中...' : isEditMode ? '変更を保存' : '新規作成'}
        </button>
      </form>

      {toast && (
        <div className='fixed bottom-0 left-0 w-full p-4'>
          <div
            className={`${
              toast.type === 'success' ? 'bg-green-400' : 'bg-red-400'
            } py-2 px-4 text-white rounded-lg opacity-90 shadow-lg`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
