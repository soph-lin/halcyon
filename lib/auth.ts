import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

function getAdminEmail(): string {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) {
    throw new Error("ADMIN_EMAIL is not set");
  }
  return email;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/admin/login",
    signOut: "/admin/sign-out",
    error: "/ui/access-denied",
  },
  callbacks: {
    async signIn({ profile }) {
      const email = profile?.email?.trim().toLowerCase();
      return email === getAdminEmail();
    },
  },
};
