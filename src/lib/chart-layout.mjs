/** Spread labels without changing the plotted observations or their ranks. */
export function spreadChartLabels(items, top, bottom, gap = 22) {
  const sorted = items.map(item => ({...item})).sort((a, b) => a.y - b.y);
  for (let i = 0; i < sorted.length; i++) {
    sorted[i].labelY = Math.max(sorted[i].y, i ? sorted[i - 1].labelY + gap : top);
  }
  if (sorted.length && sorted.at(-1).labelY > bottom) {
    sorted.at(-1).labelY = bottom;
    for (let i = sorted.length - 2; i >= 0; i--) {
      sorted[i].labelY = Math.min(sorted[i].labelY, sorted[i + 1].labelY - gap);
    }
  }
  return sorted;
}
