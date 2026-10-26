export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
    >
      Skip to content
    </a>
  );
}

export function Availability({ text, className = "" }: { text: string; className?: string }) {
  return (
    <p className={`inline-flex items-center gap-2 text-[13px] ${className}`}>
      <span className="relative flex size-2 shrink-0">
        <span className="absolute inset-0 rounded-full bg-success opacity-30 motion-safe:animate-ping" />
        <span className="relative size-2 rounded-full bg-success" />
      </span>
      {text}
    </p>
  );
}
