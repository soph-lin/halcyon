import type { CollectionKey } from "@/lib/data/collections";
import { prisma } from "@/lib/db/prisma";

export function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return base || `entry-${Date.now()}`;
}

export async function uniqueSlugForCollection(
  collection: CollectionKey,
  title: string,
): Promise<string> {
  const base = slugify(title);
  let slug = base;
  let suffix = 2;

  while (
    await prisma.entry.findUnique({
      where: {
        collection_slug: { collection, slug },
      },
      select: { id: true },
    })
  ) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export async function uniqueSlugForSeries(title: string): Promise<string> {
  const base = slugify(title);
  let slug = base;
  let suffix = 2;

  while (
    await prisma.series.findUnique({
      where: { slug },
      select: { id: true },
    })
  ) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}
