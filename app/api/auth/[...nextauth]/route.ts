import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { EnvironmentConfig } from '@/infrastructure/config';

// Only configure NextAuth if authentication is enabled
const authOptions: NextAuthOptions = EnvironmentConfig.AUTH_ENABLED
  ? {
      providers: [
        GoogleProvider({
          clientId: EnvironmentConfig.GOOGLE_CLIENT_ID,
          clientSecret: EnvironmentConfig.GOOGLE_CLIENT_SECRET,
        }),
      ],
      callbacks: {
        async signIn() {
          // Allow any Google account to sign in
          return true;
        },
        async session({ session, token }) {
          // Add user ID to session
          if (session.user && token.sub) {
            session.user.id = token.sub;
          }
          return session;
        },
      },
      pages: {
        signIn: '/',
        error: '/',
      },
    }
  : {
      // Minimal config when auth is disabled
      providers: [],
      callbacks: {},
    };

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
