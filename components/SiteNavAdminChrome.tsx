"use client";

import Link from "next/link";
import { Sun } from "lucide-react";

import { useEditor } from "@/components/editor/admin/EditorContext";

export function SiteNavDashboardLink() {
  const { isAdmin, showAdminUi } = useEditor();

  if (!isAdmin || !showAdminUi) {
    return null;
  }

  return (
    <Link
      href="/admin/posts"
      className="site-nav-dashboard-link"
      aria-label="Dashboard"
    >
      <Sun size={17} strokeWidth={1.75} aria-hidden />
    </Link>
  );
}

export function SiteNavSignOutLink() {
  const { isAdmin, showAdminUi } = useEditor();

  if (!isAdmin || !showAdminUi) {
    return null;
  }

  return (
    <Link href="/admin/sign-out" className="site-nav-sign-out">
      Sign out
    </Link>
  );
}
