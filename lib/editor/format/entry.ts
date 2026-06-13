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
