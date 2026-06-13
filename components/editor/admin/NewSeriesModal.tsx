"use client";

import { useEffect, useId, useState } from "react";
import { X } from "lucide-react";

type NewSeriesModalProps = {
  isOpen: boolean;
  isPending?: boolean;
  onClose: () => void;
  onCreate: (input: {
    title: string;
    description: string;
    customOrder: boolean;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
};

type NewSeriesModalContentProps = Omit<NewSeriesModalProps, "isOpen">;

function NewSeriesModalContent({
  isPending = false,
  onClose,
  onCreate,
}: NewSeriesModalContentProps) {
  const titleId = useId();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [customOrder, setCustomOrder] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPending, onClose]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Title is required");
      return;
    }

    setError(null);

    const result = await onCreate({
      title: trimmedTitle,
      description: description.trim(),
      customOrder,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    onClose();
  };

  return (
    <div className="entry-series-modal-root" role="presentation">
      <button
        type="button"
        className="entry-series-modal-backdrop"
        aria-label="Close new series dialog"
        disabled={isPending}
        onClick={onClose}
      />

      <div
        className="entry-series-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="entry-series-modal-header">
          <h2 id={titleId} className="font-heading text-lg tracking-tight">
            New series
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="admin-editor-modal-close"
            aria-label="Close"
            disabled={isPending}
          >
            <X size={20} strokeWidth={1.75} aria-hidden />
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className="entry-series-modal-body admin-series-form"
        >
          <div className="admin-series-form-field">
            <label
              htmlFor="new-series-title"
              className="admin-series-form-label"
            >
              Title
            </label>
            <input
              id="new-series-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="admin-series-form-input"
              required
            />
          </div>

          <div className="admin-series-form-field">
            <label
              htmlFor="new-series-description"
              className="admin-series-form-label"
            >
              Description
            </label>
            <textarea
              id="new-series-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="admin-series-form-textarea"
              rows={3}
            />
          </div>

          <label className="admin-series-form-checkbox">
            <input
              type="checkbox"
              checked={customOrder}
              onChange={(event) => setCustomOrder(event.target.checked)}
            />
            Custom order
          </label>

          {error && (
            <p className="admin-editor-save-error" role="alert">
              {error}
            </p>
          )}

          <div className="admin-series-form-actions">
            <button
              type="submit"
              disabled={isPending}
              className="admin-new-post-button"
            >
              {isPending ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function NewSeriesModal({
  isOpen,
  isPending,
  onClose,
  onCreate,
}: NewSeriesModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <NewSeriesModalContent
      isPending={isPending}
      onClose={onClose}
      onCreate={onCreate}
    />
  );
}
