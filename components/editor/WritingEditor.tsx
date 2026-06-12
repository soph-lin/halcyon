"use client";

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import type { LexicalEditor } from "lexical";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { FloatingToolbarPortal } from "@/components/editor/lexical/FloatingToolbarPortal";
import { LexicalFontSizeShortcutPlugin } from "@/components/editor/lexical/LexicalFontSizeShortcutPlugin";
import { LexicalInitialHtmlPlugin } from "@/components/editor/lexical/LexicalInitialHtmlPlugin";
import { LexicalPastePlugin } from "@/components/editor/lexical/LexicalPastePlugin";
import { LexicalSlashMenuPlugin } from "@/components/editor/lexical/LexicalSlashMenuPlugin";
import { getEditorHtml } from "@/lib/editor/lexical-html";
import { writingMarkdownTransformers } from "@/lib/editor/markdown-transformers";
import { editorNodes } from "@/lib/editor/lexical-nodes";
import { shouldIgnoreToolbarToggle } from "@/lib/editor/editor-shortcuts";
import { lexicalTheme } from "@/lib/editor/lexical-theme";
import type { EditorSavePayload, WritingEditorProps } from "@/lib/editor/types";

function onEditorError(error: Error) {
  console.error(error);
}

export function WritingEditor({
  initialValues,
  onSave,
  placeholder = "Begin writing…",
}: WritingEditorProps) {
  const editorRef = useRef<LexicalEditor | null>(null);
  const savedTitle = initialValues?.title ?? "";
  const savedBody = initialValues?.body ?? "";

  const [title, setTitle] = useState(savedTitle);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);

  const initialConfig = useMemo(
    () => ({
      namespace: "halcyon-writing",
      theme: lexicalTheme,
      nodes: editorNodes,
      onError: onEditorError,
    }),
    [],
  );

  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "t" && event.key !== "T") {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (shouldIgnoreToolbarToggle(event.target)) {
        return;
      }

      event.preventDefault();
      setIsToolbarOpen((open) => !open);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSave = useCallback(async () => {
    const editor = editorRef.current;
    const body = editor ? getEditorHtml(editor) : "";
    const payload: EditorSavePayload = {
      title: title.trim(),
      body,
    };

    setIsSaving(true);

    try {
      await onSave?.(payload);
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  }, [onSave, title]);

  return (
    <article className="writing-editor-page mx-auto w-full max-w-[42rem]">
      <LexicalComposer initialConfig={initialConfig}>
        <EditorRefPlugin editorRef={editorRef} />
        <LexicalFontSizeShortcutPlugin onDirty={markDirty} />
        <FloatingToolbarPortal isOpen={isToolbarOpen} onDirty={markDirty} />

        <div className="writing-editor-sheet rounded-sm shadow-[0_1px_2px_rgba(61,43,31,0.06),0_12px_40px_rgba(61,43,31,0.12)]">
          <header className="editor-gutter border-b border-[var(--editor-rule)] pb-4 pt-8 sm:pt-10">
            <p className="mb-3 font-heading text-[0.6875rem] uppercase tracking-[0.28em] text-[var(--editor-muted)]">
              Draft
            </p>
            <input
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setIsDirty(true);
              }}
              placeholder="Untitled"
              aria-label="Title"
              className="editor-title-input w-full bg-transparent font-heading text-[clamp(1.75rem,4vw,2.5rem)] leading-[1.15] text-[var(--editor-ink)] placeholder:text-[var(--editor-muted)]/60 focus:outline-none"
            />
          </header>

          <div className="editor-gutter py-6 sm:py-8">
            <div className="editor-body-root relative min-h-[24rem]">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable
                    className="editor-body min-h-[24rem] font-body text-[1.0625rem] leading-[1.75] text-[var(--editor-ink)] focus:outline-none"
                    aria-label="Body"
                    role="textbox"
                    aria-multiline
                  />
                }
                placeholder={
                  <div
                    className="editor-body-placeholder pointer-events-none font-body text-[1.0625rem] leading-[1.75] text-[color-mix(in_srgb,var(--editor-muted)_55%,transparent)]"
                    aria-hidden
                  >
                    {placeholder}
                  </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
              <HistoryPlugin />
              <ListPlugin />
              <LinkPlugin />
              <MarkdownShortcutPlugin
                transformers={writingMarkdownTransformers}
              />
              <LexicalSlashMenuPlugin onDirty={markDirty} />
              <AutoFocusPlugin />
              <OnChangePlugin
                ignoreSelectionChange
                onChange={() => markDirty()}
              />
              <LexicalInitialHtmlPlugin html={savedBody} />
              <LexicalPastePlugin onDirty={markDirty} />
            </div>
          </div>

          <footer className="editor-gutter flex items-center justify-between gap-4 border-t border-[var(--editor-rule)] py-4">
            <p className="text-sm text-[var(--editor-muted)]">
              {isDirty ? "Unsaved changes" : "All changes saved"}
            </p>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="editor-save-btn"
            >
              {isSaving ? "Saving…" : "Save draft"}
            </button>
          </footer>
        </div>
      </LexicalComposer>
    </article>
  );
}
