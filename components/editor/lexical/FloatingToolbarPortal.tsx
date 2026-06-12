"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { LexicalToolbarPlugin } from "@/components/editor/lexical/LexicalToolbarPlugin";

type FloatingToolbarPortalProps = {
  isOpen: boolean;
  onDirty: () => void;
};

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function FloatingToolbarPortal({
  isOpen,
  onDirty,
}: FloatingToolbarPortalProps) {
  const isClient = useIsClient();

  if (!isClient || !isOpen) {
    return null;
  }

  return createPortal(
    <div
      id="editor-formatting-toolbar"
      className="editor-floating-toolbar"
      role="region"
      aria-label="Formatting toolbar"
    >
      <LexicalToolbarPlugin onDirty={onDirty} />
    </div>,
    document.body,
  );
}
