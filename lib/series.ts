import { isCollectionKey } from "@/lib/collections";
import { prisma } from "@/lib/prisma";
import type {
  AdminSeriesDetail,
  EntrySeriesMembership,
  EntrySeriesNavItem,
  SeriesEntryRef,
  SeriesListItem,
} from "@/lib/series-types";

export type {
  AdminSeriesDetail,
  EntrySeriesMembership,
  EntrySeriesNavItem,
  SeriesEntryRef,
  SeriesListItem,
} from "@/lib/series-types";

const publishedEntryWhere = {
  status: "published" as const,
};

function toEntryRef(entry: {
  id: string;
  title: string;
  collection: string;
  slug: string;
  status: string;
}): SeriesEntryRef | null {
  if (!isCollectionKey(entry.collection)) {
    return null;
  }

  const collection = entry.collection;

  return {
    id: entry.id,
    title: entry.title,
    collection,
    slug: entry.slug,
    href: `/${collection}/${entry.slug}`,
    status: entry.status,
  };
}

function orderSeriesEntries<
  T extends { position: number | null; entry: { publishedAt: Date | null; createdAt: Date } },
>(items: T[], customOrder: boolean): T[] {
  if (customOrder) {
    return [...items].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }

  return [...items].sort((a, b) => {
    const aDate = a.entry.publishedAt ?? a.entry.createdAt;
    const bDate = b.entry.publishedAt ?? b.entry.createdAt;
    return bDate.getTime() - aDate.getTime();
  });
}

export async function listPublishedSeries(): Promise<SeriesListItem[]> {
  const series = await prisma.series.findMany({
    include: {
      entries: {
        where: {
          entry: publishedEntryWhere,
        },
        select: { id: true },
      },
    },
    orderBy: { title: "asc" },
  });

  return series
    .filter((item) => item.entries.length > 0)
    .map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      description: item.description,
      customOrder: item.customOrder,
      entryCount: item.entries.length,
    }));
}

export async function getPublishedSeries(slug: string) {
  const series = await prisma.series.findUnique({
    where: { slug },
    include: {
      entries: {
        include: {
          entry: {
            select: {
              id: true,
              title: true,
              collection: true,
              slug: true,
              status: true,
              publishedAt: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!series) {
    return null;
  }

  const orderedEntries = orderSeriesEntries(series.entries, series.customOrder)
    .map((item) => toEntryRef(item.entry))
    .filter((entry): entry is SeriesEntryRef => entry !== null && entry.status === "published");

  if (orderedEntries.length === 0) {
    return null;
  }

  return {
    id: series.id,
    slug: series.slug,
    title: series.title,
    description: series.description,
    customOrder: series.customOrder,
    entries: orderedEntries,
  };
}

export async function getEntrySeriesNav(entryId: string): Promise<EntrySeriesNavItem[]> {
  const memberships = await prisma.seriesEntry.findMany({
    where: { entryId },
    include: {
      series: {
        include: {
          entries: {
            include: {
              entry: {
                select: {
                  id: true,
                  title: true,
                  collection: true,
                  slug: true,
                  status: true,
                  publishedAt: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const navItems: EntrySeriesNavItem[] = [];

  for (const membership of memberships) {
    const { series } = membership;
    const publishedEntries = orderSeriesEntries(series.entries, series.customOrder)
      .map((item) => toEntryRef(item.entry))
      .filter((entry): entry is SeriesEntryRef => entry !== null && entry.status === "published");

    const currentIndex = publishedEntries.findIndex((entry) => entry.id === entryId);

    if (currentIndex === -1) {
      continue;
    }

    const next = publishedEntries[currentIndex + 1] ?? null;

    navItems.push({
      series: {
        slug: series.slug,
        title: series.title,
        customOrder: series.customOrder,
      },
      next,
      isLast: next === null,
      seriesHref: `/series/${series.slug}`,
    });
  }

  return navItems;
}

export async function listAllSeriesForAdmin(): Promise<SeriesListItem[]> {
  const series = await prisma.series.findMany({
    include: {
      _count: {
        select: { entries: true },
      },
    },
    orderBy: { title: "asc" },
  });

  return series.map((item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    description: item.description,
    customOrder: item.customOrder,
    entryCount: item._count.entries,
  }));
}

export async function getSeriesForAdmin(slug: string) {
  const series = await prisma.series.findUnique({
    where: { slug },
    include: {
      entries: {
        include: {
          entry: {
            select: {
              id: true,
              title: true,
              collection: true,
              slug: true,
              status: true,
              publishedAt: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!series) {
    return null;
  }

  const entries = orderSeriesEntries(series.entries, series.customOrder)
    .map((item) => {
      const ref = toEntryRef(item.entry);
      if (!ref) {
        return null;
      }

      return {
        ...ref,
        position: item.position,
        seriesEntryId: item.id,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  return {
    id: series.id,
    slug: series.slug,
    title: series.title,
    description: series.description,
    customOrder: series.customOrder,
    entries,
  };
}

export async function listAllSeriesDetailsForAdmin(): Promise<
  AdminSeriesDetail[]
> {
  const series = await prisma.series.findMany({
    include: {
      entries: {
        include: {
          entry: {
            select: {
              id: true,
              title: true,
              collection: true,
              slug: true,
              status: true,
              publishedAt: true,
              createdAt: true,
            },
          },
        },
      },
    },
    orderBy: { title: "asc" },
  });

  return series.map((item) => {
    const entries = orderSeriesEntries(item.entries, item.customOrder)
      .map((membership) => {
        const ref = toEntryRef(membership.entry);
        if (!ref) {
          return null;
        }

        return {
          ...ref,
          position: membership.position,
          seriesEntryId: membership.id,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    return {
      id: item.id,
      slug: item.slug,
      title: item.title,
      description: item.description,
      customOrder: item.customOrder,
      entries,
    };
  });
}

export async function getSeriesMembershipsByEntryIds(
  entryIds: string[],
): Promise<Map<string, EntrySeriesMembership[]>> {
  if (entryIds.length === 0) {
    return new Map();
  }

  const memberships = await prisma.seriesEntry.findMany({
    where: {
      entryId: { in: entryIds },
    },
    include: {
      series: {
        select: {
          slug: true,
          title: true,
          customOrder: true,
        },
      },
    },
    orderBy: [{ series: { title: "asc" } }, { position: "asc" }],
  });

  const map = new Map<string, EntrySeriesMembership[]>();

  for (const membership of memberships) {
    const existing = map.get(membership.entryId) ?? [];
    existing.push({
      slug: membership.series.slug,
      title: membership.series.title,
      customOrder: membership.series.customOrder,
      position: membership.position,
    });
    map.set(membership.entryId, existing);
  }

  return map;
}
