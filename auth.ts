import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { getDemoAccount, isDemoAuthEnabled, isGoogleAuthEnabled, parseDemoLoginMode } from "@/app/lib/auth/demo-auth";
import { normalizeRole, resolveUserRole } from "@/app/lib/auth/roles";

const providers = [];

if (isDemoAuthEnabled()) {
  providers.push(
    Credentials({
      id: "credentials",
      name: "Demo 登录",
      credentials: {
        mode: {
          label: "演示身份",
          type: "text",
        },
      },
      authorize(credentials) {
        const mode = parseDemoLoginMode(credentials?.mode);

        if (!mode) {
          return null;
        }

        return {
          id: `demo-${mode.toLowerCase()}`,
          ...getDemoAccount(mode),
        };
      },
    }),
  );
}

if (isGoogleAuthEnabled()) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? (process.env.NODE_ENV !== "production" ? "local-demo-auth-secret" : undefined),
  pages: {
    signIn: "/sign-in",
  },
  providers,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      const email = user?.email ?? token.email ?? null;
      const userRole = typeof user?.role === "string" ? normalizeRole(user.role) : null;
      token.role = userRole ?? resolveUserRole(email);

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
