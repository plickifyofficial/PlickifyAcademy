import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-zinc-500 sm:flex-row">
        <p>© {new Date().getFullYear()} Plickify Academy. সর্বস্বত্ব সংরক্ষিত।</p>
        <div className="flex gap-6">
          <Link href="/courses" className="hover:text-indigo-600">
            কোর্সসমূহ
          </Link>
          <Link href="/login" className="hover:text-indigo-600">
            লগইন
          </Link>
          <Link href="/signup" className="hover:text-indigo-600">
            সাইন আপ
          </Link>
        </div>
      </div>
    </footer>
  );
}
