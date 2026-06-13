import { notFound } from "next/navigation";

import { EditorDefaults } from "@/components/editor/admin/EditorDefaults";
import { CollectionEntryRow } from "@/components/editor/admin/CollectionEntryRow";
import { SiteNav } from "@/components/SiteNav";
import { isAdmin } from "@/lib/admin";
import { getCollectionMeta, isCollectionKey } from "@/lib/data/collections";
import {
  entryDisplayDate,
  formatEntryDate,
  listPublishedEntries,
} from "@/lib/db/entries";

type CollectionPageProps = {
  params: Promise<{ collection: string }>;
};

export async function generateStaticParams() {
  return [{ collection: "blog" }, { collection: "leaves" }];
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { collection: collectionParam } = await params;

  if (!isCollectionKey(collectionParam)) {
    notFound();
  }

  const collection = getCollectionMeta(collectionParam);
  const [entries, admin] = await Promise.all([
    listPublishedEntries(collectionParam),
    isAdmin(),
  ]);

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
                isAdmin={admin}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
