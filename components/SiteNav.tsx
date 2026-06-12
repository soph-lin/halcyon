import Link from "next/link";

import { COLLECTIONS } from "@/lib/collections";

type SiteNavProps = {
  active?: "home" | "blog" | "leaves";
};

export function SiteNav({ active }: SiteNavProps) {
  return (
    <header className="site-nav border-b border-[var(--editor-rule)]">
      <div className="mx-auto flex max-w-[42rem] items-center justify-between gap-6 px-6 py-5">
        <Link
          href="/"
          className="font-heading text-lg tracking-tight text-[var(--foreground)] transition-opacity hover:opacity-80"
        >
          Halcyon
        </Link>

        <nav className="flex items-center gap-5">
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
