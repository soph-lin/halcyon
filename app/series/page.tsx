import Link from "next/link";

import { SiteNav } from "@/components/SiteNav";
import { listPublishedSeries } from "@/lib/db/series";

export default async function SeriesIndexPage() {
  const series = await listPublishedSeries();

  return (
    <div className="min-h-full">
      <SiteNav active="home" />

      <main className="mx-auto max-w-[42rem] px-6 py-10 sm:py-14">
        <h1 className="font-heading text-3xl tracking-tight text-[var(--foreground)]">
          Series
        </h1>

        {series.length === 0 ? (
          <p className="mt-8 text-[var(--editor-muted)]">No series yet.</p>
        ) : (
          <ul className="mt-8 space-y-4 border-t border-[var(--editor-rule)] pt-6">
            {series.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/series/${item.slug}`}
                  className="block transition-colors hover:text-[var(--editor-accent)]"
                >
                  <h2 className="font-heading text-xl tracking-tight text-[var(--foreground)]">
                    {item.title}
                  </h2>
                  {item.description ? (
                    <p className="mt-1 text-sm text-[var(--editor-muted)]">
                      {item.description}
                    </p>
                  ) : null}
                  <p className="mt-2 text-sm text-[var(--editor-muted)]">
                    {item.entryCount} post{item.entryCount === 1 ? "" : "s"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
