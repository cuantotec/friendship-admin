interface ForgotPasswordPageProps {
  searchParams: {
    code?: string;
  };
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const { code } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {code ? 'Reset Password' : 'Forgot Password'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {code 
              ? 'Password reset functionality will be available soon.'
              : 'Password reset functionality will be available soon.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}