import {
  ALLOWED_BODY_TAGS,
  type AllowedBodyTag,
} from "@/lib/editor/types";

const ALLOWED_TAGS = new Set<string>(ALLOWED_BODY_TAGS);

const ALLOWED_STYLE_PROPERTIES = new Set(["font-size"]);

function isAllowedTag(tag: string): tag is AllowedBodyTag {
  return ALLOWED_TAGS.has(tag);
}

function sanitizeStyle(styleValue: string | null): string | null {
  if (!styleValue) {
    return null;
  }

  const declarations = styleValue
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);

  const allowed = declarations
    .map((declaration) => {
      const separator = declaration.indexOf(":");
      if (separator === -1) {
        return null;
      }

      const property = declaration.slice(0, separator).trim().toLowerCase();
      const value = declaration.slice(separator + 1).trim();

      if (!ALLOWED_STYLE_PROPERTIES.has(property) || !value) {
        return null;
      }

      return `${property}: ${value}`;
    })
    .filter(Boolean);

  return allowed.length > 0 ? allowed.join("; ") : null;
}

function cleanNode(node: Node, doc: Document): Node | DocumentFragment | null {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.cloneNode(false);
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const element = node as Element;
  const tag = element.tagName.toLowerCase();

  if (!isAllowedTag(tag)) {
    const fragment = doc.createDocumentFragment();

    for (const child of Array.from(element.childNodes)) {
      const cleaned = cleanNode(child, doc);
      if (cleaned) {
        fragment.append(cleaned);
      }
    }

    return fragment;
  }

  const cleanElement = doc.createElement(tag);

  if (tag === "a") {
    const href = element.getAttribute("href");
    if (href) {
      cleanElement.setAttribute("href", href);
    }
  }

  if (tag === "span") {
    const style = sanitizeStyle(element.getAttribute("style"));
    if (style) {
      cleanElement.setAttribute("style", style);
    }
  }

  for (const child of Array.from(element.childNodes)) {
    const cleaned = cleanNode(child, doc);
    if (cleaned) {
      cleanElement.append(cleaned);
    }
  }

  return cleanElement;
}

/** Strip disallowed tags/attributes from rich text HTML. */
export function sanitizeBodyHtml(html: string): string {
  if (!html.trim()) {
    return "";
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  const output = doc.createElement("div");

  for (const child of Array.from(doc.body.childNodes)) {
    const cleaned = cleanNode(child, doc);
    if (cleaned) {
      output.append(cleaned);
    }
  }

  return output.innerHTML;
}
