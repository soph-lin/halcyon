import Link from "next/link";

import type { EntrySeriesNavItem } from "@/lib/series-types";

type SeriesNavProps = {
  items: EntrySeriesNavItem[];
};

export function SeriesNav({ items }: SeriesNavProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <aside className="series-nav">
      {items.map((item) => (
        <div key={item.series.slug} className="series-nav-block">
          {item.series.customOrder ? (
            item.isLast ? (
              <p className="series-nav-text">
                End of{" "}
                <Link href={item.seriesHref} className="series-nav-link">
                  {item.series.title}
                </Link>
              </p>
            ) : item.next ? (
              <p className="series-nav-text">
                Up next:{" "}
                <Link href={item.next.href} className="series-nav-link">
                  {item.next.title}
                </Link>
              </p>
            ) : null
          ) : (
            <p className="series-nav-text">
              Part of{" "}
              <Link href={item.seriesHref} className="series-nav-link">
                {item.series.title}
              </Link>
            </p>
          )}
        </div>
      ))}
    </aside>
  );
}
