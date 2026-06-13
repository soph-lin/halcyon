import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

function getAdminEmail(): string | null {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return email || null;
}

export async function isAdmin(): Promise<boolean> {
  const adminEmail = getAdminEmail();
  if (!adminEmail) {
    return false;
  }

  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim().toLowerCase();

  return email === adminEmail;
}
