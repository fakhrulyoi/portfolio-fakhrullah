"use client";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

export function Providers({
  children,
  defaultTheme = "system",
  forcedTheme,
  storageKey = "theme",
  toaster = false,
}: {
  children: React.ReactNode;
  defaultTheme?: string;
  forcedTheme?: string;
  storageKey?: string;
  toaster?: boolean;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={defaultTheme}
      forcedTheme={forcedTheme}
      enableSystem
      disableTransitionOnChange
      storageKey={storageKey}
    >
      {children}
      {toaster && <Toaster position="top-center" richColors closeButton />}
    </ThemeProvider>
  );
}
