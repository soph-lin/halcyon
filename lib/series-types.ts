import type { CollectionKey } from "@/lib/collections";

export type SeriesOption = {
  id: string;
  slug: string;
  title: string;
  customOrder: boolean;
};

export type PendingSeriesAssignment =
  | { kind: "existing"; seriesId: string; title: string }
  | {
      kind: "new";
      title: string;
      description: string;
      customOrder: boolean;
    };

export type EditorSeriesMembership = {
  seriesId: string;
  slug: string;
  title: string;
  customOrder: boolean;
};

export type SeriesListItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  customOrder: boolean;
  entryCount: number;
};

export type SeriesEntryRef = {
  id: string;
  title: string;
  collection: CollectionKey;
  slug: string;
  href: `/${CollectionKey}/${string}`;
  status: string;
};

export type EntrySeriesNavItem = {
  series: {
    slug: string;
    title: string;
    customOrder: boolean;
  };
  next: SeriesEntryRef | null;
  isLast: boolean;
  seriesHref: `/series/${string}`;
};

export type EntrySeriesMembership = {
  slug: string;
  title: string;
  customOrder: boolean;
  position: number | null;
};

export type AdminSeriesEntry = SeriesEntryRef & {
  position: number | null;
  seriesEntryId: string;
};

export type AdminSeriesDetail = {
  id: string;
  slug: string;
  title: string;
  description: string;
  customOrder: boolean;
  entries: AdminSeriesEntry[];
};
