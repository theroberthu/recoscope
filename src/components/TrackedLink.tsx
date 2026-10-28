"use client";
import { trackEvent } from "@/lib/analytics";

export function TrackedLink({
  href,
  event,
  source,
  className,
  target,
  children,
}: {
  href: string;
  event: string;
  source: string;
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
      onClick={() => trackEvent(event, { source })}
    >
      {children}
    </a>
  );
}
