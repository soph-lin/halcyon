export type PublishedEntryListItem = {
  id: string;
  slug: string;
  title: string;
  publishedAt: Date | null;
  createdAt: Date;
};

export type AdminEntryListItem = PublishedEntryListItem & {
  body: string;
  collection: string;
  status: string;
};

export function entryDisplayDate(entry: {
  publishedAt: Date | null;
  createdAt: Date;
}): Date {
  return entry.publishedAt ?? entry.createdAt;
}

export function formatEntryDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
