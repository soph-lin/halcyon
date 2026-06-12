export function isTypingInEditorBody(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.isContentEditable && target.closest(".editor-body") !== null;
}

export function isTypingInTitle(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.closest(".editor-title-input") !== null;
}

export function isTypingInFormField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.closest("input, textarea, select") !== null;
}

export function isEditingToolbarFontSize(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.closest(".editor-toolbar-size.is-editing") !== null;
}

/** T toggles toolbar — ignore in editor body, title, fields, and the toolbar itself. */
export function shouldIgnoreToolbarToggle(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.closest(".editor-floating-toolbar") !== null) {
    return true;
  }

  if (isTypingInEditorBody(target)) {
    return true;
  }

  return isTypingInFormField(target);
}

/** `-` / `=` adjust font size only when focus is outside the draft body. */
export function shouldHandleFontSizeShortcut(target: EventTarget | null): boolean {
  if (isEditingToolbarFontSize(target)) {
    return false;
  }

  if (
    isTypingInTitle(target) ||
    isTypingInTitle(document.activeElement) ||
    isTypingInFormField(target) ||
    isTypingInFormField(document.activeElement)
  ) {
    return false;
  }

  return (
    !isTypingInEditorBody(target) && !isTypingInEditorBody(document.activeElement)
  );
}

export function getFontSizeShortcutDelta(key: string): -1 | 1 | null {
  if (key === "-" || key === "_") {
    return -1;
  }

  if (key === "=" || key === "+" || key === "Equal") {
    return 1;
  }

  return null;
}
