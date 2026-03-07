import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const publicPaths = [
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/refresh",
];

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const isPublic = publicPaths.some((p) => pathname === p);
  if (isPublic) {
    const headers = new Headers(request.headers);
    headers.delete("x-user-id");
    return NextResponse.next({ request: { headers } });
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
    if (typeof payload.userId !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid token payload" },
        { status: 401 },
      );
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.delete("x-user-id");
    requestHeaders.set("x-user-id", payload.userId);
    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid or expired token" },
      { status: 401 },
    );
  }
}

export const config = {
  matcher: ["/api/v1/:path*"],
};
