import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

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
        console.log('CREDENTIALS! ', credentials);
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
          return data.user;
        } else {
          // return error to frontend
          throw new Error(data.error);
        }
      },
    }),
  ],
  callbacks: {
    async signIn(data: any) {
      const { user, profile } = data;

      if (profile) {
        const response = await fetch(
          process.env.NEXT_PUBLIC_STELLAR_API + '/public/create-account-social',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...user,
              first_name: profile?.given_name,
              last_name: profile?.family_name,
            }),
          },
        );

        if (response.status === 401) {
          console.log('User already exists');
        }
      }

      return true;
    },
  },
});

export { handler as GET, handler as POST };
