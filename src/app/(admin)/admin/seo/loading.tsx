export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-zinc-200" />
      <div className="h-4 w-64 rounded bg-zinc-100" />
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="h-6 w-32 rounded bg-zinc-200" />
        <div className="mt-4 space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-12 rounded bg-zinc-100" />)}
        </div>
      </div>
    </div>
  );
}
