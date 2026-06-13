"use client";

import { signIn } from "next-auth/react";

export function GoogleSignInButton() {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/admin/posts" })}
      className="admin-login-button"
    >
      Continue with Google
    </button>
  );
}
