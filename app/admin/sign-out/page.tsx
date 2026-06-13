import { redirect } from "next/navigation";

import { SignOutActions } from "@/components/admin/SignOutActions";
import { SiteNav } from "@/components/SiteNav";
import { isAdmin } from "@/lib/admin";

export default async function AdminSignOutPage() {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-full">
      <SiteNav active="home" />

      <main className="mx-auto max-w-[42rem] px-6 py-10 sm:py-14">
        <h1 className="font-heading text-3xl tracking-tight text-[var(--foreground)]">
          Sign out
        </h1>
        <p className="mt-3 text-[var(--editor-muted)]">
          Are you sure you want to sign out?
        </p>

        <div className="mt-8">
          <SignOutActions />
        </div>
      </main>
    </div>
  );
}
