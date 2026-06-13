import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteNav } from "@/components/SiteNav";
import { getPublishedSeries } from "@/lib/db/series";

type SeriesPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { slug } = await params;
  const series = await getPublishedSeries(slug);

  if (!series) {
    notFound();
  }

  return (
    <div className="min-h-full">
      <SiteNav active="home" />

      <main className="mx-auto max-w-[42rem] px-6 py-10 sm:py-14">
        <Link
          href="/series"
          className="font-heading text-[0.6875rem] uppercase tracking-[0.24em] text-[var(--editor-muted)] transition-colors hover:text-[var(--editor-accent)]"
        >
          Series
        </Link>

        <header className="mt-4 border-b border-[var(--editor-rule)] pb-6">
          <h1 className="font-heading text-3xl tracking-tight text-[var(--foreground)] sm:text-4xl">
            {series.title}
          </h1>
          {series.description ? (
            <p className="mt-3 text-[var(--editor-muted)]">
              {series.description}
            </p>
          ) : null}
        </header>

        {series.customOrder ? (
          <ol className="mt-8 space-y-3">
            {series.entries.map((entry, index) => (
              <li key={entry.id} className="entry-list-item">
                <Link href={entry.href} className="entry-list-link group">
                  <span className="text-sm tabular-nums text-[var(--editor-muted)] group-hover:text-[var(--editor-accent)]">
                    {index + 1}.
                  </span>{" "}
                  <span className="text-base text-[var(--foreground)] transition-colors group-hover:text-[var(--editor-accent)]">
                    {entry.title}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <ul className="mt-8 space-y-3">
            {series.entries.map((entry) => (
              <li key={entry.id} className="entry-list-item">
                <Link href={entry.href} className="entry-list-link group">
                  <span className="text-base text-[var(--foreground)] transition-colors group-hover:text-[var(--editor-accent)]">
                    {entry.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
