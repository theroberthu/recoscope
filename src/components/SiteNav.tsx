"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const links = [
  ["/tracker", "Benchmarks"],
  ["/blog", "Research"],
  ["/methodology", "Methodology"],
  ["/platform", "Case study"],
  ["/about", "About Robert"],
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    function escape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    }
    function outside(e: MouseEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", escape);
    document.addEventListener("click", outside);
    return () => {
      document.removeEventListener("keydown", escape);
      document.removeEventListener("click", outside);
    };
  }, [open]);
  return (
    <header className="site-header" ref={root}>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <nav aria-label="Main navigation" className="site-nav">
        <Link
          href="/"
          aria-label="RecoScope home"
          onClick={() => setOpen(false)}
        >
          <img src="/logo.svg" alt="RecoScope" className="nav-logo" />
          <img src="/icon.svg" alt="" className="nav-icon" />
        </Link>
        <div className="nav-desktop">
          {links.map(([href, label]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </div>
        <div className="nav-actions">
          <Link
            href="/audit?source=navigation"
            className="button-primary"
            onClick={() => setOpen(false)}
          >
            Free Audit
          </Link>
          <button
            ref={button}
            type="button"
            className="nav-menu-button"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? "Close" : "Menu"}
            <span aria-hidden="true"> {open ? "×" : "☰"}</span>
          </button>
        </div>
      </nav>
      {open && (
        <nav
          id="mobile-navigation"
          aria-label="More navigation"
          className="nav-mobile"
        >
          {links.map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          <Link href="/subscribe" onClick={() => setOpen(false)}>
            Get report updates
          </Link>
        </nav>
      )}
    </header>
  );
}
