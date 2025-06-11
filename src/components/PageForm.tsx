'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Page, CreatePagePayload, UpdatePagePayload } from '@/types/page';
import CodeEditor from '@/components/CodeEditor';

export interface PageFormProps {
  siteId: number;
  pageId?: number;
  initialData?: Partial<Omit<Page, 'id' | 'site_id' | 'created_at' | 'updated_at' | 'deleted_at'>>;
}

export default function PageForm({ siteId, pageId, initialData }: PageFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [html_content, setHtmlContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'private'>('draft');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const isEditMode = !!pageId;

  useEffect(() => {
    if (isEditMode && initialData) {
      setTitle(initialData.title || '');
      setSlug(initialData.slug || '');
      setHtmlContent(initialData.html_content || '');
      setStatus(initialData.status || 'draft');
      setDescription(initialData.description || '');
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

    const payload: CreatePagePayload | UpdatePagePayload = {
      title,
      slug,
      html_content,
      status,
      description,
    };

    const apiPath = isEditMode ? `/api/sites/${siteId}/pages/${pageId}` : `/api/sites/${siteId}/pages`;
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(apiPath, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as Page | { message: string };

      if (!response.ok) {
        const errorMessage = isEditMode ? '更新に失敗しました' : '作成に失敗しました';
        const errorDetail = (data as { message: string }).message || '不明なエラーが発生しました';
        throw new Error(`${errorMessage}: ${errorDetail}`);
      }

      const newPageData = data as Page;
      console.log(isEditMode ? 'ページが更新されました:' : 'ページが作成されました:', newPageData);

      if (isEditMode) {
        setToast({ message: 'ページが更新されました', type: 'success' });
        router.refresh();
      } else {
        router.push(`/admin/sites/${siteId}/pages/${newPageData.id}/edit?created=true`);
      }
    } catch (err) {
      const finalErrorMessage = (err as Error).message || '不明なエラーが発生しました';
      setError(finalErrorMessage);
      setToast({ message: finalErrorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='page-form mb-12'>
      {error && <p className='text-red-400 text-sm mb-4'>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className='mb-4'>
          <label htmlFor='title' className='block text-sm mb-1 text-neutral-400'>
            タイトル
          </label>
          <input
            type='text'
            id='title'
            name='title'
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className='w-full border border-neutral-200 p-2 text-lg font-bold'
          />
        </div>
        <div className='mb-4'>
          <label htmlFor='description' className='block text-sm mb-1 text-neutral-400'>
            説明
          </label>
          <input
            type='text'
            id='description'
            name='description'
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            className='w-full border border-neutral-200 p-2'
          />
        </div>
        <div className='mb-4'>
          <label htmlFor='slug' className='block text-sm mb-1 text-neutral-400'>
            スラッグ
          </label>
          <input
            type='text'
            id='slug'
            name='slug'
            value={slug}
            onChange={e => setSlug(e.target.value)}
            required
            className='w-full border border-neutral-200 p-2'
          />
        </div>
        <div className='mb-4'>
          <label htmlFor='html_content' className='block text-sm mb-1 text-neutral-400'>
            HTML Content
          </label>
          <div className='w-full border border-neutral-200'>
            <CodeEditor value={html_content} onChange={e => setHtmlContent(e)} height='500px' language='html' />
          </div>
        </div>
        <div className='mb-6'>
          <label className='block text-sm mb-1 text-neutral-400'>ステータス</label>
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
        <button type='submit' className='bg-blue-500 text-white px-4 py-2 rounded' disabled={isLoading}>
          {isLoading ? '処理中...' : isEditMode ? '更新' : '作成'}
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
