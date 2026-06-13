import Link from "next/link";
import { Sun } from "lucide-react";

import { isAdmin } from "@/lib/admin";
import { COLLECTIONS } from "@/lib/collections";

type SiteNavProps = {
  active?: "home" | "blog" | "leaves";
};

export async function SiteNav({ active }: SiteNavProps) {
  const admin = await isAdmin();

  return (
    <header className="site-nav border-b border-[var(--editor-rule)]">
      <div className="mx-auto flex max-w-[42rem] items-center justify-between gap-6 px-6 py-5">
        <div className="site-nav-brand">
          <Link
            href="/"
            className="font-heading text-lg tracking-tight text-[var(--foreground)] transition-opacity hover:opacity-80"
          >
            Halcyon
          </Link>
          {admin ? (
            <Link
              href="/admin/posts"
              className="site-nav-dashboard-link"
              aria-label="Dashboard"
            >
              <Sun size={17} strokeWidth={1.75} aria-hidden />
            </Link>
          ) : null}
        </div>

        <nav className="flex items-center gap-5" aria-label="Site">
          <Link
            href={COLLECTIONS.blog.href}
            className={navLinkClass(active === "blog")}
            aria-current={active === "blog" ? "page" : undefined}
          >
            {COLLECTIONS.blog.title}
          </Link>
          <Link
            href={COLLECTIONS.leaves.href}
            className={navLinkClass(active === "leaves")}
            aria-current={active === "leaves" ? "page" : undefined}
          >
            {COLLECTIONS.leaves.title}
          </Link>
        </nav>
      </div>

      {admin ? (
        <Link href="/admin/sign-out" className="site-nav-sign-out">
          Sign out
        </Link>
      ) : null}
    </header>
  );
}

function navLinkClass(isActive: boolean): string {
  const base =
    "text-sm tracking-wide transition-colors hover:text-[var(--foreground)]";

  if (isActive) {
    return `${base} text-[var(--foreground)] underline underline-offset-[0.2em]`;
  }

  return `${base} text-[var(--editor-muted)]`;
}
