import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.OAUTH_CLIENT_ID as string,
      clientSecret: process.env.OAUTH_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn(data: any) {
      const { user, profile } = data;

      console.log('DATA! ', data);

      const response = await fetch(
        process.env.NEXT_PUBLIC_STELLAR_API + '/create-account',
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

      return true;
    },
  },
});

export { handler as GET, handler as POST };
