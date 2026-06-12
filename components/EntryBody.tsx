"use client";

import { sanitizeBodyHtml } from "@/lib/sanitize";

type EntryBodyProps = {
  html: string;
};

export function EntryBody({ html }: EntryBodyProps) {
  const safeHtml = sanitizeBodyHtml(html);

  if (!safeHtml) {
    return null;
  }

  return (
    <div
      className="entry-body editor-body font-body text-[var(--foreground)]"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
