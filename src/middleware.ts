import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const protectedPaths = ["/api/v1/notes", "/api/v1/tags", "/api/v1/categories"];

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get("access_token")?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 },
    );
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return NextResponse.json(
      { success: false, error: "Server configuration error" },
      { status: 500 },
    );
  }

  try {
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId as string);
    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid or expired token" },
      { status: 401 },
    );
  }
}

export const config = {
  matcher: [
    "/api/v1/notes/:path*",
    "/api/v1/tags/:path*",
    "/api/v1/categories/:path*",
  ],
};
