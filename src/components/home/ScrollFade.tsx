/**
 * ScrollFade — pass-through wrapper.
 * Previously animated sections on scroll, but caused black-screen bugs.
 * Now simply renders children with an optional className.
 */
export function ScrollFade({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
