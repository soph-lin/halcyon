"use client";

import { useCallback, useEffect, useId, useState } from "react";

import { CloseIcon } from "@/components/admin/icons";
import { WritingEditor } from "@/components/editor/WritingEditor";
import {
  COLLECTION_KEYS,
  getCollectionMeta,
  type CollectionKey,
} from "@/lib/collections";
import type { EditorInitialValues, EditorSavePayload } from "@/lib/editor/types";

export type EditorModalSavePayload = EditorSavePayload & {
  collection: CollectionKey;
};

type EditorModalProps = {
  isOpen: boolean;
  mode: "create" | "edit";
  collection: CollectionKey;
  initialValues?: EditorInitialValues;
  saveError?: string | null;
  onClose: () => void;
  onSave: (payload: EditorModalSavePayload) => void | Promise<void>;
};

export function EditorModal({
  isOpen,
  mode,
  collection: initialCollection,
  initialValues,
  saveError,
  onClose,
  onSave,
}: EditorModalProps) {
  const titleId = useId();
  const [collection, setCollection] = useState<CollectionKey>(initialCollection);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

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
      document.body.style.overflow = previousOverflow;
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
            <label className="mt-3 flex items-center gap-2 text-sm text-[var(--editor-muted)]">
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
          </div>

          <button
            type="button"
            onClick={onClose}
            className="admin-editor-modal-close"
            aria-label="Close"
          >
            <CloseIcon />
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
  );
}
