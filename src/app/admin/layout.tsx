import AuthProvider from '@/components/AuthProvider';
import type { ReactNode } from 'react';
import AdminHeader from '@/components/AdminHeader';
import AdminFooter from '@/components/AdminFooter';

export const metadata = {
  title: 'Careemo Dashboard',
  description: 'Careemo Dashboard',
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <body>
      <AuthProvider>
        <div className='flex flex-col min-h-screen'>
          <AdminHeader />
          <main>{children}</main>
          <AdminFooter />
        </div>
      </AuthProvider>
    </body>
  );
}
