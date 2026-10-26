"use client";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useActiveSection } from "./active-section";
import { cn } from "@/lib/utils";

export type NavItem = { id: string; label: string };

export function SiteHeader({
  name,
  nav,
  allowToggle,
  banner,
}: {
  name: string;
  nav: NavItem[];
  allowToggle: boolean;
  banner?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection(nav.map((n) => n.id));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors",
        scrolled || open ? "border-line bg-paper/85 backdrop-blur-md" : "border-transparent bg-paper",
      )}
    >
      {banner}
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <a href="#top" className="text-[15px] font-semibold tracking-tight text-ink">
          {name}
        </a>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              aria-current={active === n.id && scrolled ? "location" : undefined}
              className={cn(
                "relative rounded-full px-3 py-1.5 text-sm transition-colors hover:text-ink",
                active === n.id && scrolled ? "bg-sunken text-ink" : "text-muted",
              )}
            >
              {n.label}
            </a>
          ))}
          {allowToggle && <ThemeToggle />}
        </nav>
        <div className="flex items-center gap-1 md:hidden">
          {allowToggle && <ThemeToggle />}
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-full text-ink hover:bg-sunken"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-line px-5 pb-5 pt-2 md:hidden">
          <ul className="flex flex-col">
            {nav.map((n) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  onClick={() => setOpen(false)}
                  className="block border-b border-line py-3 text-[15px] text-ink last:border-0"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
