"use client";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";

const subscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const dark = mounted && resolvedTheme === "dark";

  function toggle(e: React.MouseEvent<HTMLButtonElement>) {
    const next = dark ? "light" : "dark";
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    const motionOk = document.documentElement.classList.contains("motion-ok");
    if (!doc.startViewTransition || !motionOk) {
      setTheme(next);
      return;
    }
    // Circular reveal growing from the button.
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const root = document.documentElement.style;
    root.setProperty("--vx", `${x}px`);
    root.setProperty("--vy", `${y}px`);
    root.setProperty("--vr", `${radius}px`);
    doc.startViewTransition(() => {
      flushSync(() => setTheme(next));
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="press inline-flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-sunken hover:text-ink"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {mounted ? dark ? <Sun className="size-4" /> : <Moon className="size-4" /> : <span className="size-4" />}
    </button>
  );
}
