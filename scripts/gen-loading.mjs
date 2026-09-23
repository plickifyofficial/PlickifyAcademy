import fs from "fs";
import path from "path";

const dashboardLoading = `export default function Loading() {
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
`;

const adminLoading = `export default function Loading() {
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
`;

const base = "C:/Users/Minhajul Islam/Documents/Default Project/plickify-academy";

const dashboardDirs = [
  "src/app/(dashboard)/dashboard/courses",
  "src/app/(dashboard)/dashboard/courses/[courseId]",
  "src/app/(dashboard)/dashboard/courses/[courseId]/lessons/[lessonId]",
  "src/app/(dashboard)/dashboard/learn/[courseId]/[lessonId]",
  "src/app/(dashboard)/dashboard/assignments",
  "src/app/(dashboard)/dashboard/certificates",
  "src/app/(dashboard)/dashboard/downloads",
  "src/app/(dashboard)/dashboard/live-classes",
  "src/app/(dashboard)/dashboard/messages",
  "src/app/(dashboard)/dashboard/messages/[id]",
  "src/app/(dashboard)/dashboard/my-products",
  "src/app/(dashboard)/dashboard/notifications",
  "src/app/(dashboard)/dashboard/orders",
  "src/app/(dashboard)/dashboard/orders/[id]",
  "src/app/(dashboard)/dashboard/profile",
  "src/app/(dashboard)/dashboard/quizzes",
  "src/app/(dashboard)/dashboard/search",
  "src/app/(dashboard)/dashboard/settings",
  "src/app/(dashboard)/dashboard/wishlist",
];

const adminBase = "src/app/(admin)/admin";
const adminDirs = fs.readdirSync(path.join(base, adminBase), { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => path.join(adminBase, d.name));

// also check nested admin like blog/authors etc.
const nestedAdmin = [];
for (const d of fs.readdirSync(path.join(base, "src/app/(admin)/admin"), { withFileTypes: true })) {
  if (d.isDirectory()) {
    const sub = path.join(base, "src/app/(admin)/admin", d.name);
    for (const sd of fs.readdirSync(sub, { withFileTypes: true })) {
      if (sd.isDirectory()) nestedAdmin.push(path.join("src/app/(admin)/admin", d.name, sd.name));
    }
  }
}

let count = 0;
for (const dir of dashboardDirs) {
  const p = path.join(base, dir, "loading.tsx");
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, dashboardLoading, "utf8");
    count++;
    console.log("wrote", dir + "/loading.tsx");
  }
}
for (const dir of [...adminDirs, ...nestedAdmin]) {
  const p = path.join(base, dir, "loading.tsx");
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, adminLoading, "utf8");
    count++;
    console.log("wrote", dir + "/loading.tsx");
  }
}
// also for admin blog nested like posts/[id]/edit etc. - find all page.tsx dirs under admin
import { execSync } from "child_process";
try {
  const out = execSync(`powershell -Command "Get-ChildItem -Path '${path.join(base, "src/app/(admin)")}' -Recurse -Filter 'page.tsx' | Select-Object -ExpandProperty DirectoryName"`, { encoding: "utf8" });
  const dirs = [...new Set(out.split("\n").map(s => s.trim()).filter(Boolean))];
  for (const dir of dirs) {
    const rel = path.relative(base, dir);
    const p = path.join(dir, "loading.tsx");
    if (!fs.existsSync(p)) {
      fs.writeFileSync(p, adminLoading, "utf8");
      count++;
      console.log("wrote", rel + "/loading.tsx");
    }
  }
} catch {}

console.log("total", count);
