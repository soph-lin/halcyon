export const COLLECTION_KEYS = ["blog", "leaves", "dreamon"] as const;

export type CollectionKey = (typeof COLLECTION_KEYS)[number];

export type CollectionMeta = {
  key: CollectionKey;
  title: string;
  href: `/${CollectionKey}`;
};

export const COLLECTIONS: Record<CollectionKey, CollectionMeta> = {
  blog: {
    key: "blog",
    title: "blog",
    href: "/blog",
  },
  leaves: {
    key: "leaves",
    title: "little library",
    href: "/leaves",
  },
  dreamon: {
    key: "dreamon",
    title: "dreamon",
    href: "/dreamon",
  },
};

/** Collections whose index page lists a linked series instead of collection entries. */
export const COLLECTION_SERIES_SLUG: Partial<Record<CollectionKey, string>> = {
  dreamon: "dreamon",
};

export function getSeriesSlugForCollection(
  key: CollectionKey,
): string | undefined {
  return COLLECTION_SERIES_SLUG[key];
}

export function isCollectionKey(value: string): value is CollectionKey {
  return COLLECTION_KEYS.includes(value as CollectionKey);
}

export function getCollectionMeta(key: CollectionKey): CollectionMeta {
  return COLLECTIONS[key];
}
