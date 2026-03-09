import { buildSignInPath } from "./redirects";
import { hasRole, type UserRole } from "./roles";

type ProtectedRouteContext = {
  hasUser: boolean;
  pathname: string;
  role?: UserRole | string | null;
  search?: string;
};

export function resolveProtectedRouteRedirect({
  hasUser,
  pathname,
  role,
  search = "",
}: ProtectedRouteContext): string | null {
  const next = `${pathname}${search}`;

  if (!hasUser && (pathname.startsWith("/creator") || pathname.startsWith("/admin"))) {
    return buildSignInPath(next);
  }

  if (pathname.startsWith("/admin") && !hasRole(role, "ADMIN")) {
    return "/me?denied=admin";
  }

  return null;
}
