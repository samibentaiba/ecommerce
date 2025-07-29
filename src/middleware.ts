import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth;

    // Public routes that don't require authentication
    const publicRoutes = [
      "/admin/signin",
      "/admin/register",
      "/admin/forgot-password",
      "/admin/reset-password",
    ];

    // Check if the current path is a public route
    const isPublicRoute = publicRoutes.some((route) =>
      pathname.startsWith(route)
    );

    // If it's a public route, allow access
    if (isPublicRoute) {
      return NextResponse.next();
    }

    // Check if it's an admin route
    if (pathname.startsWith("/admin")) {
      // If no token, redirect to login
      if (!token) {
        const loginUrl = new URL("/admin/signin", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Token is valid, allow access
      return NextResponse.next();
    }

    // For non-admin routes, allow access
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public routes that don't require authentication
        const publicRoutes = [
          "/admin/signin",
          "/admin/register",
          "/admin/forgot-password",
          "/admin/reset-password",
        ];

        // Check if the current path is a public route
        const isPublicRoute = publicRoutes.some((route) =>
          pathname.startsWith(route)
        );

        // If it's a public route, allow access
        if (isPublicRoute) {
          return true;
        }

        // Check if it's an admin route
        if (pathname.startsWith("/admin")) {
          return !!token;
        }

        // For non-admin routes, allow access
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
