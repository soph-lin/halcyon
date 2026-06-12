"use client";

import { $generateNodesFromDOM } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  PASTE_COMMAND,
} from "lexical";
import { useEffect } from "react";

import { sanitizeBodyHtml } from "@/lib/sanitize";

type LexicalPastePluginProps = {
  onDirty: () => void;
};

export function LexicalPastePlugin({ onDirty }: LexicalPastePluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent) => {
        const html = event.clipboardData?.getData("text/html");

        if (!html) {
          return false;
        }

        event.preventDefault();

        const sanitized = sanitizeBodyHtml(html);

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
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor, onDirty]);

  return null;
}
