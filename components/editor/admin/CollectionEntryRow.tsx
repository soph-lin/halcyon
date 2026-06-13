"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { deleteEntry } from "@/app/actions/entries";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useEditor } from "@/components/editor/admin/EditorContext";
import type { CollectionKey } from "@/lib/data/collections";
import type { PublishedEntryListItem } from "@/lib/editor/types/entry";

type CollectionEntryRowProps = {
  collection: CollectionKey;
  entry: PublishedEntryListItem;
  date: string;
};

export function CollectionEntryRow({
  collection,
  entry,
  date,
}: CollectionEntryRowProps) {
  const router = useRouter();
  const { isAdmin, showAdminUi } = useEditor();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsPending(true);
    setError(null);

    const result = await deleteEntry({
      entryId: entry.id,
      collection,
      slug: entry.slug,
    });

    setIsPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setIsOpen(false);
    router.refresh();
  };

  return (
    <>
      <li className="entry-list-item">
        <Link
          href={`/${collection}/${entry.slug}`}
          className="entry-list-link group text-base text-[var(--foreground)] transition-colors hover:text-[var(--editor-accent)]"
        >
          <span className="text-sm tabular-nums text-[var(--editor-muted)] group-hover:text-[var(--editor-accent)]">
            {date}.
          </span>{" "}
          <span>{entry.title}</span>
        </Link>

        {isAdmin && showAdminUi && (
          <button
            type="button"
            className="entry-list-delete"
            onClick={() => {
              setError(null);
              setIsOpen(true);
            }}
            aria-label={`Delete ${entry.title}`}
          >
            <Trash2 size={16} strokeWidth={1.75} aria-hidden />
          </button>
        )}
      </li>

      <ConfirmModal
        isOpen={isOpen}
        title="Delete entry?"
        message={`Are you sure you want to delete “${entry.title}”? This cannot be undone.`}
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
