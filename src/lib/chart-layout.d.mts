export function spreadChartLabels<T extends {y: number}>(items: T[], top: number, bottom: number, gap?: number): (T & {labelY: number})[];
