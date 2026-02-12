export const sortOptions = {
  asc: 'asc',
  desc: 'desc'
} as const;

export type SortOption = typeof sortOptions[keyof typeof sortOptions];