import type { EditorThemeClasses } from "lexical";

/** Lexical theme classes — block typography also uses semantic tags under `.editor-body`. */
export const lexicalTheme: EditorThemeClasses = {
  paragraph: "editor-paragraph",
  quote: "editor-quote",
  heading: {
    h1: "editor-h1",
    h2: "editor-h2",
    h3: "editor-h3",
  },
  list: {
    ul: "editor-ul",
    ol: "editor-ol",
    listitem: "editor-li",
  },
  link: "editor-link",
  code: "editor-code-block",
  text: {
    bold: "editor-bold",
    italic: "editor-italic",
    code: "editor-inline-code",
  },
};
