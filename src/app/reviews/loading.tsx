export default function ReviewsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-12">
      <div className="space-y-3">
        <div className="bg-muted h-4 w-24 animate-pulse rounded-full" />
        <div className="bg-muted h-9 w-2/3 animate-pulse rounded-full" />
        <div className="bg-muted/80 h-4 w-1/2 animate-pulse rounded-full" />
      </div>

      <div className="border-border bg-card flex flex-col gap-3 rounded-xl border p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="bg-muted/80 h-5 w-48 animate-pulse rounded-full" />
          <div className="bg-muted/70 h-10 w-64 animate-pulse rounded-lg" />
        </div>
        <div className="bg-muted/60 h-10 w-full animate-pulse rounded-lg" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-muted/60 h-44 animate-pulse rounded-xl" />
        ))}
      </div>
    </div>
  );
}
