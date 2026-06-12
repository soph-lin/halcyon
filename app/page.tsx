"use client";

import { WritingEditor } from "@/components/editor/WritingEditor";
import type { EditorSavePayload } from "@/lib/editor/types";

export default function Home() {
  const handleSave = async (payload: EditorSavePayload) => {
    // Dev-only — wire to server actions once DB exists.
    console.log("Editor save:", payload);
  };

  return (
    <div className="editor-dev-shell min-h-full py-10 sm:py-16">
      <div className="mx-auto mb-8 max-w-[42rem] px-6">
        <p className="font-heading text-[0.6875rem] uppercase tracking-[0.24em] text-[var(--editor-muted)]">
          Editor preview
        </p>
        <p className="mt-2 text-sm text-[var(--editor-muted)]">
          Temporary dev surface — will move to admin once the editor is done.
        </p>
      </div>

      <WritingEditor
        placeholder="Start with a thought, a paragraph, or paste from Docs…"
        onSave={handleSave}
      />
    </div>
  );
}
