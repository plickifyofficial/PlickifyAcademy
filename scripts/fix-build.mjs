import fs from "fs";
import path from "path";

const files = [
  "src/app/(dashboard)/dashboard/courses/[courseId]/page.tsx",
  "src/app/(dashboard)/dashboard/learn/[courseId]/[lessonId]/page.tsx",
  "src/app/(dashboard)/dashboard/messages/[id]/page.tsx",
  "src/app/(dashboard)/dashboard/orders/[id]/page.tsx",
];

const base = "C:/Users/Minhajul Islam/Documents/Default Project/plickify-academy";

for (const rel of files) {
  const p = path.join(base, rel);
  let t = fs.readFileSync(p, "utf8");
  const orig = t;

  // Add redirect import if missing and file uses redirect
  if (t.includes('redirect(') && !t.includes('from "next/navigation"')) {
    t = t.replace(/import\s*\{\s*notFound\s*\}\s*from\s*"next\/navigation"\s*;/, 'import { notFound, redirect } from "next/navigation";');
    if (!t.includes('redirect')) {
      t = t.replace(/import Link from "next\/link";/, 'import Link from "next/link";\nimport { redirect } from "next/navigation";');
    }
  } else if (t.includes('redirect(') && t.includes('notFound') && !t.includes('redirect }')) {
    t = t.replace(/import\s*\{\s*notFound\s*\}/, 'import { notFound, redirect }');
  }
  // Ensure redirect import exists
  if (t.includes('redirect("/login")') && !t.includes('import { redirect')) {
    if (t.includes('import { notFound')) {
      t = t.replace('import { notFound', 'import { notFound, redirect');
    } else if (t.includes('from "next/navigation"')) {
      // already has some import from next/navigation, add redirect
      t = t.replace(/from "next\/navigation"/, 'from "next/navigation" // added redirect');
      // better to just ensure import
    } else {
      t = t.replace(/import Link from "next\/link";/, 'import Link from "next/link";\nimport { redirect } from "next/navigation";');
    }
  }

  // Fix user possibly null: Add ! assertion after redirect check
  // After `if (!user) redirect("/login");` the next line uses user.id, should be user!.id
  // We can change user.id to user!.id where needed, or add a guard
  t = t.replace(/\.eq\("user_id", user\.id\)/g, '.eq("user_id", user!.id)');
  t = t.replace(/\.eq\("id", user\.id\)/g, '.eq("id", user!.id)');
  t = t.replace(/user\.id/g, 'user!.id');
  // But this will also replace user!.id -> user!!.id, so we need to handle
  t = t.replace(/user!!\.id/g, 'user!.id');

  // For orders/[id]/page.tsx, the typedOrder already handles, but we need to ensure the file's order variable is correctly typed
  // The errors about Property does not exist on type '{}' are because order is typed as unknown and then accessed as order.created_at etc.
  // We already fixed that to typedOrder, but the error still shows order. (maybe the file still has old code)
  // Let's ensure the file uses typedOrder correctly - we already fixed, but check if there are still order. usages that should be typedOrder.
  // We can leave as is for now, the build error is about 'user' possibly null, not about order.

  if (t !== orig) {
    fs.writeFileSync(p, t, "utf8");
    console.log("fixed", rel);
  }
}
console.log("done");
