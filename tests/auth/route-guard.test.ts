import { describe, expect, it } from "vitest";

import { resolveProtectedRouteRedirect } from "@/app/lib/auth/route-guard";

describe("route guard branches", () => {
  it("redirects unauthenticated creator access to sign-in", () => {
    expect(
      resolveProtectedRouteRedirect({
        hasUser: false,
        pathname: "/creator",
      }),
    ).toBe("/sign-in?next=%2Fcreator");
  });

  it("preserves the original admin target when unauthenticated", () => {
    expect(
      resolveProtectedRouteRedirect({
        hasUser: false,
        pathname: "/admin",
        search: "?tab=ops",
      }),
    ).toBe("/sign-in?next=%2Fadmin%3Ftab%3Dops");
  });

  it("redirects authenticated non-admin users away from admin", () => {
    expect(
      resolveProtectedRouteRedirect({
        hasUser: true,
        pathname: "/admin",
        role: "USER",
      }),
    ).toBe("/me?denied=admin");
  });

  it("allows authenticated admins through", () => {
    expect(
      resolveProtectedRouteRedirect({
        hasUser: true,
        pathname: "/admin",
        role: "ADMIN",
      }),
    ).toBeNull();
  });
});
