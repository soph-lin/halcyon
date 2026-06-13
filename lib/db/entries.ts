import type { Entry } from "@/lib/generated/prisma/client";

import type { CollectionKey } from "@/lib/collections";
import {
  type AdminEntryListItem,
  type PublishedEntryListItem,
  entryDisplayDate,
  formatEntryDate,
} from "@/lib/entry-utils";
import { prisma } from "@/lib/db/prisma";

export type { AdminEntryListItem, PublishedEntryListItem };
export { entryDisplayDate, formatEntryDate };

export async function listPublishedEntries(
  collection: CollectionKey,
): Promise<PublishedEntryListItem[]> {
  const entries = await prisma.entry.findMany({
    where: {
      collection,
      status: "published",
    },
    select: {
      id: true,
      slug: true,
      title: true,
      publishedAt: true,
      createdAt: true,
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return entries;
}

export async function listAllEntriesForAdmin(): Promise<AdminEntryListItem[]> {
  return prisma.entry.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      body: true,
      collection: true,
      status: true,
      publishedAt: true,
      createdAt: true,
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
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
