import { headers } from "next/headers";
import { AuthError } from "./errors";

export async function getUserId(): Promise<string> {
  const headersList = await headers();
  const userId = headersList.get("x-user-id");
  if (!userId) {
    throw new AuthError();
  }
  return userId;
}
