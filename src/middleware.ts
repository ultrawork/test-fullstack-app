import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const protectedPaths = ["/dashboard", "/api/v1/notes", "/api/v1/categories"];
const authPaths = ["/login", "/register"];

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");
  return new TextEncoder().encode(secret);
}

export async function middleware(
  request: NextRequest,
): Promise<NextResponse> {
  try {
    const { pathname } = request.nextUrl;

    const isProtected = protectedPaths.some((path) =>
      pathname.startsWith(path),
    );
    const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

    const accessToken = request.cookies.get("access_token")?.value;

    let isAuthenticated = false;
    if (accessToken) {
      try {
        const secret = process.env.JWT_SECRET;
        if (secret) {
          await jwtVerify(accessToken, new TextEncoder().encode(secret));
          isAuthenticated = true;
        }
      } catch {
        isAuthenticated = false;
      }
    }

    if (isProtected && !isAuthenticated) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 },
        );
      }
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAuthPath && isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
    "/api/v1/notes/:path*",
    "/api/v1/categories/:path*",
  ],
};
