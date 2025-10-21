const requiredEnvVars = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

const optionalEnvVars = {
  OAUTH_REDIRECT_URL:
    process.env.SUPABASE_OAUTH_REDIRECT_URL ?? "http://localhost:3000/auth/callback",
  OAUTH_SUCCESS_PATH: process.env.SUPABASE_OAUTH_SUCCESS_PATH ?? "/",
  OAUTH_ERROR_PATH: process.env.SUPABASE_OAUTH_ERROR_PATH ?? "/login?error=oauth",
};

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export const supabaseEnv = {
  url: requiredEnvVars.SUPABASE_URL as string,
  anonKey: requiredEnvVars.SUPABASE_ANON_KEY as string,
  oauthRedirectUrl: optionalEnvVars.OAUTH_REDIRECT_URL,
  oauthSuccessPath: optionalEnvVars.OAUTH_SUCCESS_PATH,
  oauthErrorPath: optionalEnvVars.OAUTH_ERROR_PATH,
};
