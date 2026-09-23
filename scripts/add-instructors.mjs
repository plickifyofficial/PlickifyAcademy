import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://uibjewijsyztyrhrlnkq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpYmpld2lqc3l6dHlyaHJsbmtxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njk1MDE1MCwiZXhwIjoyMTAyNTI2MTUwfQ.JMPxpu0pXTn-P5PcVy88xxlukQaSsq_O6Nda0ozqRUE"
);

const instructors = [
  { name: "Anika Rahman", slug: "anika-rahman", role: "UI/UX Instructor", bio: "5+ years in product design, helped 300+ students build portfolios.", initials: "AR", color: "bg-pink-500", expertise: ["Figma", "UI/UX", "Design Systems"], facebook: "#", youtube: "#", linkedin: "#", instagram: "#", sort_order: 3 },
  { name: "Rahim Uddin", slug: "rahim-uddin", role: "Freelancing Mentor", bio: "Top-rated on Upwork & Fiverr, 1000+ projects delivered.", initials: "RU", color: "bg-blue-600", expertise: ["Upwork", "Fiverr", "Client Communication"], facebook: "#", youtube: "#", linkedin: "#", instagram: "#", sort_order: 4 },
  { name: "Fatima Akter", slug: "fatima-akter", role: "Content Strategist", bio: "Content creator and AI workflow expert, 4 years at agencies.", initials: "FA", color: "bg-violet-600", expertise: ["Content", "AI Writing", "Strategy"], facebook: "#", youtube: "#", linkedin: "#", instagram: "#", sort_order: 5 },
  { name: "Tanvir Hasan", slug: "tanvir-hasan", role: "Web Development Instructor", bio: "MERN stack developer, built 50+ client websites.", initials: "TH", color: "bg-emerald-600", expertise: ["React", "Next.js", "Node.js"], facebook: "#", youtube: "#", linkedin: "#", instagram: "#", sort_order: 6 },
  { name: "Nusrat Jahan", slug: "nusrat-jahan", role: "Digital Marketing Trainer", bio: "Digital marketer, ran campaigns for 20+ brands.", initials: "NJ", color: "bg-amber-500", expertise: ["Facebook Ads", "SEO", "Branding"], facebook: "#", youtube: "#", linkedin: "#", instagram: "#", sort_order: 7 },
  { name: "Khalid Mahmud", slug: "khalid-mahmud", role: "Video Editing Mentor", bio: "Video editor for YouTubers and agencies, Premiere & After Effects.", initials: "KM", color: "bg-cyan-600", expertise: ["Premiere Pro", "After Effects", "Storytelling"], facebook: "#", youtube: "#", linkedin: "#", instagram: "#", sort_order: 8 },
  { name: "Sadia Islam", slug: "sadia-islam", role: "AI Tools Trainer", bio: "AI productivity consultant, trained 1000+ professionals.", initials: "SI", color: "bg-fuchsia-600", expertise: ["ChatGPT", "Midjourney", "Automation"], facebook: "#", youtube: "#", linkedin: "#", instagram: "#", sort_order: 9 },
  { name: "Arif Khan", slug: "arif-khan", role: "Graphics Mentor", bio: "Brand designer, 6 years in creative industry.", initials: "AK", color: "bg-slate-700", expertise: ["Branding", "Illustrator", "Canva"], facebook: "#", youtube: "#", linkedin: "#", instagram: "#", sort_order: 10 },
  { name: "Mim Akter", slug: "mim-akter", role: "Freelancing Coach (Female)", bio: "Female freelancer, zero to hero journey, now mentoring women.", initials: "MA", color: "bg-rose-500", expertise: ["Freelancing", "Women Empowerment", "Marketplace"], facebook: "#", youtube: "#", linkedin: "#", instagram: "#", sort_order: 11 },
  { name: "Imran Hossain", slug: "imran-hossain", role: "SEO & Marketing Lead", bio: "SEO specialist, ranked 100+ sites on Google.", initials: "IH", color: "bg-indigo-600", expertise: ["SEO", "Content Marketing", "Analytics"], facebook: "#", youtube: "#", linkedin: "#", instagram: "#", sort_order: 12 },
];

for (const inst of instructors) {
  const { error } = await supabase.from("instructors").upsert({
    ...inst,
    photo: null,
    is_featured: false,
    is_published: true,
  }, { onConflict: "slug" });
  if (error) console.error("fail", inst.slug, error.message);
  else console.log("added", inst.slug);
}
console.log("done");
