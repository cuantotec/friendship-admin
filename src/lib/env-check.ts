// Environment variables check for authentication
export function checkAuthEnv() {
  const required = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ];

  const optional = [
    'EMAIL_SERVER_HOST',
    'EMAIL_SERVER_PORT',
    'EMAIL_SERVER_USER',
    'EMAIL_SERVER_PASSWORD',
    'EMAIL_FROM'
  ];

  const emailRequired = [
    'RESEND_API_KEY'
  ];

  const stackAuthRequired = [
    'NEXT_PUBLIC_STACK_PROJECT_ID',
    'NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY',
    'SECRET_SERVER_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  const emailMissing = emailRequired.filter(key => !process.env[key]);
  const stackAuthMissing = stackAuthRequired.filter(key => !process.env[key]);
  const warnings = optional.filter(key => !process.env[key]);

  return {
    isValid: missing.length === 0,
    missing,
    emailMissing,
    stackAuthMissing,
    warnings,
    hasEmailConfig: emailMissing.length === 0,
    hasStackAuthConfig: stackAuthMissing.length === 0
  };
}

export function getAuthConfigStatus() {
  const env = checkAuthEnv();
  
  if (!env.isValid) {
    throw new Error(`Missing required environment variables: ${env.missing.join(', ')}`);
  }

  if (env.emailMissing.length > 0) {
    throw new Error(`Missing email configuration: ${env.emailMissing.join(', ')}`);
  }

  if (env.stackAuthMissing.length > 0) {
    throw new Error(`Missing Stack Auth configuration: ${env.stackAuthMissing.join(', ')}`);
  }

  return env;
}
