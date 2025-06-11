import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSiteBySlug } from '@/services/SiteService';

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { siteSlug: string };
}) {
  const site = await getSiteBySlug(params.siteSlug);

  if (!site) {
    return <body>{children}</body>;
  }

  return (
    <>
      <head>
        <link rel='stylesheet' href={`/${params.siteSlug}/style.css`} />
      </head>
      <body>
        <Header siteId={site.id} />
        {children}
        <Footer siteId={site.id} />
      </body>
    </>
  );
}
