import { redirect } from "next/navigation";

import { buildSignInPath, normalizeRedirectPath } from "@/app/lib/auth/redirects";
import { getCurrentUser } from "@/app/lib/auth/session";

type AuthCallbackPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function AuthCallbackPage({ searchParams }: AuthCallbackPageProps) {
  const { next } = await searchParams;
  const nextPath = normalizeRedirectPath(next);
  const user = await getCurrentUser();

  if (!user) {
    redirect(buildSignInPath(nextPath));
  }

  redirect(nextPath);
}
