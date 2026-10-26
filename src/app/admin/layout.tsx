import type { Metadata } from "next";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | Portfolio dashboard" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers defaultTheme="system" storageKey="admin-theme" toaster>
      <div className="accent-scope">{children}</div>
    </Providers>
  );
}
