import 'next-auth';
import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user']; // DefaultSession['user'] をマージ (name, email, image を保持)
  }

  interface User extends DefaultUser {
    // DefaultUser は id, name, email, image を持つ可能性があります。
    // 必要に応じてここにカスタムプロパティを追加できます。
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    // DefaultJWT は name, email, picture, sub を持つ可能性があります。
    id?: string; // authorize コールバックから返す id を格納
  }
}
