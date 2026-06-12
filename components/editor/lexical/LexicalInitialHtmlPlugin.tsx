"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useRef } from "react";

import { setEditorHtml } from "@/lib/editor/lexical-html";

type LexicalInitialHtmlPluginProps = {
  html: string;
};

export function LexicalInitialHtmlPlugin({
  html,
}: LexicalInitialHtmlPluginProps) {
  const [editor] = useLexicalComposerContext();
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current || !html.trim()) {
      return;
    }

    loaded.current = true;
    setEditorHtml(editor, html);
  }, [editor, html]);

  return null;
}
