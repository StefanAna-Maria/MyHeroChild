/*
import jwt_decode from "jwt-decode";

export function jwtDecode(token: string) {
  return jwt_decode(token);
}
*/
export type UserRole = "PARENT" | "CHILD" | "ADMIN";

export function decodeJwtPayload(token: string): any | null {
  try {
    const payload = token.split(".")[1];
    const padded = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getRoleFromToken(token: string): UserRole | null {
  const payload = decodeJwtPayload(token);
  const role = payload?.role;
  if (role === "PARENT" || role === "CHILD" || role === "ADMIN") return role;
  return null;
}