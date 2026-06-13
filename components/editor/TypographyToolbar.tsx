"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
  type TextFormat,
} from "@/lib/editor/lexical/typography";

type TypographyToolbarProps = {
  fontSize: number;
  activeFormats: TextFormat[];
  onFontSizeChange: (fontSize: number) => void;
  onFontSizeEditStart?: () => void;
  onFontSizeEditEnd?: () => void;
  onFormat: (format: TextFormat) => void;
};

const FORMAT_BUTTONS: { format: TextFormat; label: string; title: string }[] = [
  { format: "bold", label: "B", title: "Bold" },
  { format: "italic", label: "I", title: "Italic" },
  { format: "underline", label: "U", title: "Underline" },
];

function clampFontSize(size: number) {
  return Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, size));
}

function parseFontSizeInput(value: string): number | null {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? clampFontSize(parsed) : null;
}

export function TypographyToolbar({
  fontSize,
  activeFormats,
  onFontSizeChange,
  onFontSizeEditStart,
  onFontSizeEditEnd,
  onFormat,
}: TypographyToolbarProps) {
  const sizeFieldRef = useRef<HTMLDivElement>(null);
  const replaceOnNextDigitRef = useRef(false);
  const [isEditingFontSize, setIsEditingFontSize] = useState(false);
  const [fontSizeDraft, setFontSizeDraft] = useState(String(fontSize));

  const displayedFontSize = isEditingFontSize
    ? fontSizeDraft || "\u00a0"
    : String(fontSize);

  const commitFontSizeDraft = useCallback(() => {
    const nextSize = parseFontSizeInput(fontSizeDraft) ?? fontSize;
    onFontSizeChange(nextSize);
  }, [fontSize, fontSizeDraft, onFontSizeChange]);

  const stopEditingFontSize = useCallback(
    (commit: boolean) => {
      if (commit) {
        commitFontSizeDraft();
      }

      setIsEditingFontSize(false);
      replaceOnNextDigitRef.current = false;
      onFontSizeEditEnd?.();
    },
    [commitFontSizeDraft, onFontSizeEditEnd],
  );

  const startEditingFontSize = useCallback(() => {
    onFontSizeEditStart?.();
    setIsEditingFontSize(true);
    setFontSizeDraft(String(fontSize));
    replaceOnNextDigitRef.current = true;
  }, [fontSize, onFontSizeEditStart]);

  useEffect(() => {
    if (!isEditingFontSize) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      event.stopPropagation();

      if (event.key === "Enter") {
        event.preventDefault();
        stopEditingFontSize(true);
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        stopEditingFontSize(false);
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        replaceOnNextDigitRef.current = false;
        setFontSizeDraft((current) => current.slice(0, -1));
        return;
      }

      if (/^\d$/.test(event.key)) {
        event.preventDefault();
        setFontSizeDraft((current) =>
          replaceOnNextDigitRef.current ? event.key : `${current}${event.key}`,
        );
        replaceOnNextDigitRef.current = false;
        return;
      }

      // Editor keeps DOM focus — swallow other keys so they don't insert into the draft.
      event.preventDefault();
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (sizeFieldRef.current?.contains(target)) {
        return;
      }

      stopEditingFontSize(true);
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("pointerdown", handlePointerDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [isEditingFontSize, stopEditingFontSize]);

  const handleStepFontSize = (delta: number) => {
    if (isEditingFontSize) {
      stopEditingFontSize(false);
    }

    onFontSizeChange(fontSize + delta);
  };

  return (
    <div
      className="editor-typography-toolbar flex flex-wrap items-center gap-2"
      role="toolbar"
      aria-label="Formatting"
    >
      <div
        ref={sizeFieldRef}
        className={`editor-toolbar-size${isEditingFontSize ? " is-editing" : ""}`}
      >
        <button
          type="button"
          className="editor-toolbar-size-btn"
          aria-label="Decrease font size"
          disabled={fontSize <= MIN_FONT_SIZE}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => handleStepFontSize(-1)}
        >
          −
        </button>
        <div
          role="textbox"
          aria-label="Font size"
          aria-readonly={!isEditingFontSize}
          className={`editor-toolbar-size-field${isEditingFontSize ? " is-editing" : ""}`}
          onMouseDown={(event) => {
            event.preventDefault();

            if (!isEditingFontSize) {
              startEditingFontSize();
            }
          }}
        >
          <span className="editor-toolbar-size-value">{displayedFontSize}</span>
          {isEditingFontSize ? (
            <span className="editor-toolbar-size-caret" aria-hidden="true" />
          ) : null}
        </div>
        <button
          type="button"
          className="editor-toolbar-size-btn"
          aria-label="Increase font size"
          disabled={fontSize >= MAX_FONT_SIZE}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => handleStepFontSize(1)}
        >
          +
        </button>
      </div>

      <div className="editor-toolbar-divider" aria-hidden />

      <div className="flex items-center gap-0.5">
        {FORMAT_BUTTONS.map(({ format, label, title }) => {
          const isActive = activeFormats.includes(format);

          return (
            <button
              key={format}
              type="button"
              title={title}
              aria-label={title}
              aria-pressed={isActive}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onFormat(format)}
              className={`editor-toolbar-btn${isActive ? " is-active" : ""}`}
            >
              <span
                className={
                  format === "bold"
                    ? "font-bold"
                    : format === "italic"
                      ? "italic"
                      : format === "underline"
                        ? "underline"
                        : undefined
                }
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
