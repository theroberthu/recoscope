// Changing the poll id starts a fresh poll; keep old votes for the private archive.
export const CATEGORY_POLL = {
  id: "new-category-2026-11",
  options: [
    { id: "air-fryers", label: "Air fryers" },
    { id: "electric-toothbrushes", label: "Electric toothbrushes" },
    { id: "cordless-vacuums", label: "Cordless vacuums" },
  ],
};

export function isPollOption(value) {
  return typeof value === "string" && CATEGORY_POLL.options.some(option => option.id === value);
}

export function pollResults(rows) {
  const options = CATEGORY_POLL.options.map(option => ({
    ...option,
    votes: Number(rows.find(row => row.option_key === option.id)?.votes ?? 0),
  }));
  const total = options.reduce((sum, option) => sum + option.votes, 0);
  return { total, options: options.map(option => ({
    ...option, percent: total ? Math.round(option.votes / total * 100) : 0,
  })) };
}
