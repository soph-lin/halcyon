"use client";

import { useSyncExternalStore } from "react";

import { sanitizeBodyHtml } from "@/lib/sanitize";

type EntryBodyProps = {
  html: string;
};

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function EntryBody({ html }: EntryBodyProps) {
  const isClient = useIsClient();
  const safeHtml = isClient ? sanitizeBodyHtml(html) : "";

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
