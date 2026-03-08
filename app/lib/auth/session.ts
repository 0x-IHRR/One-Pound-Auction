import type { Session } from "next-auth";

import { auth } from "@/auth";

import { normalizeRole, type UserRole } from "./roles";

export type CurrentUser = {
  email: string;
  image?: string | null;
  name?: string | null;
  role: UserRole;
};

function normalizeSession(session: Session | null): Session | null {
  if (!session?.user) {
    return null;
  }

  return {
    ...session,
    user: {
      ...session.user,
      role: normalizeRole(session.user.role),
    },
  };
}

export async function getCurrentSession(): Promise<Session | null> {
  const session = await auth();
  return normalizeSession(session);
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getCurrentSession();
  const sessionUser = session?.user;
  const email = sessionUser?.email?.trim();

  if (!sessionUser || !email) {
    return null;
  }

  return {
    email,
    image: sessionUser.image ?? null,
    name: sessionUser.name ?? null,
    role: normalizeRole(sessionUser.role),
  };
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getCurrentUser()) !== null;
}
