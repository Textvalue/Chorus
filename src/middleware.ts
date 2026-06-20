// Route protection via Auth.js (Edge). Uses the DB-free auth.config so it stays Edge-safe.
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);
export default auth;

export const config = {
  // Run on everything except Next internals, the auth API, and static brand assets.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|brand|.*\\.(?:png|jpg|svg|ico)$).*)"],
};
