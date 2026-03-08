const DEFAULT_SIGNED_IN_REDIRECT = "/me";
const DEFAULT_SIGNED_OUT_REDIRECT = "/";

function isBlockedPath(pathname: string): boolean {
  return pathname.startsWith("/api/auth") || pathname === "/sign-in" || pathname === "/auth/callback";
}

export function normalizeRedirectPath(
  value: FormDataEntryValue | string | null | undefined,
  fallback = DEFAULT_SIGNED_IN_REDIRECT,
): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const pathname = value.trim();

  if (!pathname.startsWith("/") || pathname.startsWith("//") || isBlockedPath(pathname)) {
    return fallback;
  }

  return pathname;
}

export function buildSignInPath(next?: string | null): string {
  const normalizedNext = normalizeRedirectPath(next);
  const params = new URLSearchParams({ next: normalizedNext });

  return `/sign-in?${params.toString()}`;
}

export function buildAuthCallbackPath(next?: string | null): string {
  const normalizedNext = normalizeRedirectPath(next);
  const params = new URLSearchParams({ next: normalizedNext });

  return `/auth/callback?${params.toString()}`;
}

export function getDefaultSignedOutRedirect(): string {
  return DEFAULT_SIGNED_OUT_REDIRECT;
}
