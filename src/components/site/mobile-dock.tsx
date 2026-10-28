"use client";
import { useEffect, useState } from "react";
import { ArrowUp, Download, Send } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Phone/tablet action bar: resume and contact always one tap away once the
 * visitor has scrolled past the hero. Hides again while the contact section
 * is on screen, where those actions already are.
 */
export function MobileDock({ resumeHref, showContact }: { resumeHref?: string; showContact: boolean }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let atContact = false;
    const contact = document.getElementById("contact");
    const update = () => setShow(window.scrollY > window.innerHeight * 0.8 && !atContact);
    const io = contact
      ? new IntersectionObserver(([e]) => {
          atContact = e.isIntersecting;
          update();
        }, { rootMargin: "0px 0px -30% 0px" })
      : null;
    if (contact && io) io.observe(contact);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      io?.disconnect();
    };
  }, []);
  if (!resumeHref && !showContact) return null;
  return (
    <div
      className={cn(
        "dock fixed inset-x-3 bottom-3 z-40 flex items-center gap-2 rounded-full border border-line bg-surface/90 p-1.5 shadow-[0_18px_40px_-16px_rgb(0_0_0/0.45)] backdrop-blur-md transition-[opacity,translate] duration-300 lg:hidden print:hidden",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
      )}
      aria-hidden={!show}
    >
      {resumeHref && (
        <a
          href={`${resumeHref}?download=1`}
          tabIndex={show ? 0 : -1}
          className="press flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-line text-[15px] font-medium text-ink"
        >
          <Download className="size-4" aria-hidden /> Resume
        </a>
      )}
      {showContact && (
        <a
          href="#contact"
          tabIndex={show ? 0 : -1}
          className="press flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-accent text-[15px] font-medium text-accent-fg"
        >
          <Send className="size-4" aria-hidden /> Contact me
        </a>
      )}
      <a href="#top" tabIndex={show ? 0 : -1} aria-label="Back to top" className="press flex size-11 shrink-0 items-center justify-center rounded-full text-ink hover:bg-sunken">
        <ArrowUp className="size-4" aria-hidden />
      </a>
    </div>
  );
}
