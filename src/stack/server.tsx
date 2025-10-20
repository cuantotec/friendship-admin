import "server-only";
import { StackServerApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
  secretServerKey: process.env.SECRET_SERVER_KEY,
  urls: {
    signIn: '/login',
    passwordReset: '/reset-password',
    home: '/',
    afterSignIn: '/handler/setup',
    afterSignOut: '/login',
  },
});
