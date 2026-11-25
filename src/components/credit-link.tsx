/** Small footer credit. Hide it with NEXT_PUBLIC_HIDE_CREDIT=true. */
export function CreditLink({ className = "" }: { className?: string }) {
  if (process.env.NEXT_PUBLIC_HIDE_CREDIT === "true") return null;
  return (
    <a
      href="https://www.instagram.com/oliverknzght"
      target="_blank"
      rel="noopener noreferrer"
      className={`text-sm text-muted-foreground/60 hover:text-muted-foreground transition ${className}`}
    >
      template by ollie knight
    </a>
  );
}
