import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://uibjewijsyztyrhrlnkq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpYmpld2lqc3l6dHlyaHJsbmtxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njk1MDE1MCwiZXhwIjoyMTAyNTI2MTUwfQ.JMPxpu0pXTn-P5PcVy88xxlukQaSsq_O6Nda0ozqRUE"
);

// Test if delivery_type and variants columns exist
const { data, error } = await supabase.from("products").select("id, delivery_type, variants").limit(1);
console.log("select with new columns error:", error);
console.log("data:", data);

if (error && error.message.includes("column")) {
  console.log("Columns do not exist, need to create them");
  // Try to create via rpc
  const { error: rpcError } = await supabase.rpc("exec_sql", {
    sql: "ALTER TABLE products ADD COLUMN IF NOT EXISTS delivery_type text DEFAULT 'download'; ALTER TABLE products ADD COLUMN IF NOT EXISTS variants jsonb DEFAULT '[]'::jsonb;"
  });
  console.log("rpc exec_sql error:", rpcError);
  
  // Try alternative: try to create via direct SQL using fetch to management API
  if (rpcError) {
    console.log("Trying management API...");
    const res = await fetch("https://api.supabase.com/v1/projects/uibjewijsyztyrhrlnkq/database/query", {
      method: "POST",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpYmpld2lqc3l6dHlyaHJsbmtxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njk1MDE1MCwiZXhwIjoyMTAyNTI2MTUwfQ.JMPxpu0pXTn-P5PcVy88xxlukQaSsq_O6Nda0ozqRUE",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: "ALTER TABLE products ADD COLUMN IF NOT EXISTS delivery_type text DEFAULT 'download'; ALTER TABLE products ADD COLUMN IF NOT EXISTS variants jsonb DEFAULT '[]'::jsonb;"
      })
    });
    const text = await res.text();
    console.log("management API status:", res.status);
    console.log("management API response:", text);
  }
} else {
  console.log("Columns exist, no need to create");
}
