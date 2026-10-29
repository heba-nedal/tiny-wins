type T = (key: string) => string;
type AuthErr = { code?: string; message?: string } | null | undefined;

const KEYS: Record<string, string> = {
  invalid_credentials: "errors.auth.invalidCredentials",
  email_not_confirmed: "errors.auth.emailNotConfirmed",
  user_already_exists: "errors.auth.alreadyRegistered",
  weak_password: "auth.passwordShort",
  over_email_send_rate_limit: "errors.auth.rateLimit",
  over_request_rate_limit: "errors.auth.rateLimit",
};

const MESSAGE_MATCHERS: [RegExp, string][] = [
  [/invalid login credentials|invalid credentials/i, "errors.auth.invalidCredentials"],
  [/email not confirmed/i, "errors.auth.emailNotConfirmed"],
  [/already registered|already exists/i, "errors.auth.alreadyRegistered"],
  [/password should be|weak password/i, "auth.passwordShort"],
  [/rate limit|too many requests/i, "errors.auth.rateLimit"],
];

export function authErrorKey(error: AuthErr): string {
  if (error?.code && KEYS[error.code]) return KEYS[error.code];
  const msg = error?.message ?? "";
  for (const [re, key] of MESSAGE_MATCHERS) if (re.test(msg)) return key;
  return "errors.generic";
}

export function authErrorMessage(error: AuthErr, t: T): string {
  const key = authErrorKey(error);
  if (key === "errors.generic") console.error("Unrecognized auth error:", error);
  return t(key);
}
