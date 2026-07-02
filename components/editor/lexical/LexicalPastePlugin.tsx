"use client";

import { $generateNodesFromDOM } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { LexicalEditor } from "lexical";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  PASTE_COMMAND,
} from "lexical";
import { useEffect } from "react";

import { sanitizeBodyHtml } from "@/lib/editor/format/sanitize";

type LexicalPastePluginProps = {
  onDirty: () => void;
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function isPreformattedText(text: string): boolean {
  if (!text) {
    return false;
  }

  if (/\t/.test(text)) {
    return true;
  }

  if (/^ +/m.test(text)) {
    return true;
  }

  if (/[^\n] {2,}[^\n ]/.test(text)) {
    return true;
  }

  return false;
}

function plainTextToPreservedHtml(text: string): string {
  return `<p><span style="white-space: pre-wrap">${escapeHtml(text)}</span></p>`;
}

function insertSanitizedHtml(
  editor: LexicalEditor,
  sanitized: string,
  onDirty: () => void,
) {
  editor.update(() => {
    const selection = $getSelection();

    if (!$isRangeSelection(selection)) {
      return;
    }

    const dom = new DOMParser().parseFromString(sanitized, "text/html");
    const nodes = $generateNodesFromDOM(editor, dom);
    selection.insertNodes(nodes);
  });

  onDirty();
}

export function LexicalPastePlugin({ onDirty }: LexicalPastePluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent) => {
        const clipboard = event.clipboardData;
        if (!clipboard) {
          return false;
        }

        const plainText = clipboard.getData("text/plain");
        const html = clipboard.getData("text/html");

        if (plainText && isPreformattedText(plainText)) {
          event.preventDefault();
          insertSanitizedHtml(
            editor,
            sanitizeBodyHtml(plainTextToPreservedHtml(plainText)),
            onDirty,
          );
          return true;
        }

        if (html) {
          event.preventDefault();
          insertSanitizedHtml(editor, sanitizeBodyHtml(html), onDirty);
          return true;
        }

        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor, onDirty]);

  return null;
}
