// Edge-safe auth config (no DB, no Node crypto) — used by middleware for route protection.
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  trustHost: true, // self-hosted (Railway/localhost) — trust the deployment host
  pages: { signIn: "/login" },
  providers: [], // real providers live in auth.ts (Node runtime)
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;
      if (path === "/") return true; // public marketing landing page
      if (path === "/api/register") return true; // public: create an account
      const isAuthPage = path === "/login" || path === "/register";
      if (isAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true; // allow anonymous access to login/register
      }
      return isLoggedIn; // everything else requires a session
    },
  },
};
