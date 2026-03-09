export const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export function normalizeEmail(email?: string | null): string | null {
  if (!email) {
    return null;
  }

  const normalizedEmail = email.trim().toLowerCase();
  return normalizedEmail.length > 0 ? normalizedEmail : null;
}

export function normalizeRole(role?: string | null): UserRole {
  return role === ROLES.ADMIN ? ROLES.ADMIN : ROLES.USER;
}

const ROLE_PRIORITY: Record<UserRole, number> = {
  USER: 0,
  ADMIN: 1,
};

function getAdminEmailWhitelist(): Set<string> {
  const rawValue = process.env.AUTH_ADMIN_EMAILS ?? "";
  const emails = rawValue
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter((email): email is string => Boolean(email));

  return new Set(emails);
}

export function resolveUserRole(email?: string | null): UserRole {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return ROLES.USER;
  }

  return getAdminEmailWhitelist().has(normalizedEmail) ? ROLES.ADMIN : ROLES.USER;
}

export function hasRole(role: UserRole | string | null | undefined, requiredRole: UserRole): boolean {
  if (!role) {
    return false;
  }

  return ROLE_PRIORITY[normalizeRole(role)] >= ROLE_PRIORITY[requiredRole];
}
