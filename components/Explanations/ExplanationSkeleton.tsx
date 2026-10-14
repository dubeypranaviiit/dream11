export default function ExplanationSkeleton() {
  return (
    <div className="animate-pulse space-y-2.5 py-1">
      <div className="flex items-center gap-2">
        <div className="h-5 w-24 bg-[#151F32] rounded-full border border-[#243047]" />
        <div className="h-5 w-32 bg-[#151F32] rounded-full border border-[#243047]" />
      </div>
      <div className="h-4 bg-[#151F32] rounded w-full border border-[#243047]" />
      <div className="h-4 bg-[#151F32]/80 rounded w-4/5 border border-[#243047]" />
    </div>
  );
}
