import { notFound } from "next/navigation";

import { EditorDefaults } from "@/components/editor/admin/EditorDefaults";
import { CollectionEntryRow } from "@/components/editor/admin/CollectionEntryRow";
import { SeriesEntryList } from "@/components/SeriesEntryList";
import { SiteNav } from "@/components/SiteNav";
import {
  COLLECTION_KEYS,
  getCollectionMeta,
  getSeriesSlugForCollection,
  isCollectionKey,
} from "@/lib/data/collections";
import {
  entryDisplayDate,
  formatEntryDate,
  listPublishedEntries,
} from "@/lib/db/entries";
import { getPublishedSeries } from "@/lib/db/series";

type CollectionPageProps = {
  params: Promise<{ collection: string }>;
};

export async function generateStaticParams() {
  return COLLECTION_KEYS.map((collection) => ({ collection }));
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { collection: collectionParam } = await params;

  if (!isCollectionKey(collectionParam)) {
    notFound();
  }

  const collection = getCollectionMeta(collectionParam);
  const seriesSlug = getSeriesSlugForCollection(collectionParam);
  const series = seriesSlug
    ? await getPublishedSeries(seriesSlug)
    : null;

  if (series) {
    return (
      <div className="min-h-full">
        <EditorDefaults collection={collectionParam} />
        <SiteNav active={collectionParam} />

        <main className="mx-auto max-w-[42rem] px-6 py-10 sm:py-14">
          <h1 className="font-heading text-3xl tracking-tight text-[var(--foreground)]">
            {series.title}
          </h1>
          {series.description ? (
            <p className="mt-3 text-[var(--editor-muted)]">
              {series.description}
            </p>
          ) : null}

          <SeriesEntryList
            entries={series.entries}
            customOrder={series.customOrder}
          />
        </main>
      </div>
    );
  }

  const entries = await listPublishedEntries(collectionParam);

  return (
    <div className="min-h-full">
      <EditorDefaults collection={collectionParam} />
      <SiteNav active={collectionParam} />

      <main className="mx-auto max-w-[42rem] px-6 py-10 sm:py-14">
        <h1 className="font-heading text-3xl tracking-tight text-[var(--foreground)]">
          {collection.title}
        </h1>

        {entries.length === 0 ? (
          <p className="mt-8 text-[var(--editor-muted)]">No entries yet.</p>
        ) : (
          <ul className="mt-8 space-y-3 border-t border-[var(--editor-rule)] pt-6">
            {entries.map((entry) => (
              <CollectionEntryRow
                key={entry.slug}
                collection={collectionParam}
                entry={entry}
                date={formatEntryDate(entryDisplayDate(entry))}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
