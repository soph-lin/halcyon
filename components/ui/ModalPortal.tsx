"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalPortalProps = {
  children: ReactNode;
};

function subscribe() {
  return () => {};
}

export function ModalPortal({ children }: ModalPortalProps) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  if (!mounted) {
    return null;
  }

  return createPortal(children, document.body);
}
