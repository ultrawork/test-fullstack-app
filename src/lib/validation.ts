const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && EMAIL_REGEX.test(email);
}

export function validatePassword(password: unknown): password is string {
  return typeof password === "string" && password.length >= 6;
}

export function validateName(name: unknown): name is string {
  return (
    typeof name === "string" && name.trim().length >= 1 && name.length <= 100
  );
}

export function validateTagName(name: unknown): name is string {
  return (
    typeof name === "string" && name.trim().length >= 1 && name.length <= 50
  );
}

export function validateHexColor(color: unknown): color is string {
  return typeof color === "string" && HEX_COLOR_REGEX.test(color);
}

export function validateUUID(id: unknown): id is string {
  return typeof id === "string" && UUID_REGEX.test(id);
}

export function validateNoteTitle(title: unknown): title is string {
  return (
    typeof title === "string" &&
    title.trim().length >= 1 &&
    title.length <= 200
  );
}

export function validateNoteContent(content: unknown): content is string {
  return typeof content === "string" && content.length <= 50000;
}

export function badRequestResponse(message: string): Response {
  return Response.json({ error: message }, { status: 400 });
}

export function notFoundResponse(message: string): Response {
  return Response.json({ error: message }, { status: 404 });
}

export function conflictResponse(message: string): Response {
  return Response.json({ error: message }, { status: 409 });
}
