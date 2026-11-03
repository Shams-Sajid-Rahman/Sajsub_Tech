export default function LoadingSkeleton({ className = '' }) {
  return <div aria-hidden="true" className={`animate-shimmer rounded bg-[linear-gradient(90deg,#e9eef7_25%,#f5f8fc_50%,#e9eef7_75%)] bg-[length:200%_100%] ${className}`} />;
}

// Shown while a page's code is loading.
export function PageSkeleton() {
  return (
    <div role="status" aria-label="Loading page" className="container-page space-y-4 py-6">
      <LoadingSkeleton className="h-8 w-48" />
      <LoadingSkeleton className="h-4 w-72 max-w-full" />
      <LoadingSkeleton className="h-64 rounded-card" />
    </div>
  );
}
