import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // 環境変数から管理者情報を取得
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!credentials || !adminUsername || !adminPassword) {
          console.error('Authentication environment variables not set');
          return null;
        }

        if (credentials.username === adminUsername && credentials.password === adminPassword) {
          // 認証成功
          return { id: '1', name: 'Admin', email: 'admin@example.com' }; // DBを使用しないのでダミーのユーザー情報を返す
        } else {
          // 認証失敗
          console.log('Invalid credentials');
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 1日
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/admin/login', // ログインページのパス
    // error: '/auth/error', // エラーページ (任意)
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string; // session.user に id を追加
      }
      return session;
    },
  },
};
