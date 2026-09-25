import fs from "fs";
import path from "path";

const base = "C:/Users/Minhajul Islam/Documents/Default Project/plickify-academy/src/app/(dashboard)";
const files = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === "page.tsx") files.push(p);
  }
}
walk(base);
let count = 0;
for (const f of files) {
  let t = fs.readFileSync(f, "utf8");
  const orig = t;
  t = t.replace(/const\s*\{\s*data:\s*\{\s*user\s*\}\s*,?\s*\}\s*=\s*await\s+supabase\.auth\.getUser\(\)\s*;/g, "const { data: { session } } = await supabase.auth.getSession();\n  const user = session?.user ?? null;");
  t = t.replace(/if\s*\(!user\)\s*notFound\(\)\s*;/g, 'if (!user) redirect("/login");');
  if (t !== orig) {
    fs.writeFileSync(f, t, "utf8");
    count++;
    console.log("fixed", path.relative(base, f));
  }
}
console.log("total", count);
