"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

export function CategoryJump({ categories }: { categories: { name: string; slug: string }[] }) {
  const [selected, setSelected] = useState("");
  return <form className="home-category-jump" action="/tracker" onSubmit={event => {
    event.preventDefault();
    if (!categories.some(category => category.slug === selected)) return;
    trackEvent("benchmark_category_open", { source: "homepage-category-picker" });
    window.location.assign(`/tracker/${encodeURIComponent(selected)}`);
  }}>
    <label htmlFor="home-category">Go straight to your category</label>
    <div>
      <select id="home-category" name="category" required value={selected} onChange={event => setSelected(event.target.value)}>
        <option value="" disabled>Choose a category</option>
        {[...categories].sort((a, b) => a.name.localeCompare(b.name)).map(category => <option key={category.slug} value={category.slug}>{category.name}</option>)}
      </select>
      <button type="submit">View report <span aria-hidden="true">→</span></button>
    </div>
  </form>;
}
