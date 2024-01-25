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
      const { user } = data;
      console.log('User signing in:', user);
      // create account if it doesn't exist already
      return true;
    },
  },
});

export { handler as GET, handler as POST };
