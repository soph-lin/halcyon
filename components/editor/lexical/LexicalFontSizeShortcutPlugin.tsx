"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  KEY_DOWN_COMMAND,
} from "lexical";
import { useCallback, useEffect } from "react";

import {
  getFontSizeShortcutDelta,
  isTypingInEditorBody,
  shouldHandleFontSizeShortcut,
} from "@/lib/editor/editor-shortcuts";
import { $stepLineBlockFontSize } from "@/lib/editor/typography";

type LexicalFontSizeShortcutPluginProps = {
  onDirty: () => void;
};

export function LexicalFontSizeShortcutPlugin({
  onDirty,
}: LexicalFontSizeShortcutPluginProps) {
  const [editor] = useLexicalComposerContext();

  const applyFontSizeDelta = useCallback(
    (delta: -1 | 1) => {
      editor.update(
        () => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $stepLineBlockFontSize(selection, delta, { restoreSelection: false });
          }
        },
        {
          onUpdate: () => {
            editor.blur();
          },
        },
      );

      onDirty();
    },
    [editor, onDirty],
  );

  const tryHandleFontSizeShortcut = useCallback(
    (event: KeyboardEvent): boolean => {
      const delta = getFontSizeShortcutDelta(event.key);
      if (delta === null) {
        return false;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return false;
      }

      if (!shouldHandleFontSizeShortcut(event.target)) {
        return false;
      }

      event.preventDefault();
      applyFontSizeDelta(delta);
      return true;
    },
    [applyFontSizeDelta],
  );

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        KEY_DOWN_COMMAND,
        (event) => {
          if (isTypingInEditorBody(document.activeElement)) {
            return false;
          }

          return tryHandleFontSizeShortcut(event);
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      (() => {
        const handleKeyDown = (event: KeyboardEvent) => {
          if (tryHandleFontSizeShortcut(event)) {
            event.stopPropagation();
          }
        };

        window.addEventListener("keydown", handleKeyDown, true);
        return () => window.removeEventListener("keydown", handleKeyDown, true);
      })(),
    );
  }, [editor, tryHandleFontSizeShortcut]);

  return null;
}
