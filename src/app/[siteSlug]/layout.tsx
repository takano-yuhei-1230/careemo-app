import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSiteBySlug } from '@/services/SiteService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/Auth';

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { siteSlug: string };
}) {
  const site = await getSiteBySlug(params.siteSlug);

  if (!site) {
    // サイトが見つからない場合は404表示なのでHeader,Footerは読み込まない
    return <body>{children}</body>;
  }
  const siteStatus = site.status;
  const session = await getServerSession(authOptions);
  if (siteStatus === 'private' || siteStatus === 'draft') {
    // サイトが非公開の場合、非ログイン
    if (!session) {
      return <body>{children}</body>;
    }
  }

  const googleTagManagerId = process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID || '';

  return (
    <>
      <head>
        <link rel='stylesheet' href={`/${params.siteSlug}/style.css`} />
        {googleTagManagerId && (
          <>
            {/* Google Tag Manager */}
            <script
              dangerouslySetInnerHTML={{
                __html: `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${googleTagManagerId}');
`,
              }}
            />
          </>
        )}
      </head>
      <body>
        {googleTagManagerId && (
          <>
            <noscript
              dangerouslySetInnerHTML={{
                __html: `
<iframe src="https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe>
`,
              }}
            />
          </>
        )}
        <Header siteId={site.id} />
        {children}
        <Footer siteId={site.id} />
      </body>
    </>
  );
}
