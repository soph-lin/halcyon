import { redirect } from "next/navigation";

import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { SiteNav } from "@/components/SiteNav";
import { isAdmin } from "@/lib/admin";

export default async function AdminLoginPage() {
  if (await isAdmin()) {
    redirect("/admin/posts");
  }

  return (
    <div className="min-h-full">
      <SiteNav active="home" />

      <main className="mx-auto max-w-[42rem] px-6 py-10 sm:py-14">
        <h1 className="font-heading text-3xl tracking-tight text-[var(--foreground)]">
          Come in
        </h1>
        <p className="mt-3 text-[var(--editor-muted)]">
          If you are the chosen one.
        </p>

        <div className="mt-8">
          <GoogleSignInButton />
        </div>
      </main>
    </div>
  );
}
