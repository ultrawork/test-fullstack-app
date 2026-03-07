import { NextRequest } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import { validateEmail, validatePassword, badRequestResponse } from "@/lib/validation";
import type { AuthResponse, UserDTO } from "@/types";

export async function POST(request: NextRequest): Promise<Response> {
  const body = await request.json().catch(() => null);
  if (!body) return badRequestResponse("Invalid JSON");

  const { email, password } = body;

  if (!validateEmail(email)) return badRequestResponse("Invalid email");
  if (!validatePassword(password))
    return badRequestResponse("Password must be at least 6 characters");

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user) return Response.json({ error: "Invalid credentials" }, { status: 401 });

  const valid = await compare(password, user.password);
  if (!valid) return Response.json({ error: "Invalid credentials" }, { status: 401 });

  const token = generateToken(user.id);
  const userDTO: UserDTO = {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
  };

  const response: AuthResponse = { user: userDTO, token };
  return Response.json(response);
}
