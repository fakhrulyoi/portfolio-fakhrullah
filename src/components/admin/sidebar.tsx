"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Briefcase, FileText, FileCheck2, FolderKanban, GraduationCap, Home, Inbox, KeyRound, LayoutGrid, Menu, Settings, User, UserRound, X, ExternalLink, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const GROUPS = [
  { title: "", items: [{ href: "/admin", label: "Overview", icon: Home }] },
  {
    title: "Content",
    items: [
      { href: "/admin/profile", label: "Profile & home", icon: User },
      { href: "/admin/about", label: "About", icon: UserRound },
      { href: "/admin/experience", label: "Experience", icon: Briefcase },
      { href: "/admin/projects", label: "Projects", icon: FolderKanban },
      { href: "/admin/skills", label: "Skills", icon: LayoutGrid },
      { href: "/admin/education", label: "Education", icon: GraduationCap },
    ],
  },
  {
    title: "Resume",
    items: [
      { href: "/admin/resume", label: "Resume file", icon: FileText },
      { href: "/admin/ats-resume", label: "ATS resume builder", icon: FileCheck2 },
    ],
  },
  {
    title: "Site",
    items: [
      { href: "/admin/messages", label: "Messages", icon: Inbox },
      { href: "/admin/settings", label: "Site settings", icon: Settings },
      { href: "/admin/account", label: "Account", icon: KeyRound },
    ],
  },
];

export function Sidebar({ email, unread }: { email: string; unread: number }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const nav = (
    <nav aria-label="Dashboard" className="flex flex-col gap-5">
      {GROUPS.map((g) => (
        <div key={g.title || "top"}>
          {g.title && <p className="mb-1.5 px-3 text-[11px] font-medium text-muted">{g.title}</p>}
          <ul className="flex flex-col gap-0.5">
            {g.items.map(({ href, label, icon: Icon }) => {
              const active = href === "/admin" ? path === "/admin" : path.startsWith(href) && !(href === "/admin/resume" && path.startsWith("/admin/resume-"));
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      active ? "bg-surface font-medium text-ink shadow-[0_0_0_1px_var(--line)]" : "text-muted hover:bg-surface/70 hover:text-ink",
                    )}
                  >
                    {active && <span aria-hidden className="absolute -left-4 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-accent lg:-left-4" />}
                    <Icon className={cn("size-4 transition-colors", active ? "text-accent-ink" : "group-hover:text-ink")} aria-hidden />
                    {label}
                    {href === "/admin/messages" && unread > 0 && (
                      <span className="ml-auto rounded-full bg-accent px-1.5 text-[11px] font-medium text-accent-fg">{unread}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
  const footer = (
    <div className="mt-auto space-y-1 border-t border-line pt-4">
      <a href="/" target="_blank" rel="noopener" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface hover:text-ink">
        <ExternalLink className="size-4" aria-hidden /> View live site
      </a>
      <form action="/admin/signout" method="post">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface hover:text-ink">
          <LogOut className="size-4" aria-hidden /> Sign out
        </button>
      </form>
      <p className="truncate px-3 pt-2 text-[12px] text-muted">{email}</p>
    </div>
  );
  return (
    <>
      <div className="flex items-center justify-between border-b border-line px-4 py-3 lg:hidden">
        <span className="text-sm font-semibold">Portfolio dashboard</span>
        <button type="button" className="rounded-lg p-2 hover:bg-surface" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && <div className="flex flex-col gap-4 border-b border-line bg-sunken p-4 lg:hidden">{nav}{footer}</div>}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-6 overflow-y-auto border-r border-line bg-sunken p-4 lg:flex">
        <a href="/admin" className="flex items-center gap-2.5 px-3 pt-2 text-sm font-semibold">
          <span aria-hidden className="flex size-6 items-center justify-center rounded-md bg-accent text-[11px] font-bold text-accent-fg">P</span>
          Portfolio dashboard
        </a>
        {nav}
        {footer}
      </aside>
    </>
  );
}
