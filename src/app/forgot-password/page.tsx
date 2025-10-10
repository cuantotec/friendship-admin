import { ForgotPassword, PasswordReset } from '@stackframe/stack';

interface ForgotPasswordPageProps {
  searchParams: {
    code?: string;
  };
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const { code } = await searchParams;

  // If there's a code, show the password reset form
  if (code) {
    return (
      <PasswordReset
        searchParams={{ code }}
        fullPage={true}
      />
    );
  }

  // Otherwise show the forgot password form
  return <ForgotPassword fullPage={true} />;
}