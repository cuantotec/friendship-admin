import { SignIn } from "@stackframe/stack";

export function MySignInPage() {
  return (
    <SignIn
      fullPage={true}
      automaticRedirect={true}
      extraInfo={<>By signing in, you agree to our <a href="/terms">Terms</a></>}
    />
  );
}
