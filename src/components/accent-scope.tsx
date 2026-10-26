import { contrastText } from "@/lib/format";

export function AccentScope({ accent, children }: { accent: string; children: React.ReactNode }) {
  const style = { "--accent": accent, "--accent-fg": contrastText(accent) } as React.CSSProperties;
  return (
    <div className="accent-scope" style={style}>
      {children}
    </div>
  );
}
