export const CHURCH_CATEGORY_LABELS = {
  PARENTS: "For Parents",
  YOUNG_PEOPLE: "For Young People",
  WORKERS: "For Hard Workers",
} as const;

export function getCategoryDisplayName(category: string): string {
  return (
    CHURCH_CATEGORY_LABELS[category as keyof typeof CHURCH_CATEGORY_LABELS] ||
    category
  );
}
