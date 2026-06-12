import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminEditorDefaults } from "@/components/admin/AdminEditorDefaults";
import { SiteNav } from "@/components/SiteNav";
import { getCollectionMeta, isCollectionKey } from "@/lib/collections";
import {
  entryDisplayDate,
  formatEntryDate,
  listPublishedEntries,
} from "@/lib/entries";

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
  const entries = await listPublishedEntries(collectionParam);

  return (
    <div className="min-h-full">
      <AdminEditorDefaults collection={collectionParam} />
      <SiteNav active={collectionParam} />

      <main className="mx-auto max-w-[42rem] px-6 py-10 sm:py-14">
        <h1 className="font-heading text-3xl tracking-tight text-[var(--foreground)]">
          {collection.title}
        </h1>

        {entries.length === 0 ? (
          <p className="mt-8 text-[var(--editor-muted)]">No entries yet.</p>
        ) : (
          <ul className="mt-8 space-y-3 border-t border-[var(--editor-rule)] pt-6">
            {entries.map((entry) => {
              const date = formatEntryDate(entryDisplayDate(entry));

              return (
                <li key={entry.slug}>
                  <Link
                    href={`/${collectionParam}/${entry.slug}`}
                    className="group block text-base text-[var(--foreground)] transition-colors hover:text-[var(--editor-accent)]"
                  >
                    <span className="text-sm tabular-nums text-[var(--editor-muted)] group-hover:text-[var(--editor-accent)]">
                      {date}.
                    </span>{" "}
                    <span>{entry.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
