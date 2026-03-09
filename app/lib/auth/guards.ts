import { getCurrentUser } from "./session";
import { hasRole, ROLES } from "./roles";

type AuthGuardCode = "UNAUTHENTICATED" | "FORBIDDEN";

export class AuthGuardError extends Error {
  code: AuthGuardCode;

  constructor(code: AuthGuardCode, message: string) {
    super(message);
    this.name = "AuthGuardError";
    this.code = code;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthGuardError("UNAUTHENTICATED", "Authentication required.");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (!hasRole(user.role, ROLES.ADMIN)) {
    throw new AuthGuardError("FORBIDDEN", "Admin access required.");
  }

  return user;
}

export function isAuthGuardError(error: unknown): error is AuthGuardError {
  return error instanceof AuthGuardError;
}
