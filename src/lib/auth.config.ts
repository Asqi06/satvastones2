import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith("/auth");
      const isAdminPage = nextUrl.pathname.startsWith("/admin");
      const isAccountPage = nextUrl.pathname.startsWith("/account");

      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/", nextUrl));
      }

      if ((isAdminPage || isAccountPage) && !isLoggedIn) {
        return false;
      }

      if (isAdminPage && (auth?.user as any)?.role !== "ADMIN") {
        return Response.redirect(new URL("/", nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  providers: [],
};
