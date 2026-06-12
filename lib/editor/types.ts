/** Stored entry shape — mirrors the planned `entries` table. */
export type EntryStatus = "draft" | "published" | "unlisted";

export type Collection = "writing" | "thoughts" | "leaves" | "lifeiszoo";

export type Entry = {
  id: string;
  slug: string;
  title: string;
  body: string;
  collection: Collection;
  status: EntryStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Payload emitted when the user saves from the editor. */
export type EditorSavePayload = {
  title: string;
  body: string;
};

export type EditorInitialValues = {
  title?: string;
  body?: string;
};

export type WritingEditorProps = {
  initialValues?: EditorInitialValues;
  onSave?: (payload: EditorSavePayload) => void | Promise<void>;
  placeholder?: string;
};

/** HTML tags allowed in v1 body storage (sanitizer contract). */
export const ALLOWED_BODY_TAGS = [
  "h1",
  "h2",
  "h3",
  "p",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "u",
  "span",
  "a",
  "blockquote",
  "pre",
  "code",
  "br",
] as const;

export type AllowedBodyTag = (typeof ALLOWED_BODY_TAGS)[number];
