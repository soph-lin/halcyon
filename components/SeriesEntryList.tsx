import Link from "next/link";

import type { SeriesEntryRef } from "@/lib/editor/types/series";

type SeriesEntryListProps = {
  entries: SeriesEntryRef[];
  customOrder: boolean;
};

export function SeriesEntryList({ entries, customOrder }: SeriesEntryListProps) {
  if (customOrder) {
    return (
      <ol className="mt-8 space-y-3">
        {entries.map((entry, index) => (
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
    );
  }

  return (
    <ul className="mt-8 space-y-3">
      {entries.map((entry) => (
        <li key={entry.id} className="entry-list-item">
          <Link href={entry.href} className="entry-list-link group">
            <span className="text-base text-[var(--foreground)] transition-colors group-hover:text-[var(--editor-accent)]">
              {entry.title}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
