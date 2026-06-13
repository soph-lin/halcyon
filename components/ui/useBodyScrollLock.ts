"use client";

import { useEffect } from "react";

import { lockBodyScroll } from "@/lib/body-scroll-lock";

export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) {
      return;
    }

    return lockBodyScroll();
  }, [active]);
}
