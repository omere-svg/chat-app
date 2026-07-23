export const MESSAGE_CITATIONS_CLASS = {
  section: 'message-citations',
  label: 'message-citations__label',
  list: 'message-citations__list',
} as const

export const MESSAGE_CITATIONS_TEXT = {
  ariaLabel: 'Sources',
  sourcesLabel: (count: number): string => `Sources (${count})`,
} as const

export const CITATION_PREVIEW_LENGTH = 90
