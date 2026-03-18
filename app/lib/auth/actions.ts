"use server";

import { signIn, signOut } from "@/auth";

import { isDemoAuthEnabled, isGoogleAuthEnabled, parseDemoLoginMode } from "./demo-auth";
import { buildAuthCallbackPath, getDefaultSignedOutRedirect, normalizeRedirectPath } from "./redirects";

export async function signInWithGoogleAction(formData: FormData) {
  if (!isGoogleAuthEnabled()) {
    throw new Error("Google 登录当前未启用。");
  }

  const next = normalizeRedirectPath(formData.get("next"));

  await signIn("google", {
    redirectTo: buildAuthCallbackPath(next),
  });
}

export async function signInWithDemoAction(formData: FormData) {
  if (!isDemoAuthEnabled()) {
    throw new Error("Demo 登录当前未启用。");
  }

  const mode = parseDemoLoginMode(formData.get("mode"));

  if (!mode) {
    throw new Error("Demo 登录身份无效。");
  }

  const next = normalizeRedirectPath(formData.get("next"));

  await signIn("credentials", {
    mode,
    redirectTo: buildAuthCallbackPath(next),
  });
}

export async function signOutAction() {
  await signOut({
    redirectTo: getDefaultSignedOutRedirect(),
  });
}
