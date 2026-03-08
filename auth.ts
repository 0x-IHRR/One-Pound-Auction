import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { normalizeRole, resolveUserRole } from "@/app/lib/auth/roles";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      const email = user?.email ?? token.email ?? null;
      token.role = resolveUserRole(email);

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const tokenRole = typeof token.role === "string" ? token.role : null;
        session.user.role = normalizeRole(tokenRole);
      }

      return session;
    },
  },
});
