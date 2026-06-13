import { $isListNode, ListNode } from "@lexical/list";
import { $isHeadingNode, $isQuoteNode } from "@lexical/rich-text";
import { $findMatchingParent, $getNearestNodeOfType } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
} from "lexical";

export function getBlockType(): string {
  const selection = $getSelection();

  if (!$isRangeSelection(selection)) {
    return "paragraph";
  }

  const anchorNode = selection.anchor.getNode();
  const element =
    anchorNode.getKey() === "root"
      ? anchorNode
      : ($findMatchingParent(anchorNode, (node) => {
          const parent = node.getParent();
          return parent !== null && $isRootOrShadowRoot(parent);
        }) ?? anchorNode.getTopLevelElementOrThrow());

  if ($isHeadingNode(element)) {
    return element.getTag();
  }

  if ($isQuoteNode(element)) {
    return "quote";
  }

  if ($isListNode(element)) {
    return element.getListType();
  }

  const listNode = $getNearestNodeOfType(anchorNode, ListNode);
  if (listNode) {
    return listNode.getListType();
  }

  return "paragraph";
}
