"use client";

import { useSession } from "next-auth/react";

import { normalizeRole, type UserRole } from "./roles";

type ClientUser = {
  email?: string | null;
  image?: string | null;
  name?: string | null;
  role: UserRole;
};

export function useCurrentSession() {
  const { data, status, update } = useSession();

  const user: ClientUser | null = data?.user
    ? {
        email: data.user.email,
        image: data.user.image,
        name: data.user.name,
        role: normalizeRole(data.user.role),
      }
    : null;

  return {
    session: data ?? null,
    status,
    update,
    user,
    isAuthenticated: status === "authenticated",
  };
}
