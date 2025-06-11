'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Layout, CreateLayoutPayload, UpdateLayoutPayload } from '@/types/layout';
import CodeEditor from '@/components/CodeEditor';

export interface LayoutFormProps {
  siteId: number;
  layoutId?: number;
  initialData?: Partial<Omit<Layout, 'id' | 'site_id' | 'created_at' | 'updated_at' | 'deleted_at'>>;
}

export default function LayoutForm({ siteId, layoutId, initialData }: LayoutFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [html_content, setHtmlContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const isEditMode = !!layoutId;

  useEffect(() => {
    if (isEditMode && initialData) {
      setName(initialData.name || '');
      setHtmlContent(initialData.html_content || '');
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

    const payload: CreateLayoutPayload | UpdateLayoutPayload = {
      name,
      html_content,
    };

    const apiPath = isEditMode ? `/api/sites/${siteId}/layouts/${layoutId}` : `/api/sites/${siteId}/layouts`;
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(apiPath, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as Layout | { message: string };

      if (!response.ok) {
        const errorMessage = isEditMode ? '更新に失敗しました' : '作成に失敗しました';
        const errorDetail = (data as { message: string }).message || '不明なエラーが発生しました';
        throw new Error(`${errorMessage}: ${errorDetail}`);
      }

      const newLayoutData = data as Layout;
      console.log(isEditMode ? '更新されました:' : '作成されました:', newLayoutData);

      if (isEditMode) {
        setToast({ message: '更新されました', type: 'success' });
        router.refresh();
      } else {
        router.push(`/admin/sites/${siteId}`);
      }
    } catch (error) {
      const finalErrorMessage = (error as Error).message || '不明なエラーが発生しました';
      setError(finalErrorMessage);
      setToast({ message: finalErrorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='layout-form mb-12'>
      {error && <p className='text-red-400 text-sm mb-4'>{error}</p>}
      <form onSubmit={handleSubmit}>
        {!isEditMode && (
          <div className='mb-4'>
            <label htmlFor='name' className='block text-sm mb-1 text-neutral-400'>
              作成するレイアウト要素を選択
            </label>
            <select
              id='name'
              name='name'
              value={name}
              required
              onChange={e => setName(e.target.value)}
              className='w-full p-2 border rounded'
            >
              <option value='header'>サイトヘッダー</option>
              <option value='footer'>サイトフッター</option>
            </select>
          </div>
        )}
        <div className='mb-4'>
          <label htmlFor='html_content' className='block text-sm mb-1 text-neutral-400'>
            HTML Content
          </label>
          <div className='w-full border border-neutral-200'>
            <CodeEditor value={html_content} onChange={e => setHtmlContent(e)} height='500px' language='html' />
          </div>
        </div>
        <button
          type='submit'
          className='bg-blue-500 text-white hover:bg-blue-600 transition px-4 py-2 rounded'
          disabled={isLoading}
        >
          {isLoading ? '処理中...' : isEditMode ? '更新' : '作成'}
        </button>

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
      </form>
    </div>
  );
}
