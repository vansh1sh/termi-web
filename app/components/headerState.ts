export const HEADER_COMPACT_SCROLL_Y = 24;

export function shouldCompactHeader(scrollY: number): boolean {
  return Number.isFinite(scrollY) && scrollY > HEADER_COMPACT_SCROLL_Y;
}
