"use client";

import { Pencil } from "lucide-react";

import { useEditor } from "@/components/editor/admin/EditorContext";
import type { OpenEditEntryInput } from "@/components/editor/admin/EditorContext";

type EntryEditButtonProps = OpenEditEntryInput;

export function EntryEditButton(props: EntryEditButtonProps) {
  const { isAdmin, showAdminUi, openEdit } = useEditor();

  if (!isAdmin || !showAdminUi) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => openEdit(props)}
      className="admin-entry-action-btn"
      aria-label="Edit entry"
    >
      <Pencil size={18} strokeWidth={1.75} aria-hidden />
    </button>
  );
}
