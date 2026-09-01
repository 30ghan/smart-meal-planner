import { NextResponse, type NextRequest } from "next/server";

// /meals, /preferences, and /planner are intentionally NOT here -- guests
// can browse meals, set guest-only preferences, and preview the planner
// without an account. Only /dashboard (which is meaningless without a
// saved account) stays gated at the route level. The pages behind
// /preferences and /planner branch on auth state themselves to show a
// guest-appropriate experience instead of calling endpoints that require
// login (see AuthContext's `user`).
const PROTECTED_PREFIXES = ["/dashboard"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !request.cookies.get("access_token")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
