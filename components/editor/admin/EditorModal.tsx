"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { X } from "lucide-react";
import { WritingEditor } from "@/components/editor/WritingEditor";
import {
  EditorSeriesExtras,
  EditorSeriesModals,
  EditorSeriesSelect,
  useEditorSeriesPicker,
} from "@/components/editor/admin/EditorSeriesPicker";
import {
  COLLECTION_KEYS,
  getCollectionMeta,
  type CollectionKey,
} from "@/lib/data/collections";
import type {
  EditorInitialValues,
  EditorSavePayload,
} from "@/lib/editor/types";
import type { PendingSeriesAssignment } from "@/lib/editor/types/series";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { useBodyScrollLock } from "@/components/ui/useBodyScrollLock";

export type EditorModalSavePayload = EditorSavePayload & {
  collection: CollectionKey;
};

type EditorModalProps = {
  isOpen: boolean;
  mode: "create" | "edit";
  collection: CollectionKey;
  entryId?: string;
  initialValues?: EditorInitialValues;
  saveError?: string | null;
  pendingSeries: PendingSeriesAssignment[];
  onPendingSeriesChange: (items: PendingSeriesAssignment[]) => void;
  onSeriesMembershipChange: () => void;
  onClose: () => void;
  onSave: (payload: EditorModalSavePayload) => void | Promise<void>;
};

export function EditorModal({
  isOpen,
  mode,
  collection: initialCollection,
  entryId,
  initialValues,
  saveError,
  pendingSeries,
  onPendingSeriesChange,
  onSeriesMembershipChange,
  onClose,
  onSave,
}: EditorModalProps) {
  const titleId = useId();
  const [collection, setCollection] =
    useState<CollectionKey>(initialCollection);
  const seriesPicker = useEditorSeriesPicker({
    entryId,
    pendingSeries,
    onPendingSeriesChange,
    onMembershipChange: onSeriesMembershipChange,
  });

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      // Let Lexical close the slash menu first.
      if (document.querySelector(".editor-slash-menu-portal")) {
        return;
      }

      onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSave = useCallback(
    async (payload: EditorSavePayload) => {
      await onSave({
        ...payload,
        collection,
      });
    },
    [collection, onSave],
  );

  if (!isOpen) {
    return null;
  }

  const editorKey = `${mode}-${initialValues?.title ?? "new"}`;

  return (
    <ModalPortal>
      <div className="admin-editor-modal-root" role="presentation">
        <button
          type="button"
          className="admin-editor-modal-backdrop"
          aria-label="Close editor"
          onClick={onClose}
        />

        <div
          className="admin-editor-modal-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <header className="admin-editor-modal-header">
            <div>
              <h2
                id={titleId}
                className="font-heading text-lg tracking-tight text-[var(--foreground)]"
              >
                {mode === "create" ? "new entry" : "edit entry"}
              </h2>
              <div className="admin-editor-meta">
                <div className="admin-editor-meta-row">
                  <label className="admin-editor-meta-field">
                    <span>collection</span>
                    <select
                      value={collection}
                      onChange={(event) =>
                        setCollection(event.target.value as CollectionKey)
                      }
                      className="admin-editor-collection-select"
                    >
                      {COLLECTION_KEYS.map((key) => (
                        <option key={key} value={key}>
                          {getCollectionMeta(key).title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <EditorSeriesSelect picker={seriesPicker} />
                </div>
                <EditorSeriesExtras picker={seriesPicker} />
                <EditorSeriesModals picker={seriesPicker} />
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="admin-editor-modal-close"
              aria-label="Close"
            >
              <X size={20} strokeWidth={1.75} aria-hidden />
            </button>
          </header>

          <div className="admin-editor-modal-body">
            {saveError && (
              <p className="admin-editor-save-error" role="alert">
                {saveError}
              </p>
            )}
            <WritingEditor
              key={editorKey}
              initialValues={initialValues}
              placeholder="Start writing…"
              onSave={handleSave}
            />
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
