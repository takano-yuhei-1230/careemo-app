export const metadata = {
  title: '404 Not Found',
  description: '404 Not Found',
};

export default function NotFound() {
  return (
    <>
      <body>
        <div className='flex flex-col items-center justify-center h-screen'>
          <h1 className='text-4xl font-bold text-neutral-900'>404 Not Found</h1>
          <p className='text-xl text-neutral-500'>ページが見つかりません</p>
        </div>
      </body>
    </>
  );
}
