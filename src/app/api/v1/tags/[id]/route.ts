import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/get-user-id";
import { updateTagSchema } from "@/lib/validation";
import { successResponse, handleApiError } from "@/lib/api-response";
import { NotFoundError, ForbiddenError, ValidationError } from "@/lib/errors";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const userId = await getUserId();
    const { id } = await params;

    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { notes: true },
        },
      },
    });

    if (!tag) {
      throw new NotFoundError("Tag");
    }

    if (tag.userId !== userId) {
      throw new ForbiddenError();
    }

    return successResponse(tag);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const userId = await getUserId();
    const { id } = await params;
    const body: unknown = await request.json();
    const data = updateTagSchema.parse(body);

    const existingTag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      throw new NotFoundError("Tag");
    }

    if (existingTag.userId !== userId) {
      throw new ForbiddenError();
    }

    if (data.name && data.name !== existingTag.name) {
      const duplicateTag = await prisma.tag.findFirst({
        where: { name: data.name, userId, NOT: { id } },
      });

      if (duplicateTag) {
        throw new ValidationError("Tag with this name already exists");
      }
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.color !== undefined && { color: data.color }),
      },
      include: {
        _count: {
          select: { notes: true },
        },
      },
    });

    return successResponse(tag);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const userId = await getUserId();
    const { id } = await params;

    const tag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundError("Tag");
    }

    if (tag.userId !== userId) {
      throw new ForbiddenError();
    }

    await prisma.tag.delete({
      where: { id },
    });

    return successResponse({ message: "Tag deleted successfully" });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
