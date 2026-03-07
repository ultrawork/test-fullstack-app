import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import {
  validateEmail,
  validatePassword,
  validateName,
  badRequestResponse,
  conflictResponse,
} from "@/lib/validation";
import type { AuthResponse, UserDTO } from "@/types";

export async function POST(request: NextRequest): Promise<Response> {
  const body = await request.json().catch(() => null);
  if (!body) return badRequestResponse("Invalid JSON");

  const { email, password, name } = body;

  if (!validateEmail(email)) return badRequestResponse("Invalid email");
  if (!validatePassword(password))
    return badRequestResponse("Password must be at least 6 characters");
  if (!validateName(name))
    return badRequestResponse("Name is required (max 100 characters)");

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (existing) return conflictResponse("Email already in use");

  const hashedPassword = await hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
    },
  });

  const token = generateToken(user.id);
  const userDTO: UserDTO = {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
  };

  const response: AuthResponse = { user: userDTO, token };
  return Response.json(response, { status: 201 });
}
