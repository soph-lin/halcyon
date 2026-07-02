import Link from "next/link";
import { notFound } from "next/navigation";

import { SeriesEntryList } from "@/components/SeriesEntryList";
import { SiteNav } from "@/components/SiteNav";
import {
  COLLECTION_SERIES_SLUG,
  type CollectionKey,
} from "@/lib/data/collections";
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

  const linkedCollection = (
    Object.entries(COLLECTION_SERIES_SLUG) as [CollectionKey, string][]
  ).find(([, seriesSlug]) => seriesSlug === series.slug)?.[0];

  return (
    <div className="min-h-full">
      <SiteNav active={linkedCollection ?? "home"} />

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

        <SeriesEntryList
          entries={series.entries}
          customOrder={series.customOrder}
        />
      </main>
    </div>
  );
}
