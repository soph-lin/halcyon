"use client";

import { useEffect, useState } from "react";

import { sanitizeBodyHtml } from "@/lib/sanitize";

type EntryBodyProps = {
  html: string;
};

export function EntryBody({ html }: EntryBodyProps) {
  const [safeHtml, setSafeHtml] = useState("");

  useEffect(() => {
    setSafeHtml(sanitizeBodyHtml(html));
  }, [html]);

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
