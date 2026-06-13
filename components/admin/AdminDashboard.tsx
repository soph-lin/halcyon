"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { AdminEntryRow } from "@/components/admin/AdminEntryRow";
import { AdminSeriesSection } from "@/components/admin/AdminSeriesSection";
import type { CollectionMeta } from "@/lib/data/collections";
import {
  entryDisplayDate,
  formatEntryDate,
} from "@/lib/editor/format/entry";
import type { AdminEntryListItem } from "@/lib/editor/types/entry";
import type {
  AdminSeriesDetail,
  EntrySeriesMembership,
} from "@/lib/editor/types/series";

type PostView = "collection" | "date" | "series";

type AdminDashboardProps = {
  entries: AdminEntryListItem[];
  series: AdminSeriesDetail[];
  seriesByEntryId: Record<string, EntrySeriesMembership[]>;
  collections: CollectionMeta[];
};

type PostGroup = {
  key: string;
  label: string;
  href?: string;
  entries: AdminEntryListItem[];
};

const VIEW_OPTIONS: { value: PostView; label: string }[] = [
  { value: "collection", label: "Collection" },
  { value: "date", label: "Date" },
  { value: "series", label: "Series" },
];

function sortEntriesByDate(
  entries: AdminEntryListItem[],
): AdminEntryListItem[] {
  return [...entries].sort(
    (a, b) => entryDisplayDate(b).getTime() - entryDisplayDate(a).getTime(),
  );
}

export function AdminDashboard({
  entries,
  series,
  seriesByEntryId,
  collections,
}: AdminDashboardProps) {
  const [postView, setPostView] = useState<PostView>("collection");

  const postGroups = useMemo((): PostGroup[] => {
    if (postView === "collection") {
      return collections
        .map((collection) => ({
          key: collection.key,
          label: collection.title,
          href: collection.href,
          entries: sortEntriesByDate(
            entries.filter((entry) => entry.collection === collection.key),
          ),
        }))
        .filter((group) => group.entries.length > 0);
    }

    if (postView === "date") {
      const sorted = sortEntriesByDate(entries);
      if (sorted.length === 0) {
        return [];
      }

      return [
        {
          key: "all",
          label: "All posts",
          entries: sorted,
        },
      ];
    }

    const entryIdsInSeries = new Set<string>();
    const groups: PostGroup[] = series.map((item) => {
      for (const entry of item.entries) {
        entryIdsInSeries.add(entry.id);
      }

      return {
        key: item.slug,
        label: item.title,
        href: `/series/${item.slug}`,
        entries: item.entries.map((entry) => {
          const full = entries.find((candidate) => candidate.id === entry.id);
          return (
            full ?? {
              id: entry.id,
              slug: entry.slug,
              title: entry.title,
              body: "",
              collection: entry.collection,
              status: entry.status,
              publishedAt: null,
              createdAt: new Date(),
            }
          );
        }),
      };
    });

    const ungrouped = sortEntriesByDate(
      entries.filter((entry) => !entryIdsInSeries.has(entry.id)),
    );

    if (ungrouped.length > 0) {
      groups.push({
        key: "none",
        label: "No series",
        entries: ungrouped,
      });
    }

    return groups;
  }, [collections, entries, postView, series]);

  return (
    <>
      <div className="admin-dashboard-header">
        <div>
          <p className="font-heading text-[0.6875rem] uppercase tracking-[0.24em] text-[var(--editor-muted)]">
            Admin
          </p>
          <h1 className="mt-2 font-heading text-3xl tracking-tight text-[var(--foreground)]">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-[var(--editor-muted)]">
            {entries.length === 0
              ? "No posts yet."
              : `${entries.length} post${entries.length === 1 ? "" : "s"}.`}
          </p>
        </div>
      </div>

      <section className="admin-dashboard-section">
        <div className="admin-dashboard-section-header">
          <h2 className="font-heading text-xl tracking-tight text-[var(--foreground)]">
            Posts
          </h2>

          {entries.length > 0 && (
            <div
              className="admin-view-toggle"
              role="tablist"
              aria-label="Group posts by"
            >
              {VIEW_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="tab"
                  aria-selected={postView === option.value}
                  className={
                    postView === option.value
                      ? "admin-view-toggle-btn is-active"
                      : "admin-view-toggle-btn"
                  }
                  onClick={() => setPostView(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {entries.length === 0 ? (
          <p className="mt-6 text-[var(--editor-muted)]">
            Create your first post with the pencil button.
          </p>
        ) : (
          <div className="mt-6 space-y-10">
            {postGroups.map((group) => (
              <div key={group.key}>
                <div className="border-b border-[var(--editor-rule)] pb-3">
                  {group.href ? (
                    <Link
                      href={group.href}
                      className="admin-dashboard-group-title"
                    >
                      {group.label}
                    </Link>
                  ) : (
                    <h3 className="font-heading text-lg tracking-tight text-[var(--foreground)]">
                      {group.label}
                    </h3>
                  )}
                </div>

                <ul className="mt-4 space-y-2">
                  {group.entries.map((entry) => {
                    const displayDate = entryDisplayDate(entry);

                    return (
                      <AdminEntryRow
                        key={entry.id}
                        entry={entry}
                        dateLabel={formatEntryDate(displayDate)}
                        dateTime={displayDate.toISOString()}
                        series={seriesByEntryId[entry.id] ?? []}
                        showCollection={postView !== "collection"}
                      />
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <AdminSeriesSection series={series} entries={entries} />
    </>
  );
}
