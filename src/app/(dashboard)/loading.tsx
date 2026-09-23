export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-32 rounded-2xl bg-zinc-200" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-white border border-zinc-200 p-5">
            <div className="h-10 w-10 rounded-xl bg-zinc-200" />
            <div className="mt-3 h-4 w-20 rounded bg-zinc-200" />
          </div>
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-white border border-zinc-200" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-72 rounded-2xl bg-white border border-zinc-200" />
        ))}
      </div>
    </div>
  );
}