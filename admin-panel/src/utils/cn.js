/** Tiny className joiner — skips falsy values. */
export function cn(...parts) {
  return parts.flat().filter(Boolean).join(' ')
}
