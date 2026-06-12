import { $patchStyleText } from "@lexical/selection";
import {
  $createRangeSelection,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  $setSelection,
  FORMAT_TEXT_COMMAND,
  getStyleObjectFromCSS,
  type ElementNode,
  type LexicalEditor,
  type RangeSelection,
  type TextFormatType,
} from "lexical";

import {
  $collectLineBlocksFromSelection,
  $getLineBlock,
  getBlockTypographyDefaults,
  getCurrentBlockTypographyDefaults,
} from "@/lib/editor/block-typography";
import { getBlockType } from "@/lib/editor/block-type";

export const DEFAULT_FONT_SIZE = 17;
export const MIN_FONT_SIZE = 12;
export const MAX_FONT_SIZE = 48;

export function clampFontSize(size: number): number {
  return Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, size));
}

function styleObjectToString(style: Record<string, string>) {
  return Object.entries(style)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
}

function $applyFontSizeToBlock(
  block: ElementNode,
  fontSizePx: number,
  avoidSelection: boolean,
) {
  const size = `${fontSizePx}px`;
  const textNodes = block.getAllTextNodes();

  if (textNodes.length > 0) {
    for (const node of textNodes) {
      if (!$isTextNode(node)) {
        continue;
      }

      const style = { ...getStyleObjectFromCSS(node.getStyle()) };
      style["font-size"] = size;
      node.setStyle(styleObjectToString(style));
    }

    return;
  }

  if (avoidSelection) {
    const style = { ...getStyleObjectFromCSS(block.getTextStyle()) };
    style["font-size"] = size;
    block.setTextStyle(styleObjectToString(style));
    return;
  }

  const selection = $createRangeSelection();
  selection.anchor.set(block.getKey(), 0, "element");
  selection.focus.set(block.getKey(), 0, "element");
  $patchStyleText(selection, { "font-size": size });
}

type ApplyFontSizeToLineBlocksOptions = {
  restoreSelection?: boolean;
};

/** Apply font size to every line block touched by the selection. */
export function $applyFontSizeToLineBlocks(
  selection: RangeSelection,
  fontSizePx: number,
  options: ApplyFontSizeToLineBlocksOptions = {},
) {
  const { restoreSelection = true } = options;
  const clamped = clampFontSize(fontSizePx);
  const restore = selection.clone();
  const avoidSelection = !restoreSelection;

  for (const block of $collectLineBlocksFromSelection(selection)) {
    $applyFontSizeToBlock(block, clamped, avoidSelection);
  }

  if (restoreSelection) {
    $setSelection(restore);
  }
}

/** Read effective font size from the line block at the cursor — same scope as apply. */
export function getLineBlockFontSize(selection: RangeSelection): number {
  const block = $getLineBlock(selection.anchor.getNode());
  if (!block) {
    return getBlockTypographyDefaults(getBlockType()).fontSize;
  }

  const textNodes = block.getAllTextNodes();
  let inlineValue: string | null = null;

  for (const node of textNodes) {
    if (!$isTextNode(node)) {
      continue;
    }

    const styleValue = getStyleObjectFromCSS(node.getStyle())["font-size"];
    if (styleValue === undefined) {
      continue;
    }

    if (inlineValue === null) {
      inlineValue = styleValue;
    } else if (inlineValue !== styleValue) {
      const anchorNode = selection.anchor.getNode();
      if ($isTextNode(anchorNode)) {
        const atCursor = getStyleObjectFromCSS(anchorNode.getStyle())["font-size"];
        if (atCursor !== undefined) {
          return parseFontSize(atCursor);
        }
      }

      return getBlockTypographyDefaults(getBlockType()).fontSize;
    }
  }

  if (inlineValue !== null) {
    return parseFontSize(inlineValue);
  }

  const blockStyle = getStyleObjectFromCSS(block.getTextStyle())["font-size"];
  if (blockStyle !== undefined) {
    return parseFontSize(blockStyle);
  }

  if (selection.isCollapsed() && selection.style) {
    const selectionStyle = getStyleObjectFromCSS(selection.style)["font-size"];
    if (selectionStyle !== undefined) {
      return parseFontSize(selectionStyle);
    }
  }

  return getBlockTypographyDefaults(getBlockType()).fontSize;
}

/** Step font size on the current line block(s), using the same read/apply path as the toolbar. */
export function $stepLineBlockFontSize(
  selection: RangeSelection,
  delta: number,
  options: ApplyFontSizeToLineBlocksOptions = {},
): number {
  const next = clampFontSize(getLineBlockFontSize(selection) + delta);
  $applyFontSizeToLineBlocks(selection, next, options);
  return next;
}

export type TextFormat = "bold" | "italic" | "underline";

export function parseFontSize(value: string | null | undefined): number {
  if (!value) {
    return DEFAULT_FONT_SIZE;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : DEFAULT_FONT_SIZE;
}

export function getSelectionFontSize(): number {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) {
    return getCurrentBlockTypographyDefaults().fontSize;
  }

  return getLineBlockFontSize(selection);
}

export function getActiveTextFormats(): TextFormat[] {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) {
    return [];
  }

  const formats: TextFormat[] = [];

  if (selection.hasFormat("bold")) {
    formats.push("bold");
  }

  if (selection.hasFormat("italic")) {
    formats.push("italic");
  }

  if (selection.hasFormat("underline")) {
    formats.push("underline");
  }

  return formats;
}

export function applyTextFormat(editor: LexicalEditor, format: TextFormat) {
  editor.dispatchCommand(FORMAT_TEXT_COMMAND, format satisfies TextFormatType);
}

export function setSelectionFontSize(editor: LexicalEditor, size: number) {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      $applyFontSizeToLineBlocks(selection, size);
    }
  });
}
