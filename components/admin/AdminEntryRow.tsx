"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { deleteEntry } from "@/app/actions/entries";
import { EntryEditButton } from "@/components/editor/admin/EntryEditButton";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import {
  getCollectionMeta,
  isCollectionKey,
  type CollectionKey,
} from "@/lib/collections";
import type { AdminEntryListItem } from "@/lib/entry-utils";
import type { EntrySeriesMembership } from "@/lib/series-types";

type AdminEntryRowProps = {
  entry: AdminEntryListItem;
  dateLabel: string;
  dateTime: string;
  series?: EntrySeriesMembership[];
  showCollection?: boolean;
};

export function AdminEntryRow({
  entry,
  dateLabel,
  dateTime,
  series = [],
  showCollection = false,
}: AdminEntryRowProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isCollectionKey(entry.collection)) {
    return null;
  }

  const collection = entry.collection as CollectionKey;
  const collectionMeta = getCollectionMeta(collection);
  const href = `/${collection}/${entry.slug}`;

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
      <li className="admin-entry-row">
        <div className="admin-entry-row-main">
          <Link href={href} className="admin-entry-row-title">
            {entry.title}
          </Link>
          <div className="admin-entry-row-meta">
            {showCollection && (
              <span className="admin-entry-row-collection">
                {collectionMeta.title}
              </span>
            )}
            <time dateTime={dateTime}>{dateLabel}</time>
            {series.length > 0 && (
              <span className="admin-entry-row-series">
                {series.map((item) => item.title).join(", ")}
              </span>
            )}
          </div>
        </div>

        <div className="admin-entry-row-actions">
          <EntryEditButton
            id={entry.id}
            collection={collection}
            slug={entry.slug}
            title={entry.title}
            body={entry.body}
          />
          <button
            type="button"
            className="admin-entry-action-btn admin-entry-delete-btn"
            onClick={() => {
              setError(null);
              setIsOpen(true);
            }}
            aria-label={`Delete ${entry.title}`}
          >
            <Trash2 size={16} strokeWidth={1.75} aria-hidden />
          </button>
        </div>
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
