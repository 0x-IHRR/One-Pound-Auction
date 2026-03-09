import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { resolveProtectedRouteRedirect } from "@/app/lib/auth/route-guard";

export default auth((request) => {
  const redirectPath = resolveProtectedRouteRedirect({
    hasUser: Boolean(request.auth?.user),
    pathname: request.nextUrl.pathname,
    role: request.auth?.user?.role,
    search: request.nextUrl.search,
  });

  if (redirectPath) {
    return NextResponse.redirect(new URL(redirectPath, request.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/creator/:path*", "/admin/:path*"],
};
