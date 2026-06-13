export const COLLECTION_KEYS = ["blog", "leaves"] as const;

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
};

export function isCollectionKey(value: string): value is CollectionKey {
  return COLLECTION_KEYS.includes(value as CollectionKey);
}

export function getCollectionMeta(key: CollectionKey): CollectionMeta {
  return COLLECTIONS[key];
}
