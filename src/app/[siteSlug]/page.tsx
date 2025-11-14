import { getPageBySlug } from '@/services/PageService';
import { getSiteBySlug } from '@/services/SiteService';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/Auth';
import type { Page } from '@/types/page';

async function getIndexPage(siteSlug: string): Promise<Page | null> {
  const indexPage = await getPageBySlug(siteSlug, 'index');
  return indexPage;
}

export async function generateMetadata({ params }: { params: { siteSlug: string } }): Promise<Metadata> {
  const site = await getSiteBySlug(params.siteSlug);
  const indexPage = await getIndexPage(params.siteSlug);

  if (!site) {
    return {
      title: '404 Not Found',
      description: '404 Not Found',
    };
  }

  if (indexPage) {
    return {
      title: indexPage.title,
      description: indexPage.description,
    };
  }

  return {
    title: site.name,
    description: site.name,
  };
}

export default async function SitePage({ params }: { params: { siteSlug: string } }) {
  const site = await getSiteBySlug(params.siteSlug);

  if (!site) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const siteStatus = site.status;
  if (siteStatus === 'private' || siteStatus === 'draft') {
    if (!session) {
      notFound();
    }
  }

  const indexPage = await getIndexPage(params.siteSlug);

  const indexPageStatus = indexPage?.status;
  if (indexPageStatus === 'private' || indexPageStatus === 'draft') {
    if (!session) {
      notFound();
    }
  }

  return (
    <>
      {indexPage ? (
        <main dangerouslySetInnerHTML={{ __html: indexPage.html_content || '' }} />
      ) : (
        <main className='flex flex-col items-center justify-center py-[300px]'>
          <p>インデックスページが作成されていません</p>
        </main>
      )}
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
      {indexPageStatus === 'private' && (
        <div className='px-4 leading-8 fixed bottom-0 left-0 w-full bg-red-400 text-white z-50 opacity-90'>
          Page Status: 非公開
        </div>
      )}
      {indexPageStatus === 'draft' && (
        <div className='px-4 leading-8 fixed bottom-0 left-0 w-full bg-neutral-400 text-white z-50 opacity-90'>
          Page Status: 下書き
        </div>
      )}
    </>
  );
}
