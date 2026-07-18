import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    if (
      req.nextUrl.pathname.startsWith("/admin") &&
      req.nextauth.token?.role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const path = req.nextUrl.pathname;
        if (path.startsWith("/admin")) return token?.role === "admin";
        if (path.startsWith("/productos")) return token !== null;
        return token !== null;
      },
    },
  }
);

export const config = {
  matcher: ["/", "/productos/:path*", "/admin/:path*"],
};
