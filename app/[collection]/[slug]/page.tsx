import Link from "next/link";
import { notFound } from "next/navigation";

import { EditorDefaults } from "@/components/editor/admin/EditorDefaults";
import { EntryDeleteButton } from "@/components/editor/admin/EntryDeleteButton";
import { EntryEditButton } from "@/components/editor/admin/EntryEditButton";
import { EntryBody } from "@/components/EntryBody";
import { SeriesNav } from "@/components/SeriesNav";
import { SiteNav } from "@/components/SiteNav";
import { getCollectionMeta, isCollectionKey } from "@/lib/collections";
import {
  entryDisplayDate,
  formatEntryDate,
  getPublishedEntry,
} from "@/lib/db/entries";
import { getEntrySeriesNav } from "@/lib/db/series";

type EntryPageProps = {
  params: Promise<{ collection: string; slug: string }>;
};

export default async function EntryPage({ params }: EntryPageProps) {
  const { collection: collectionParam, slug } = await params;

  if (!isCollectionKey(collectionParam)) {
    notFound();
  }

  const entry = await getPublishedEntry(collectionParam, slug);

  if (!entry) {
    notFound();
  }

  const seriesNav = await getEntrySeriesNav(entry.id);

  const collection = getCollectionMeta(collectionParam);
  const date = formatEntryDate(entryDisplayDate(entry));

  return (
    <div className="min-h-full">
      <EditorDefaults collection={collectionParam} />
      <SiteNav active={collectionParam} />

      <main className="mx-auto max-w-[42rem] px-6 py-10 sm:py-14">
        <Link
          href={collection.href}
          className="font-heading text-[0.6875rem] uppercase tracking-[0.24em] text-[var(--editor-muted)] transition-colors hover:text-[var(--editor-accent)]"
        >
          {collection.title}
        </Link>

        <header className="mt-4 border-b border-[var(--editor-rule)] pb-6">
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-heading text-3xl tracking-tight text-[var(--foreground)] sm:text-4xl">
              {entry.title}
            </h1>
            <div className="flex shrink-0 items-start gap-2">
              <EntryEditButton
                id={entry.id}
                collection={collectionParam}
                slug={entry.slug}
                title={entry.title}
                body={entry.body}
              />
              <EntryDeleteButton
                id={entry.id}
                collection={collectionParam}
                slug={entry.slug}
                title={entry.title}
                redirectTo={collection.href}
              />
            </div>
          </div>
          <time
            dateTime={entryDisplayDate(entry).toISOString()}
            className="mt-3 block text-sm text-[var(--editor-muted)]"
          >
            {date}
          </time>
        </header>

        <article className="mt-8">
          <EntryBody html={entry.body} />
        </article>

        <SeriesNav items={seriesNav} />
      </main>
    </div>
  );
}
