"use client";

import { useEffect } from "react";

import { useEditor } from "@/components/editor/admin/EditorContext";
import type { CollectionKey } from "@/lib/collections";

type EditorDefaultsProps = {
  collection?: CollectionKey;
};

/** Sets the default collection for the floating new-entry button on this page. */
export function EditorDefaults({ collection }: EditorDefaultsProps) {
  const { setDefaultCollection } = useEditor();

  useEffect(() => {
    setDefaultCollection(collection ?? null);
    return () => setDefaultCollection(null);
  }, [collection, setDefaultCollection]);

  return null;
}
