// Shared bucketing so group member counts read as "roughly how active is
// this group" rather than an exact (often small, discouraging) number.

export function getMemberCountLabel(count: number): string {
  if (count < 10) return "Less than 10 members";
  if (count <= 50) return "Between 10 and 50 members";
  return "More than 50 members";
}
