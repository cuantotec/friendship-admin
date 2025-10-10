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

  const missing = required.filter(key => !process.env[key]);
  const emailMissing = emailRequired.filter(key => !process.env[key]);
  const warnings = optional.filter(key => !process.env[key]);

  return {
    isValid: missing.length === 0,
    missing,
    emailMissing,
    warnings,
    hasEmailConfig: emailMissing.length === 0
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

  return env;
}
