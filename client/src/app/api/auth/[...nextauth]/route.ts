import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

declare module 'next-auth' {
  interface User {
    isAdmin?: boolean;
  }
  interface Session {
    user: {
      isAdmin?: boolean;
    };
  }
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.OAUTH_CLIENT_ID as string,
      clientSecret: process.env.OAUTH_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const response = await fetch(
          process.env.NEXT_PUBLIC_STELLAR_API + '/public/login',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          },
        );

        const data = await response.json();

        if (response.ok && data) {
          return { ...data.user, isAdmin: data.isAdmin || false };
        } else {
          throw new Error(data.error);
        }
      },
    }),
  ],
  callbacks: {
    async signIn(data) {
      const { user, account, profile } = data;
      console.log('data USER!', data);

      // Only proceed with account creation for Google sign-in
      if (account?.provider === 'google') {
        try {
          const response = await fetch(
            process.env.NEXT_PUBLIC_STELLAR_API +
              '/public/create-account-social',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...user,
                first_name: profile.name,
              }),
            },
          );

          console.log('response!', response);

          if (response.status === 401) {
            console.log('User already exists');
            // Still return true to allow sign-in even if user exists
            return true;
          }

          if (!response.ok) {
            console.error('Failed to create account');
            return false;
          }
        } catch (error) {
          console.error('Error during account creation:', error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.isAdmin || false;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.isAdmin = Boolean(token.isAdmin);
      return session;
    },
  },
});

export { handler as GET, handler as POST };
