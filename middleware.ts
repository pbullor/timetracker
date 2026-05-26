import { auth } from "@/lib/auth-config";
import { NextResponse } from "next/server";

export default auth((req) => {
  const publicPaths = ["/", "/login", "/pricing", "/extension"];
  if (!req.auth?.user && !publicPaths.includes(req.nextUrl.pathname)) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }
  const response = NextResponse.next();
  response.headers.set("x-pathname", req.nextUrl.pathname);
  return response;
});

export const config = {
  matcher: [
    "/((?!api/auth|api/claude|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|llms.txt).*)",
  ],
};
