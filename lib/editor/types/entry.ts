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
