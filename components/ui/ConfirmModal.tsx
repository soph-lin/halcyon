"use client";

import { useEffect, useId } from "react";

import { useBodyScrollLock } from "@/components/ui/useBodyScrollLock";

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isPending?: boolean;
  error?: string | null;
  tone?: "default" | "danger";
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isPending = false,
  error = null,
  tone = "default",
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const titleId = useId();

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isPending, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="ui-confirm-modal-root" role="presentation">
      <button
        type="button"
        className="ui-confirm-modal-backdrop"
        aria-label="Close dialog"
        disabled={isPending}
        onClick={onClose}
      />

      <div
        className="ui-confirm-modal-panel"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h2 id={titleId} className="ui-confirm-modal-title">
          {title}
        </h2>
        <p className="ui-confirm-modal-message">{message}</p>

        {error && (
          <p className="ui-confirm-modal-error" role="alert">
            {error}
          </p>
        )}

        <div className="ui-confirm-modal-actions">
          <button
            type="button"
            className="ui-confirm-modal-cancel"
            disabled={isPending}
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={
              tone === "danger"
                ? "ui-confirm-modal-confirm ui-confirm-modal-confirm-danger"
                : "ui-confirm-modal-confirm"
            }
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
