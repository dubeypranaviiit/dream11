export default function ExplanationSkeleton() {
  return (
    <div className="animate-pulse space-y-2.5 py-1">
      <div className="flex items-center gap-2">
        <div className="h-5 w-24 bg-slate-800 rounded-full" />
        <div className="h-5 w-32 bg-slate-800 rounded-full" />
      </div>
      <div className="h-4 bg-slate-800 rounded w-full" />
      <div className="h-4 bg-slate-800/80 rounded w-4/5" />
    </div>
  );
}
