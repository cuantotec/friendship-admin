import "server-only";

import { StackServerApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  projectId: process.env.STACK_PROJECT_ID,
  publishableClientKey: process.env.STACK_PUBLIC_KEY,
  secretServerKey: process.env.STACK_API_KEY,
  urls: {
    signIn: '/login',
    passwordReset: '/forgot-password',
  },
});
