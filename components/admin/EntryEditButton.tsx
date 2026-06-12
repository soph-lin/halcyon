"use client";

import { useAdminEditor } from "@/components/admin/AdminEditorContext";
import type { OpenEditEntryInput } from "@/components/admin/AdminEditorContext";
import { PencilIcon } from "@/components/admin/icons";

type EntryEditButtonProps = OpenEditEntryInput;

export function EntryEditButton(props: EntryEditButtonProps) {
  const { isAdmin, openEdit } = useAdminEditor();

  if (!isAdmin) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => openEdit(props)}
      className="admin-entry-edit-btn"
      aria-label="Edit entry"
    >
      <PencilIcon />
    </button>
  );
}
