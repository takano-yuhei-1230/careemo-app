export const metadata = {
  title: 'Careemo',
  description: 'Careemo',
};

const googleTagManagerId = process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID || '';

export default function Home() {
  return (
    <>
      <head>
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
        <main className='flex flex-col items-center justify-center h-screen'>
          <h1 className='text-4xl font-bold text-neutral-900'>Careemo</h1>
        </main>
      </body>
    </>
  );
}
