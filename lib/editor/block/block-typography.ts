import { $isListItemNode } from "@lexical/list";
import { $patchStyleText, $setBlocksType } from "@lexical/selection";
import { $findMatchingParent } from "@lexical/utils";
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  getStyleObjectFromCSS,
  type BaseSelection,
  type ElementNode,
  type LexicalEditor,
  type LexicalNode,
  type RangeSelection,
  type TextNode,
} from "lexical";

import { getBlockType } from "@/lib/editor/block/block-type";

const BODY_FONT_SIZE = 17;

/** Font size defaults per block type — mirrors `.editor-body` CSS. */
export const BLOCK_TYPOGRAPHY = {
  paragraph: { fontSize: BODY_FONT_SIZE },
  quote: { fontSize: BODY_FONT_SIZE },
  bullet: { fontSize: BODY_FONT_SIZE },
  number: { fontSize: BODY_FONT_SIZE },
  h1: { fontSize: 28 },
  h2: { fontSize: 22 },
  h3: { fontSize: 20 },
} as const;

export type BlockTypographyKey = keyof typeof BLOCK_TYPOGRAPHY;

export function getBlockTypographyDefaults(blockType: string) {
  if (blockType in BLOCK_TYPOGRAPHY) {
    return BLOCK_TYPOGRAPHY[blockType as BlockTypographyKey];
  }

  return BLOCK_TYPOGRAPHY.paragraph;
}

export function getCurrentBlockTypographyDefaults() {
  return getBlockTypographyDefaults(getBlockType());
}

function styleObjectToString(style: Record<string, string>) {
  return Object.entries(style)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
}

function $getTopLevelBlock(node: LexicalNode): ElementNode | null {
  if ($isRootOrShadowRoot(node)) {
    return null;
  }

  const block = $findMatchingParent(node, (candidate) => {
    const parent = candidate.getParent();
    return parent !== null && $isRootOrShadowRoot(parent);
  });

  if (block && $isElementNode(block)) {
    return block;
  }

  const topLevel = node.getTopLevelElementOrThrow();
  return $isElementNode(topLevel) ? topLevel : null;
}

/** Block representing the current line — list item, or top-level block otherwise. */
export function $getLineBlock(node: LexicalNode): ElementNode | null {
  const listItem = $findMatchingParent(node, $isListItemNode);
  if (listItem && $isElementNode(listItem)) {
    return listItem;
  }

  return $getTopLevelBlock(node);
}

export function $collectLineBlocksFromSelection(
  selection: RangeSelection,
): ElementNode[] {
  const blocks = new Set<ElementNode>();

  const addBlock = (node: LexicalNode) => {
    const block = $getLineBlock(node);
    if (block) {
      blocks.add(block);
    }
  };

  addBlock(selection.anchor.getNode());
  addBlock(selection.focus.getNode());

  for (const node of selection.getNodes()) {
    addBlock(node);
  }

  return [...blocks];
}

export function clearInlineTypographyOnTextNode(node: TextNode) {
  const style = { ...getStyleObjectFromCSS(node.getStyle()) };
  delete style["font-family"];
  delete style["font-size"];
  node.setStyle(styleObjectToString(style));
}

export function clearInlineTypographyOnSelection(selection: BaseSelection) {
  $patchStyleText(selection, {
    "font-family": null,
    "font-size": null,
  });
}

export function $clearInlineTypographyInElement(element: ElementNode) {
  for (const node of element.getAllTextNodes()) {
    if ($isTextNode(node)) {
      clearInlineTypographyOnTextNode(node);
    }
  }
}

/** Clear inline font overrides on every top-level block touched by the selection. */
export function $clearTypographyInAffectedBlocks(selection: RangeSelection) {
  const blocks = new Set<ElementNode>();

  for (const node of selection.getNodes()) {
    const block = $getTopLevelBlock(node);
    if (block) {
      blocks.add(block);
    }
  }

  for (const point of [selection.anchor, selection.focus]) {
    const block = $getTopLevelBlock(point.getNode());
    if (block) {
      blocks.add(block);
    }
  }

  for (const block of blocks) {
    $clearInlineTypographyInElement(block);
  }

  clearInlineTypographyOnSelection(selection);
}

/** Set block type and reset inline font overrides so block CSS defaults apply. */
export function $applyBlockType(createBlock: () => ElementNode) {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) {
    return;
  }

  $setBlocksType(selection, () => createBlock());

  const updatedSelection = $getSelection();
  if ($isRangeSelection(updatedSelection)) {
    $clearTypographyInAffectedBlocks(updatedSelection);
  }
}

export function applyBlockType(
  editor: LexicalEditor,
  createBlock: () => ElementNode,
) {
  editor.update(() => {
    $applyBlockType(createBlock);
  });
}
