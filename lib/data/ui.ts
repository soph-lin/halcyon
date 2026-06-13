export const STATUS_PAGES = {
  "not-found": {
    title: "Page not found",
    message: "Sorry, we couldn't find that page. ( ꩜ ᯅ ꩜;)⁭ ",
  },
  "access-denied": {
    title: "Access denied",
    message: "Sorry, you don't have access to this page ദ്ദി(„• _ •„ᵕ)",
  },
} as const;

export type StatusType = keyof typeof STATUS_PAGES;

export function isStatusType(type: string): type is StatusType {
  return type in STATUS_PAGES;
}
