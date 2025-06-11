'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Style, CreateStylePayload, UpdateStylePayload } from '@/types/style';
import CodeEditor from '@/components/CodeEditor';

export interface StyleFormProps {
  siteId: number;
  styleId?: number;
  initialData?: Partial<Omit<Style, 'id' | 'site_id' | 'created_at' | 'updated_at' | 'deleted_at'>>;
}

export default function StyleForm({ siteId, styleId, initialData }: StyleFormProps) {
  const router = useRouter();
  const [css_content, setCssContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const isEditMode = !!styleId;

  useEffect(() => {
    if (isEditMode && initialData) {
      setCssContent(initialData.css_content || '');
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

    const payload: CreateStylePayload | UpdateStylePayload = {
      css_content,
    };

    try {
      const apiPath = `/api/sites/${siteId}/styles`;
      const method = isEditMode ? 'PUT' : 'POST';
      const response = await fetch(apiPath, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as Style | { message: string };

      if (!response.ok) {
        const errorMessage = isEditMode ? 'スタイルの更新に失敗しました' : 'スタイルの作成に失敗しました';
        const errorDetail = (data as { message: string }).message || '不明なエラーが発生しました';
        throw new Error(`${errorMessage}: ${errorDetail}`);
      }

      const newStyleData = data as Style;
      console.log(isEditMode ? 'スタイルが更新されました:' : 'スタイルが作成されました:', newStyleData);
      if (isEditMode) {
        setToast({ message: 'スタイルが更新されました', type: 'success' });
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
    <div className='style-form mb-12'>
      {error && <p className='text-red-400 text-sm mb-4'>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className='mb-4'>
          <label htmlFor='css_content' className='block text-sm mb-1 text-neutral-400'>
            CSS Content
          </label>
          <div className='w-full border border-neutral-200'>
            <CodeEditor value={css_content} onChange={e => setCssContent(e)} height='500px' language='css' />
          </div>
        </div>
        <div className='mb-4'>
          <button
            type='submit'
            className='bg-blue-500 text-white hover:bg-blue-600 transition px-4 py-2 rounded'
            disabled={isLoading}
          >
            {isLoading ? '処理中...' : isEditMode ? '更新' : '作成'}
          </button>
        </div>

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
