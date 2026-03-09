"use server";

import { signIn, signOut } from "@/auth";

import { buildAuthCallbackPath, getDefaultSignedOutRedirect, normalizeRedirectPath } from "./redirects";

export async function signInWithGoogleAction(formData: FormData) {
  const next = normalizeRedirectPath(formData.get("next"));

  await signIn("google", {
    redirectTo: buildAuthCallbackPath(next),
  });
}

export async function signOutAction() {
  await signOut({
    redirectTo: getDefaultSignedOutRedirect(),
  });
}
