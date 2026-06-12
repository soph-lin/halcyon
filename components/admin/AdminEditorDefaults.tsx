"use client";

import { useEffect } from "react";

import { useAdminEditor } from "@/components/admin/AdminEditorContext";
import type { CollectionKey } from "@/lib/collections";

type AdminEditorDefaultsProps = {
  collection?: CollectionKey;
};

/** Sets the default collection for the floating new-entry button on this page. */
export function AdminEditorDefaults({ collection }: AdminEditorDefaultsProps) {
  const { setDefaultCollection } = useAdminEditor();

  useEffect(() => {
    setDefaultCollection(collection ?? null);
    return () => setDefaultCollection(null);
  }, [collection, setDefaultCollection]);

  return null;
}
