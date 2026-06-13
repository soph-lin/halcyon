"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { deleteEntry } from "@/app/actions/entries";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useEditor } from "@/components/editor/admin/EditorContext";
import type { CollectionKey } from "@/lib/data/collections";

type EntryDeleteButtonProps = {
  id: string;
  collection: CollectionKey;
  slug: string;
  title: string;
  redirectTo?: string;
};

export function EntryDeleteButton({
  id,
  collection,
  slug,
  title,
  redirectTo,
}: EntryDeleteButtonProps) {
  const router = useRouter();
  const { isAdmin } = useEditor();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAdmin) {
    return null;
  }

  const handleConfirm = async () => {
    setIsPending(true);
    setError(null);

    const result = await deleteEntry({ entryId: id, collection, slug });

    setIsPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setIsOpen(false);

    if (redirectTo) {
      router.push(redirectTo);
    }

    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setIsOpen(true);
        }}
        className="admin-entry-action-btn admin-entry-delete-btn"
        aria-label={`Delete ${title}`}
      >
        <Trash2 size={18} strokeWidth={1.75} aria-hidden />
      </button>

      <ConfirmModal
        isOpen={isOpen}
        title="Delete entry?"
        message={`Are you sure you want to delete “${title}”? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        tone="danger"
        isPending={isPending}
        error={error}
        onClose={() => {
          if (!isPending) {
            setIsOpen(false);
            setError(null);
          }
        }}
        onConfirm={handleConfirm}
      />
    </>
  );
}
