export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-zinc-200" />
      <div className="h-4 w-64 rounded bg-zinc-100" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1,2,3].map(i => <div key={i} className="h-40 rounded-2xl bg-white border border-zinc-200" />)}
      </div>
      <div className="h-96 rounded-2xl bg-white border border-zinc-200" />
    </div>
  );
}
