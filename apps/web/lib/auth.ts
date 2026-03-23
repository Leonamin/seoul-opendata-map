import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const providers: NextAuthOptions['providers'] = [];

// Only add Google if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const GoogleProvider = require('next-auth/providers/google').default;
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// Only add Email if server is configured
if (process.env.EMAIL_SERVER) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const EmailProvider = require('next-auth/providers/email').default;
  providers.push(
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM ?? 'noreply@example.com',
    })
  );
}

// Fallback: anonymous guest login for development
if (providers.length === 0) {
  providers.push(
    CredentialsProvider({
      name: 'Guest',
      credentials: {},
      async authorize() {
        return { id: 'guest', name: 'Guest', email: 'guest@localhost' };
      },
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-do-not-use-in-production',
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) {
        (session as { accessToken?: string }).accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
