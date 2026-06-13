"use client";

import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import {
  $createHeadingNode,
  $createQuoteNode,
} from "@lexical/rich-text";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  type LexicalEditor,
  TextNode,
} from "lexical";

import {
  $applyBlockType,
  $clearTypographyInAffectedBlocks,
} from "@/lib/editor/block/block-typography";
import { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";

class SlashMenuOption extends MenuOption {
  title: string;
  keywords: string[];
  onSelect: () => void;

  constructor(
    title: string,
    options: { keywords?: string[]; onSelect: () => void },
  ) {
    super(title);
    this.title = title;
    this.keywords = options.keywords ?? [];
    this.onSelect = options.onSelect;
  }
}

function getSlashOptions(editor: LexicalEditor): SlashMenuOption[] {
  return [
    new SlashMenuOption("Paragraph", {
      keywords: ["normal", "paragraph", "text", "p"],
      onSelect: () => {
        $applyBlockType(() => $createParagraphNode());
      },
    }),
    new SlashMenuOption("Heading 1", {
      keywords: ["heading", "h1", "title"],
      onSelect: () => {
        $applyBlockType(() => $createHeadingNode("h1"));
      },
    }),
    new SlashMenuOption("Heading 2", {
      keywords: ["heading", "h2", "subtitle"],
      onSelect: () => {
        $applyBlockType(() => $createHeadingNode("h2"));
      },
    }),
    new SlashMenuOption("Heading 3", {
      keywords: ["heading", "h3"],
      onSelect: () => {
        $applyBlockType(() => $createHeadingNode("h3"));
      },
    }),
    new SlashMenuOption("Quote", {
      keywords: ["quote", "blockquote"],
      onSelect: () => {
        $applyBlockType(() => $createQuoteNode());
      },
    }),
    new SlashMenuOption("Bullet list", {
      keywords: ["bullet", "unordered", "ul", "list"],
      onSelect: () => {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $clearTypographyInAffectedBlocks(selection);
        }
      },
    }),
    new SlashMenuOption("Numbered list", {
      keywords: ["numbered", "ordered", "ol", "list"],
      onSelect: () => {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $clearTypographyInAffectedBlocks(selection);
        }
      },
    }),
  ];
}

type LexicalSlashMenuPluginProps = {
  onDirty: () => void;
};

export function LexicalSlashMenuPlugin({ onDirty }: LexicalSlashMenuPluginProps) {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    allowWhitespace: true,
    minLength: 0,
  });

  const options = useMemo(() => {
    const baseOptions = getSlashOptions(editor);

    if (!queryString) {
      return baseOptions;
    }

    const regex = new RegExp(queryString, "i");

    return baseOptions.filter(
      (option) =>
        regex.test(option.title) ||
        option.keywords.some((keyword) => regex.test(keyword)),
    );
  }, [editor, queryString]);

  const onSelectOption = useCallback(
    (
      selectedOption: SlashMenuOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
    ) => {
      editor.update(() => {
        nodeToRemove?.remove();
        selectedOption.onSelect();
        closeMenu();
      });
      onDirty();
    },
    [editor, onDirty],
  );

  return (
    <LexicalTypeaheadMenuPlugin
      anchorClassName="editor-slash-menu-anchor"
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForTriggerMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex, options: menuOptions },
      ) => {
        if (menuOptions.length === 0 || anchorElementRef.current == null) {
          return null;
        }

        const rect = anchorElementRef.current.getBoundingClientRect();

        return createPortal(
          <div
            className="editor-slash-menu editor-slash-menu-portal"
            style={{
              position: "fixed",
              top: rect.bottom + 4,
              left: rect.left,
              minWidth: Math.max(rect.width, 11 * 16),
            }}
          >
            <p className="editor-slash-menu-label">Blocks</p>
            <ul className="editor-slash-menu-list" role="listbox">
              {menuOptions.map((option, index) => {
                const slashOption = option as SlashMenuOption;

                return (
                  <li key={slashOption.key}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selectedIndex === index}
                      className={`editor-slash-menu-item${selectedIndex === index ? " is-selected" : ""}`}
                      ref={slashOption.setRefElement.bind(slashOption)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onClick={() => selectOptionAndCleanUp(slashOption)}
                    >
                      {slashOption.title}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>,
          document.body,
        );
      }}
    />
  );
}
