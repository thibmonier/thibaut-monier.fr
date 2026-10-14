// Index du prochain élément focalisable dans un piège de focus (Tab / Maj+Tab), -1 s'il n'y en a aucun.
export function nextFocusIndex(current: number, count: number, backwards: boolean): number {
  if (count === 0) return -1;
  if (current < 0) return backwards ? count - 1 : 0;
  return (current + (backwards ? -1 : 1) + count) % count;
}
