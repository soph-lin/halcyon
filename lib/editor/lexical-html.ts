import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { $getRoot, type LexicalEditor } from "lexical";

import { sanitizeBodyHtml } from "@/lib/sanitize";

export function getEditorHtml(editor: LexicalEditor): string {
  let html = "";

  editor.getEditorState().read(() => {
    html = sanitizeBodyHtml($generateHtmlFromNodes(editor, null));
  });

  return html;
}

export function setEditorHtml(editor: LexicalEditor, html: string): void {
  const sanitized = sanitizeBodyHtml(html);

  if (!sanitized) {
    return;
  }

  editor.update(() => {
    const dom = new DOMParser().parseFromString(sanitized, "text/html");
    const nodes = $generateNodesFromDOM(editor, dom);
    const root = $getRoot();
    root.clear();
    root.append(...nodes);
  });
}
