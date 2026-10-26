/** Re-mounts on each dashboard navigation so pages fade in gently. */
export default function DashTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
