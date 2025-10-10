import { neon } from '@neondatabase/serverless';
import { NeonAuth } from '@neondatabase/auth';

// Initialize Neon Auth
const neonAuth = new NeonAuth({
  neon: neon(process.env.DATABASE_URL!),
  secret: process.env.NEXTAUTH_SECRET!,
  baseUrl: process.env.NEXTAUTH_URL!,
});

export { neonAuth };

// Auth configuration for Neon
export const neonAuthConfig = {
  providers: [
    {
      id: 'email',
      name: 'Email',
      type: 'email',
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    },
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
};
