"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export function SignOutActions() {
  return (
    <div className="admin-sign-out-actions">
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="admin-login-button"
      >
        Sign out
      </button>
      <Link href="/" className="admin-sign-out-cancel">
        Cancel
      </Link>
    </div>
  );
}
