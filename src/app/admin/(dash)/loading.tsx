export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="space-y-8">
      <div className="space-y-3">
        <div className="skeleton h-8 w-56" />
        <div className="skeleton h-4 w-full max-w-lg" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-24" />
        ))}
      </div>
      <div className="space-y-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-12" />
        ))}
      </div>
    </div>
  );
}
