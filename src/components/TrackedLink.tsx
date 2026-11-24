"use client";
import { recordAuditEntry, trackEvent } from "@/lib/analytics";

export function TrackedLink({
  href,
  event,
  source,
  element,
  className,
  target,
  children,
}: {
  href: string;
  event: string;
  source: string;
  element?: string;
  className?: string;
  target?: "_blank";
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={target}
      rel={target ? "noopener noreferrer" : undefined}
      className={className}
      data-journey-element={element ?? source}
      onClick={() => {
        if (href.startsWith("/audit")) recordAuditEntry(element ?? source);
        trackEvent(event, { ui_element: element ?? source, destination_path: href });
      }}
    >
      {children}
    </a>
  );
}
