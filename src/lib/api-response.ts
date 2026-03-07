import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "./errors";

export function successResponse<T>(
  data: T,
  status: number = 200,
): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(
  error: string,
  status: number = 500,
  details?: Record<string, string[]>,
): NextResponse {
  return NextResponse.json(
    { success: false, error, ...(details && { details }) },
    { status },
  );
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    const details: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const path = issue.path.join(".");
      if (!details[path]) {
        details[path] = [];
      }
      details[path].push(issue.message);
    }
    return errorResponse("Validation failed", 400, details);
  }

  if (error instanceof AppError) {
    return errorResponse(error.message, error.statusCode, error.details);
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    const target = (error.meta?.target as string[]) ?? [];
    const field = target[target.length - 1] ?? "field";
    return errorResponse(`A record with this ${field} already exists`, 400);
  }

  console.error("Unhandled error:", error);
  return errorResponse("Internal server error", 500);
}
