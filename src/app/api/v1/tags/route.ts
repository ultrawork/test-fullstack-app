import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/get-user-id";
import { createTagSchema } from "@/lib/validation";
import { successResponse, handleApiError } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";

export async function GET(): Promise<NextResponse> {
  try {
    const userId = await getUserId();

    const tags = await prisma.tag.findMany({
      where: { userId },
      include: {
        _count: {
          select: { notes: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return successResponse({ tags });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getUserId();
    const body: unknown = await request.json();
    const data = createTagSchema.parse(body);

    const existingTag = await prisma.tag.findFirst({
      where: { name: data.name, userId },
    });

    if (existingTag) {
      throw new ValidationError("Tag with this name already exists");
    }

    const tag = await prisma.tag.create({
      data: {
        name: data.name,
        color: data.color,
        userId,
      },
      include: {
        _count: {
          select: { notes: true },
        },
      },
    });

    return successResponse(tag, 201);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
