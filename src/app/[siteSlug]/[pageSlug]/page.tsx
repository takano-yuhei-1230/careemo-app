import { getSiteBySlug } from '@/services/SiteService';
import { getPageBySlug } from '@/services/PageService';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/Auth';

export async function generateMetadata({ params }: { params: { siteSlug: string; pageSlug: string } }) {
  const site = await getSiteBySlug(params.siteSlug);
  const pageData = await getPageBySlug(params.siteSlug, params.pageSlug);

  if (!site || !pageData) {
    return {
      title: 'ページが見つかりません',
      description: 'ページが見つかりません',
    };
  }

  return {
    title: `${pageData.title} - ${site.name}`,
    description: pageData.description,
  };
}

export default async function Page({ params }: { params: { siteSlug: string; pageSlug: string } }) {
  // スラッグが index の場合はトップページにリダイレクトする
  if (params.pageSlug === 'index') {
    return redirect(`/${params.siteSlug}`);
  }
  const site = await getSiteBySlug(params.siteSlug);
  const pageData = await getPageBySlug(params.siteSlug, params.pageSlug);

  if (!site || !pageData) {
    notFound();
  }

  const session = await getServerSession(authOptions);

  const siteStatus = site.status;
  if (siteStatus === 'private' || siteStatus === 'draft') {
    if (!session) {
      notFound();
    }
  }
  const pageStatus = pageData.status;
  if (pageStatus === 'private' || pageStatus === 'draft') {
    if (!session) {
      notFound();
    }
  }

  return (
    <>
      <main dangerouslySetInnerHTML={{ __html: pageData.html_content || '' }} />
      {siteStatus === 'private' && (
        <div className='px-4 leading-8 fixed bottom-0 left-0 w-full bg-red-400 text-white z-50 opacity-90'>
          Site Status: 非公開
        </div>
      )}
      {siteStatus === 'draft' && (
        <div className='px-4 leading-8 fixed bottom-0 left-0 w-full bg-neutral-400 text-white z-50 opacity-90'>
          Site Status: 下書き
        </div>
      )}
      {pageStatus === 'private' && (
        <div className='px-4 leading-8 fixed bottom-0 left-0 w-full bg-red-400 text-white z-50 opacity-90'>
          Page Status: 非公開
        </div>
      )}
      {pageStatus === 'draft' && (
        <div className='px-4 leading-8 fixed bottom-0 left-0 w-full bg-neutral-400 text-white z-50 opacity-90'>
          Page Status: 下書き
        </div>
      )}
    </>
  );
}
