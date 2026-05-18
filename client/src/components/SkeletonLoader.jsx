export function SkeletonCard({ className = '' }) {
  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="skeleton mb-3 h-3 w-24" />
      <div className="skeleton mb-2 h-8 w-40" />
      <div className="skeleton h-2 w-32" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="skeleton h-10 w-10 rounded-full" />
      <div className="flex-1">
        <div className="skeleton mb-1 h-3 w-1/3" />
        <div className="skeleton h-2 w-1/5" />
      </div>
      <div className="skeleton h-4 w-16" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="glass-card p-6">
      <div className="skeleton mb-4 h-3 w-32" />
      <div className="skeleton h-56 w-full" />
    </div>
  );
}
