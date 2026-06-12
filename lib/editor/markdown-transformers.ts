import {
  BOLD_STAR,
  HEADING,
  ITALIC_STAR,
  ORDERED_LIST,
  QUOTE,
  UNORDERED_LIST,
  type ElementTransformer,
  type Transformer,
} from "@lexical/markdown";
import { $getSelection, $isRangeSelection, type ElementNode, type LexicalNode } from "lexical";

import { $clearTypographyInAffectedBlocks } from "@/lib/editor/block-typography";

function withInlineTypographyReset(
  transformer: ElementTransformer,
): ElementTransformer {
  const { replace } = transformer;
  if (!replace) {
    return transformer;
  }

  return {
    ...transformer,
    replace: (
      parentNode: ElementNode,
      children: Array<LexicalNode>,
      match: string[],
      isImport: boolean,
    ) => {
      replace(parentNode, children, match, isImport);

      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $clearTypographyInAffectedBlocks(selection);
      }
    },
  };
}

/** Markdown shortcuts — block transforms reset inline font overrides. */
export const writingMarkdownTransformers: Transformer[] = [
  withInlineTypographyReset(HEADING),
  withInlineTypographyReset(QUOTE),
  withInlineTypographyReset(UNORDERED_LIST),
  withInlineTypographyReset(ORDERED_LIST),
  BOLD_STAR,
  ITALIC_STAR,
];
