"use client";
import { ArrowUpRight, Award, ExternalLink, FileText, Lock } from "lucide-react";
import { GithubIcon } from "@/components/brand-icons";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProjectVisual } from "./project-visual";
import type { Project } from "@/lib/schemas";
import { storageUrl } from "@/lib/format";

function Links({ p }: { p: Project }) {
  const links = [
    p.live_url && { href: p.live_url, label: "Live site", icon: ExternalLink },
    p.repo_url && { href: p.repo_url, label: "Source code", icon: GithubIcon },
    p.case_study_url && { href: p.case_study_url, label: "Case study", icon: FileText },
  ].filter(Boolean) as { href: string; label: string; icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }> }[];
  if (!links.length) return null;
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {links.map(({ href, label, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-ink underline-offset-4 hover:underline"
        >
          <Icon className="size-3.5" aria-hidden />
          {label}
        </a>
      ))}
    </div>
  );
}

function Visual({ p, className }: { p: Project; className?: string }) {
  return (
    <div className={`overflow-hidden bg-sunken ${className ?? ""}`}>
      {p.image_path ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={storageUrl(p.image_path)}
          alt={p.image_alt || `Screenshot of ${p.title}`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      ) : (
        <div className="h-full w-full p-4 transition-transform duration-700 ease-out group-hover:scale-[1.03]">
          <ProjectVisual kind={p.visual} />
        </div>
      )}
    </div>
  );
}

function Tech({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
      {items.map((t) => (
        <li key={t} className="rounded-md border border-line px-2 py-0.5 text-xs text-ink-2">
          {t}
        </li>
      ))}
    </ul>
  );
}

export function ProjectCard({ p }: { p: Project }) {
  const meta = [p.category, p.year].filter(Boolean).join(", ");
  return (
    <Dialog>
      <article
        data-spotlight
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.25)]"
      >
        <DialogTrigger className="block w-full text-left" aria-label={`Open details for ${p.title}`}>
          <Visual p={p} className="aspect-[5/3] border-b border-line transition-transform" />
        </DialogTrigger>
        <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
          {meta && <p className="text-[13px] text-muted">{meta}</p>}
          <h3 className="text-lg font-semibold leading-snug tracking-tight text-ink">{p.title}</h3>
          {p.summary && <p className="text-[15px] leading-relaxed text-ink-2">{p.summary}</p>}
          {p.awards.length > 0 && (
            <ul className="space-y-1">
              {p.awards.map((a) => (
                <li key={a} className="flex gap-2 text-sm text-ink">
                  <Award className="mt-0.5 size-4 shrink-0 text-accent-ink" aria-hidden />
                  {a}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-auto space-y-4 pt-2">
            <Tech items={p.tech} />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Links p={p} />
              <DialogTrigger className="group/btn inline-flex items-center gap-1 text-sm font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                Role and contributions
                <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" aria-hidden />
              </DialogTrigger>
            </div>
          </div>
        </div>
      </article>
      <DialogContent>
        <Visual p={p} className="-mx-6 -mt-6 mb-6 aspect-[2/1] border-b border-line sm:rounded-t-2xl" />
        {meta && <p className="text-[13px] text-muted">{meta}</p>}
        <DialogTitle className="mt-1 text-xl font-semibold tracking-tight">{p.title}</DialogTitle>
        <DialogDescription className="mt-2 text-[15px] leading-relaxed text-ink-2">{p.summary}</DialogDescription>
        {p.role && (
          <div className="mt-5">
            <h4 className="text-sm font-semibold">My role</h4>
            <p className="mt-1 text-[15px] text-ink-2">{p.role}</p>
          </div>
        )}
        {p.contributions.length > 0 && (
          <div className="mt-5">
            <h4 className="text-sm font-semibold">What I did</h4>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-ink-2 marker:text-line-strong">
              {p.contributions.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        )}
        {p.awards.length > 0 && (
          <div className="mt-5">
            <h4 className="text-sm font-semibold">Recognition</h4>
            <ul className="mt-2 space-y-1 text-[15px] text-ink-2">
              {p.awards.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-6 space-y-4">
          <Tech items={p.tech} />
          <Links p={p} />
        </div>
        {p.confidential && (
          <p className="mt-6 flex gap-2 rounded-lg bg-sunken p-3 text-[13px] leading-relaxed text-muted">
            <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            Client work under confidentiality. Details are limited to my role, and the image is an illustration rather than a real screen.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
