/**
 * One rule for showing raw values (statuses, kinds, roles, types) in the UI:
 * words separated by spaces, first letter upper-case, the rest lower-case —
 * "under_review" → "Under review", "PUBLISHED" → "Published".
 */
export function sentenceCase(value: string | null | undefined): string {
  const text = (value ?? "").replace(/[_-]+/g, " ").trim().toLowerCase()
  return text.charAt(0).toUpperCase() + text.slice(1)
}
