import type { Entry } from "@/lib/generated/prisma/client";

import type { CollectionKey } from "@/lib/collections";
import { prisma } from "@/lib/prisma";

export type PublishedEntryListItem = Pick<
  Entry,
  "slug" | "title" | "publishedAt" | "createdAt"
>;

export async function listPublishedEntries(
  collection: CollectionKey,
): Promise<PublishedEntryListItem[]> {
  const entries = await prisma.entry.findMany({
    where: {
      collection,
      status: "published",
    },
    select: {
      slug: true,
      title: true,
      publishedAt: true,
      createdAt: true,
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return entries;
}

export async function getPublishedEntry(
  collection: CollectionKey,
  slug: string,
): Promise<Pick<
  Entry,
  "id" | "slug" | "title" | "body" | "publishedAt" | "createdAt"
> | null> {
  return prisma.entry.findFirst({
    where: {
      collection,
      slug,
      status: "published",
    },
    select: {
      id: true,
      slug: true,
      title: true,
      body: true,
      publishedAt: true,
      createdAt: true,
    },
  });
}

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
