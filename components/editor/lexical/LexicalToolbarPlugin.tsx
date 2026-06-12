"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
  type RangeSelection,
} from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";

import { TypographyToolbar } from "@/components/editor/TypographyToolbar";
import {
  $applyFontSizeToLineBlocks,
  applyTextFormat,
  clampFontSize,
  DEFAULT_FONT_SIZE,
  getActiveTextFormats,
  getSelectionFontSize,
  type TextFormat,
} from "@/lib/editor/typography";

type LexicalToolbarPluginProps = {
  onDirty: () => void;
};

export function LexicalToolbarPlugin({ onDirty }: LexicalToolbarPluginProps) {
  const [editor] = useLexicalComposerContext();
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [activeFormats, setActiveFormats] = useState<TextFormat[]>([]);
  const savedSelectionRef = useRef<RangeSelection | null>(null);

  const syncToolbarFromSelection = useCallback(() => {
    setFontSize(getSelectionFontSize());
    setActiveFormats(getActiveTextFormats());
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(syncToolbarFromSelection);
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          editor.getEditorState().read(syncToolbarFromSelection);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, syncToolbarFromSelection]);

  const handleFontSizeEditStart = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      savedSelectionRef.current = $isRangeSelection(selection)
        ? selection.clone()
        : null;
    });
  }, [editor]);

  const handleFontSizeEditEnd = useCallback(() => {
    savedSelectionRef.current = null;
  }, []);

  const handleFontSizeChange = useCallback(
    (nextSize: number) => {
      const clamped = clampFontSize(nextSize);

      editor.update(() => {
        const savedSelection = savedSelectionRef.current;
        if (savedSelection) {
          $setSelection(savedSelection);
        }

        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $applyFontSizeToLineBlocks(selection, clamped);
        }
      });

      savedSelectionRef.current = null;
      onDirty();
    },
    [editor, onDirty],
  );

  const handleFormat = useCallback(
    (format: TextFormat) => {
      applyTextFormat(editor, format);
      onDirty();
    },
    [editor, onDirty],
  );

  return (
    <TypographyToolbar
      fontSize={fontSize}
      activeFormats={activeFormats}
      onFontSizeChange={handleFontSizeChange}
      onFontSizeEditStart={handleFontSizeEditStart}
      onFontSizeEditEnd={handleFontSizeEditEnd}
      onFormat={handleFormat}
    />
  );
}
