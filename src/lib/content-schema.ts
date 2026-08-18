export type ScalarField =
  | { kind: "text"; key: string; label: string; hint?: string }
  | { kind: "textarea"; key: string; label: string; hint?: string }
  | { kind: "url"; key: string; label: string; hint?: string }
  | { kind: "image"; key: string; label: string; hint?: string }
  | { kind: "number"; key: string; label: string; hint?: string }
  | { kind: "datetime"; key: string; label: string; hint?: string }
  | { kind: "icon"; key: string; label: string; hint?: string };

export type FieldDef =
  | ScalarField
  | {
      kind: "stringlist";
      key: string;
      label: string;
      hint?: string;
      itemLabel?: string;
    }
  | {
      kind: "list";
      key: string;
      label: string;
      itemLabel: string;
      hint?: string;
      fields: FieldDef[];
    };

export type SectionDef = {
  key: string;
  title: string;
  description?: string;
  defaults: Record<string, unknown>;
  fields: FieldDef[];
};

export const heroDefaults = {
  badge: "AI Skills · Freelancing · Digital Income",
  titleA: "AI দিয়ে আপনার",
  titleHighlight: "ডিজিটাল ক্যারিয়ার",
  titleB: "শুরু করুন",
  subtitle:
    "AI Skills, Freelancing, Passive Income এবং Real-World Projects শেখার মাধ্যমে আপনার ডিজিটাল ক্যারিয়ার গড়ে তুলুন।",
  primaryBtn: "এখনই শুরু করুন",
  primaryBtnLink: "/signup",
  secondaryBtn: "কোর্স দেখুন",
  secondaryBtnLink: "/courses",
  rating: "4.9/5",
  reviews: "500+ Reviews",
  avatars: [
    { initials: "RH", color: "bg-blue-500" },
    { initials: "NJ", color: "bg-violet-500" },
    { initials: "MH", color: "bg-emerald-500" },
    { initials: "SA", color: "bg-amber-500" },
  ],
};
export type HeroContent = typeof heroDefaults;

export const statsDefaults = {
  items: [
    { icon: "fa-solid fa-user-group", value: "500+", label: "Happy Students" },
    { icon: "fa-solid fa-book-open", value: "50+", label: "Premium Resources" },
    { icon: "fa-solid fa-play", value: "10+", label: "Expert Courses" },
    { icon: "fa-solid fa-trophy", value: "95%", label: "Satisfaction Rate" },
  ],
};
export type StatsContent = typeof statsDefaults;

export const toolsDefaults = {
  label: "We work with the tools you use",
  tools: [
    { icon: "fa-solid fa-comment-dots", name: "ChatGPT" },
    { icon: "fa-solid fa-palette", name: "Canva" },
    { icon: "fa-solid fa-brain", name: "Google AI" },
    { icon: "fa-solid fa-wand-magic-sparkles", name: "Midjourney" },
    { icon: "fa-solid fa-gem", name: "Gemini" },
    { icon: "fa-solid fa-robot", name: "Claude" },
  ],
};
export type ToolsContent = typeof toolsDefaults;

export const skillsDefaults = {
  eyebrow: "What You Will Learn",
  title: "আপনার ভবিষ্যতের জন্য প্রয়োজনীয় সব স্কিল",
  items: [
    { icon: "fa-solid fa-brain", title: "AI Productivity", desc: "AI tools দিয়ে smart work করার skill।" },
    { icon: "fa-solid fa-briefcase", title: "Freelancing", desc: "Online marketplace এবং client work শেখা।" },
    { icon: "fa-solid fa-chart-line", title: "Passive Income", desc: "Digital assets এবং online income strategy।" },
    { icon: "fa-solid fa-palette", title: "Graphic Design", desc: "AI-powered modern graphic design।" },
    { icon: "fa-solid fa-bullhorn", title: "Digital Marketing", desc: "Marketing, ads এবং audience growth।" },
    { icon: "fa-solid fa-globe", title: "Web & Tech", desc: "Modern web এবং digital technology।" },
  ],
};
export type SkillsContent = typeof skillsDefaults;

export const featuredDefaults = {
  badge: "BEST SELLER",
  tagline: "FEATURED COURSE",
  cardTop1: "AI Income",
  cardTop2: "Mastery",
  cardYear: "2026",
  title: "AI Income Mastery 2026",
  description: "AI দিয়ে smart income তৈরি করার জন্য complete practical course।",
  buttonText: "এখনই ভর্তি করুন",
  buttonLink: "/signup",
  features: [
    "40+ ভিডিও লেসন",
    "লাইভ ক্লাস",
    "সাপ্তাহিক Q&A",
    "প্র্যাকটিক্যাল অ্যাসাইনমেন্ট",
    "Premium Resources",
    "Certificate",
  ],
  info: [
    { icon: "fa-solid fa-signal", label: "Level", value: "Beginner to Advanced" },
    { icon: "fa-solid fa-language", label: "Language", value: "বাংলা" },
    { icon: "fa-solid fa-user-group", label: "Students", value: "500+ Enrolled" },
    { icon: "fa-solid fa-clock", label: "Duration", value: "10+ Hours" },
    { icon: "fa-solid fa-certificate", label: "Certificate", value: "Yes, Verifiable" },
  ],
};
export type FeaturedContent = typeof featuredDefaults;

export const whyDefaults = {
  eyebrow: "Why Plickify Academy",
  title: "কেন আমাদের সাথে শিখবেন?",
  items: [
    { icon: "fa-solid fa-graduation-cap", title: "Real Skills", desc: "Practical এবং market-ready skill শেখানো হবে।" },
    { icon: "fa-solid fa-rocket", title: "Real Projects", desc: "বাস্তব project-এর মাধ্যমে experience তৈরি করুন।" },
    { icon: "fa-solid fa-dollar-sign", title: "Real Income", desc: "Skill ব্যবহার করে online income-এর পথে এগিয়ে যান।" },
  ],
};
export type WhyContent = typeof whyDefaults;

export const processDefaults = {
  eyebrow: "Learning Process",
  title: "আমাদের শেখার প্রসেস",
  steps: [
    { icon: "fa-solid fa-user-plus", title: "Enroll", desc: "কোর্সে ভর্তি হন" },
    { icon: "fa-solid fa-book-open-reader", title: "Learn", desc: "ক্লাস এবং resources ব্যবহার করুন" },
    { icon: "fa-solid fa-keyboard", title: "Practice", desc: "Homework এবং practical কাজ করুন" },
    { icon: "fa-solid fa-diagram-project", title: "Build Portfolio", desc: "Real project দিয়ে portfolio তৈরি করুন" },
    { icon: "fa-solid fa-sack-dollar", title: "Start Earning", desc: "Freelancing/online income শুরু করুন" },
  ],
};
export type ProcessContent = typeof processDefaults;

export const liveBatchDefaults = {
  eyebrow: "Live Batch",
  title: "Batch 01 ভর্তি চলছে!",
  checks: ["লাইভ ক্লাস", "ক্লাস রেকর্ডিং", "প্র্যাকটিক্যাল সাপোর্ট"],
  deadline: "2026-10-01T00:00:00+06:00",
  seatsFilled: 28,
  seatsTotal: 100,
  seatLabel: "Seat filled",
  buttonText: "এখনই ভর্তি করুন",
  buttonLink: "/signup",
};
export type LiveBatchContent = typeof liveBatchDefaults;

export const productsDefaults = {
  eyebrow: "Learning Products",
  title: "প্রিমিয়াম ডিজিটাল রিসোর্স",
  viewAllText: "সব রিসোর্স দেখুন",
  viewAllLink: "/#contact",
  items: [
    { name: "AI Prompt Pack", price: "৳490", oldPrice: "", tag: "PROMPTS", icon: "fa-solid fa-bolt", gradient: "from-blue-600 to-indigo-600" },
    { name: "Canva Templates", price: "৳690", oldPrice: "৳990", tag: "DESIGN", icon: "fa-solid fa-palette", gradient: "from-violet-600 to-fuchsia-600" },
    { name: "AI Toolkit", price: "৳990", oldPrice: "", tag: "TOOLS", icon: "fa-solid fa-toolbox", gradient: "from-cyan-600 to-blue-700" },
    { name: "Freelance Guide eBook", price: "৳390", oldPrice: "৳590", tag: "EBOOK", icon: "fa-solid fa-book", gradient: "from-emerald-600 to-teal-600" },
  ],
};
export type ProductsContent = typeof productsDefaults;

export const testimonialsDefaults = {
  eyebrow: "Learner Success",
  title: "আমাদের শিক্ষার্থীদের কথা",
  items: [
    {
      name: "Rafiq Hasan",
      role: "Freelancer",
      quote:
        "AI Income Mastery কোর্সটা করার পর প্রথম মাসেই আমার ফ্রিল্যান্সিং ইনকাম শুরু হয়েছে। কোর্সের প্র্যাকটিক্যাল ভিডিওগুলো অসাধারণ।",
      color: "bg-blue-500",
      initials: "RH",
    },
    {
      name: "Nusrat Jahan",
      role: "Graphic Designer",
      quote:
        "Canva আর AI tools শেখার পরে এখন আমি ডিজাইনের কাজ সরাসরি ক্লায়েন্ট থেকে পাই। প্লিকিফাইয়ের সাপোর্ট সত্যিই দারুণ।",
      color: "bg-violet-500",
      initials: "NJ",
    },
    {
      name: "Mahadi Hasan",
      role: "Digital Marketer",
      quote:
        "ডিজিটাল মার্কেটিং কোর্সটা আমার ক্যারিয়ার বদলে দিয়েছে। লাইভ ক্লাস আর Q&A সেশনগুলো খুবই সহায়ক ছিল।",
      color: "bg-emerald-500",
      initials: "MH",
    },
  ],
};
export type TestimonialsContent = typeof testimonialsDefaults;

export const faqDefaults = {
  title: "সাধারণ কিছু প্রশ্ন",
  items: [
    {
      q: "কোর্স কিভাবে কাজ করবে?",
      a: "কোর্স ভর্তির পরই সব ভিডিও লেসন আপনার ড্যাশবোর্ডে আনলক হয়ে যাবে। আপনি নিজের গতিতে লেসনগুলো দেখতে পারবেন এবং প্র্যাকটিক্যাল কাজ করতে পারবেন।",
    },
    {
      q: "কোর্স কি মোবাইল থেকে করা যাবে?",
      a: "হ্যাঁ, আমাদের প্ল্যাটফর্ম সম্পূর্ণ মোবাইল-ফ্রেন্ডলি। যেকোনো স্মার্টফোন বা ট্যাবলেট থেকেই ভিডিও দেখতে ও প্র্যাকটিস করতে পারবেন।",
    },
    {
      q: "সার্টিফিকেট কি পাওয়া যাবে?",
      a: "হ্যাঁ, কোর্স সম্পন্ন করলে Verifiable Certificate পাবেন। সার্টিফিকেটে আপনার নাম, কোর্সের নাম এবং সফলভাবে সম্পন্নের তারিখ থাকবে।",
    },
    {
      q: "লাইভ ক্লাস কবে?",
      a: "লাইভ ক্লাস সাপ্তাহিকভাবে নির্ধারিত সময়ে হয়। ভর্তি হওয়ার পর ক্লাসের সময়সূচি আপনার ড্যাশবোর্ডে পেয়ে যাবেন। মিস করলে রেকর্ডিংও পাবেন।",
    },
    {
      q: "পেমেন্ট কিভাবে করবো?",
      a: "bKash বা Nagad-এ পেমেন্ট করে TrxID জমা দিলেই আমাদের টিম ভেরিফাই করে এনরোল করে দেবে। সাধারণত ৫-৩০ মিনিটের মধ্যে এনরোল কনফার্ম হয়।",
    },
    {
      q: "কোর্সে কিভাবে ভর্তি হবো?",
      a: "কোর্স পেজ থেকে 'এখনই ভর্তি করুন' বাটনে ক্লিক করুন, একাউন্ট তৈরি করে পেমেন্ট সম্পন্ন করলেই ভর্তি সম্পন্ন। প্রয়োজনে আমাদের সাপোর্ট টিম সাহায্য করবে।",
    },
  ],
};
export type FaqContent = typeof faqDefaults;

export const ctaDefaults = {
  eyebrow: "Ready To Start?",
  title: "আমাদের AI Journey আজই শুরু করুন!",
  subtitle: "আজ থেকেই নতুন skill শেখা এবং digital career building শুরু করুন।",
  icon: "fa-brands fa-telegram",
  buttonText: "এখনই শুরু করুন",
  buttonLink: "/signup",
};
export type CtaContent = typeof ctaDefaults;

export const navDefaults = {
  links: [
    { label: "Home", href: "/" },
    { label: "Courses", href: "/courses" },
    { label: "Live Batch", href: "/#live-batch" },
    { label: "Digital Products", href: "/#products" },
    { label: "About", href: "/#why" },
    { label: "Contact", href: "/#contact" },
  ],
};
export type NavContent = typeof navDefaults;

export const footerDefaults = {
  about:
    "AI, Freelancing এবং Digital Skills শেখার জন্য একটি practical learning platform।",
  email: "hello@plickifyacademy.com",
  phone: "+880 1234-567890",
  address: "Dhaka, Bangladesh",
  quickLinksTitle: "Quick Links",
  quickLinks: [
    { label: "Courses", href: "/courses" },
    { label: "Live Batch", href: "/#live-batch" },
    { label: "Digital Products", href: "/#products" },
    { label: "Become Instructor", href: "/#contact" },
    { label: "Blog", href: "/#contact" },
  ],
  supportTitle: "Support",
  supportLinks: [
    { label: "FAQ", href: "/#faq" },
    { label: "Contact Us", href: "/#contact" },
    { label: "Terms & Conditions", href: "/#contact" },
    { label: "Privacy Policy", href: "/#contact" },
    { label: "Refund Policy", href: "/#contact" },
  ],
  socials: [
    { icon: "fa-brands fa-facebook-f", href: "#" },
    { icon: "fa-brands fa-youtube", href: "#" },
    { icon: "fa-brands fa-linkedin-in", href: "#" },
    { icon: "fa-brands fa-instagram", href: "#" },
  ],
  newsletterTitle: "সর্বশেষ আপডেট পেতে সাবস্ক্রাইব করুন",
  newsletterPlaceholder: "আপনার ইমেইল",
  newsletterButton: "সাবস্ক্রাইব",
  copyright: "© 2026 Plickify Academy. All rights reserved.",
  paymentBadges: ["VISA", "MC", "BKASH", "NAGAD"],
};
export type FooterContent = typeof footerDefaults;

const iconFields = (
  key: string,
  label: string,
  hint = "FontAwesome icon class, যেমন fa-solid fa-brain",
): FieldDef => ({ kind: "icon", key, label, hint });

export const homeSections: SectionDef[] = [
  {
    key: "home.hero",
    title: "হিরো সেকশন",
    description: "পেজের প্রথম বড় সেকশন — ব্যাজ, টাইটেল, সাবটাইটেল ও বাটন।",
    defaults: heroDefaults,
    fields: [
      { kind: "text", key: "badge", label: "ব্যাজ টেক্সট" },
      { kind: "text", key: "titleA", label: "টাইটেল (১ম অংশ)" },
      { kind: "text", key: "titleHighlight", label: "টাইটেল হাইলাইট (রঙিন)" },
      { kind: "text", key: "titleB", label: "টাইটেল (শেষ অংশ)" },
      { kind: "textarea", key: "subtitle", label: "সাবটাইটেল" },
      { kind: "text", key: "primaryBtn", label: "প্রাইমারি বাটন টেক্সট" },
      { kind: "url", key: "primaryBtnLink", label: "প্রাইমারি বাটন লিংক" },
      { kind: "text", key: "secondaryBtn", label: "সেকেন্ডারি বাটন টেক্সট" },
      { kind: "url", key: "secondaryBtnLink", label: "সেকেন্ডারি বাটন লিংক" },
      { kind: "text", key: "rating", label: "রেটিং" },
      { kind: "text", key: "reviews", label: "রিভিউ টেক্সট" },
      {
        kind: "list",
        key: "avatars",
        label: "প্রোফাইল অ্যাভাটার",
        itemLabel: "অ্যাভাটার",
        fields: [
          { kind: "text", key: "initials", label: "ইনিশিয়াল (যেমন RH)" },
          {
            kind: "text",
            key: "color",
            label: "রঙ (Tailwind class)",
            hint: "যেমন bg-blue-500",
          },
        ],
      },
    ],
  },
  {
    key: "home.stats",
    title: "স্ট্যাটস সেকশন",
    description: "রঙিন ব্যানারে ৪টি সংখ্যা/পরিসংখ্যান।",
    defaults: statsDefaults,
    fields: [
      {
        kind: "list",
        key: "items",
        label: "পরিসংখ্যান",
        itemLabel: "স্ট্যাট",
        fields: [
          iconFields("icon", "আইকন"),
          { kind: "text", key: "value", label: "মান (যেমন 500+)" },
          { kind: "text", key: "label", label: "লেবেল" },
        ],
      },
    ],
  },
  {
    key: "home.tools",
    title: "টুলস বার",
    description: "যে টুলস নিয়ে কাজ হয় সেগুলোর লোগো-লিস্ট।",
    defaults: toolsDefaults,
    fields: [
      { kind: "text", key: "label", label: "লেবেল" },
      {
        kind: "list",
        key: "tools",
        label: "টুলস",
        itemLabel: "টুল",
        fields: [
          iconFields("icon", "আইকন"),
          { kind: "text", key: "name", label: "নাম" },
        ],
      },
    ],
  },
  {
    key: "home.skills",
    title: "স্কিল সেকশন",
    description: "যে স্কিলগুলো শেখানো হয় তার ৬টি কার্ড।",
    defaults: skillsDefaults,
    fields: [
      { kind: "text", key: "eyebrow", label: "আপার লেবেল" },
      { kind: "text", key: "title", label: "শিরোনাম" },
      {
        kind: "list",
        key: "items",
        label: "স্কিল কার্ড",
        itemLabel: "কার্ড",
        fields: [
          iconFields("icon", "আইকন"),
          { kind: "text", key: "title", label: "শিরোনাম" },
          { kind: "text", key: "desc", label: "বিবরণ" },
        ],
      },
    ],
  },
  {
    key: "home.featured",
    title: "ফিচার্ড কোর্স",
    description: "বেস্ট-সেলার কোর্সের বড় ব্লক।",
    defaults: featuredDefaults,
    fields: [
      { kind: "text", key: "badge", label: "ব্যাজ" },
      { kind: "text", key: "tagline", label: "আপার লেবেল" },
      { kind: "text", key: "cardTop1", label: "কার্ড টেক্সট ১" },
      { kind: "text", key: "cardTop2", label: "কার্ড টেক্সট ২" },
      { kind: "text", key: "cardYear", label: "কার্ড সাল" },
      { kind: "text", key: "title", label: "কোর্স টাইটেল" },
      { kind: "textarea", key: "description", label: "বিবরণ" },
      { kind: "text", key: "buttonText", label: "বাটন টেক্সট" },
      { kind: "url", key: "buttonLink", label: "বাটন লিংক" },
      {
        kind: "stringlist",
        key: "features",
        label: "ফিচার লিস্ট",
        itemLabel: "ফিচার",
      },
      {
        kind: "list",
        key: "info",
        label: "ইনফো রো",
        itemLabel: "রো",
        fields: [
          iconFields("icon", "আইকন"),
          { kind: "text", key: "label", label: "লেবেল" },
          { kind: "text", key: "value", label: "মান" },
        ],
      },
    ],
  },
  {
    key: "home.why",
    title: "কেন আমরা (Why Us)",
    description: "৩টি পয়েন্টে আমাদের পার্থক্য।",
    defaults: whyDefaults,
    fields: [
      { kind: "text", key: "eyebrow", label: "আপার লেবেল" },
      { kind: "text", key: "title", label: "শিরোনাম" },
      {
        kind: "list",
        key: "items",
        label: "পয়েন্ট",
        itemLabel: "পয়েন্ট",
        fields: [
          iconFields("icon", "আইকন"),
          { kind: "text", key: "title", label: "শিরোনাম" },
          { kind: "text", key: "desc", label: "বিবরণ" },
        ],
      },
    ],
  },
  {
    key: "home.process",
    title: "লার্নিং প্রসেস",
    description: "৫ ধাপের শেখার যাত্রা।",
    defaults: processDefaults,
    fields: [
      { kind: "text", key: "eyebrow", label: "আপার লেবেল" },
      { kind: "text", key: "title", label: "শিরোনাম" },
      {
        kind: "list",
        key: "steps",
        label: "ধাপ",
        itemLabel: "ধাপ",
        fields: [
          iconFields("icon", "আইকন"),
          { kind: "text", key: "title", label: "শিরোনাম" },
          { kind: "text", key: "desc", label: "বিবরণ" },
        ],
      },
    ],
  },
  {
    key: "home.live_batch",
    title: "লাইভ ব্যাচ",
    description: "ভর্তি চলছে বার + কাউন্টডাউন + সিট।",
    defaults: liveBatchDefaults,
    fields: [
      { kind: "text", key: "eyebrow", label: "আপার লেবেল" },
      { kind: "text", key: "title", label: "শিরোনাম" },
      {
        kind: "stringlist",
        key: "checks",
        label: "সুবিধা লিস্ট",
        itemLabel: "সুবিধা",
      },
      {
        kind: "datetime",
        key: "deadline",
        label: "শেষ সময় (কাউন্টডাউন)",
        hint: "স্থানীয় সময়ে দিন; কাউন্টডাউন তখন পর্যন্ত গুনবে",
      },
      { kind: "number", key: "seatsFilled", label: "পূর্ণ হওয়া সিট" },
      { kind: "number", key: "seatsTotal", label: "মোট সিট" },
      { kind: "text", key: "seatLabel", label: "সিট লেবেল" },
      { kind: "text", key: "buttonText", label: "বাটন টেক্সট" },
      { kind: "url", key: "buttonLink", label: "বাটন লিংক" },
    ],
  },
  {
    key: "home.products",
    title: "ডিজিটাল প্রোডাক্ট",
    description: "প্রোডাক্ট কার্ডের গ্রিড।",
    defaults: productsDefaults,
    fields: [
      { kind: "text", key: "eyebrow", label: "আপার লেবেল" },
      { kind: "text", key: "title", label: "শিরোনাম" },
      { kind: "text", key: "viewAllText", label: "সব দেখুন বাটন টেক্সট" },
      { kind: "url", key: "viewAllLink", label: "সব দেখুন লিংক" },
      {
        kind: "list",
        key: "items",
        label: "প্রোডাক্ট",
        itemLabel: "প্রোডাক্ট",
        fields: [
          { kind: "text", key: "name", label: "নাম" },
          { kind: "text", key: "price", label: "দাম" },
          { kind: "text", key: "oldPrice", label: "আগের দাম (ফাঁকা রাখলে লুকাবে)" },
          { kind: "text", key: "tag", label: "ট্যাগ" },
          iconFields("icon", "আইকন"),
          {
            kind: "text",
            key: "gradient",
            label: "গ্র্যাডিয়েন্ট",
            hint: "যেমন from-blue-600 to-indigo-600",
          },
        ],
      },
    ],
  },
  {
    key: "home.testimonials",
    title: "শিক্ষার্থীদের মতামত",
    description: "স্লাইডার আকারে রিভিউ।",
    defaults: testimonialsDefaults,
    fields: [
      { kind: "text", key: "eyebrow", label: "আপার লেবেল" },
      { kind: "text", key: "title", label: "শিরোনাম" },
      {
        kind: "list",
        key: "items",
        label: "রিভিউ",
        itemLabel: "রিভিউ",
        fields: [
          { kind: "text", key: "name", label: "নাম" },
          { kind: "text", key: "role", label: "পেশা/রোল" },
          { kind: "textarea", key: "quote", label: "মতামত" },
          { kind: "text", key: "initials", label: "ইনিশিয়াল" },
          {
            kind: "text",
            key: "color",
            label: "রঙ (Tailwind class)",
            hint: "যেমন bg-blue-500",
          },
        ],
      },
    ],
  },
  {
    key: "home.faq",
    title: "FAQ সেকশন",
    description: "সাধারণ প্রশ্নোত্তর।",
    defaults: faqDefaults,
    fields: [
      { kind: "text", key: "title", label: "শিরোনাম" },
      {
        kind: "list",
        key: "items",
        label: "প্রশ্ন",
        itemLabel: "প্রশ্ন",
        fields: [
          { kind: "text", key: "q", label: "প্রশ্ন" },
          { kind: "textarea", key: "a", label: "উত্তর" },
        ],
      },
    ],
  },
  {
    key: "home.cta",
    title: "সবশেষ CTA সেকশন",
    description: "পেজের শেষে বড় কল-টু-অ্যাকশন ব্লক।",
    defaults: ctaDefaults,
    fields: [
      { kind: "text", key: "eyebrow", label: "আপার লেবেল" },
      { kind: "text", key: "title", label: "শিরোনাম" },
      { kind: "text", key: "subtitle", label: "সাবটাইটেল" },
      iconFields("icon", "আইকন"),
      { kind: "text", key: "buttonText", label: "বাটন টেক্সট" },
      { kind: "url", key: "buttonLink", label: "বাটন লিংক" },
    ],
  },
];

export const globalSections: SectionDef[] = [
  {
    key: "global.nav",
    title: "নেভিগেশন মেনু",
    description: "হেডারের উপরের মেনু লিংকগুলো।",
    defaults: navDefaults,
    fields: [
      {
        kind: "list",
        key: "links",
        label: "মেনু লিংক",
        itemLabel: "লিংক",
        fields: [
          { kind: "text", key: "label", label: "লেবেল" },
          { kind: "text", key: "href", label: "লিংক", hint: "যেমন /courses বা /#contact" },
        ],
      },
    ],
  },
  {
    key: "global.footer",
    title: "ফুটার",
    description: "পেজের একদম নিচের অংশ — যোগাযোগ, লিংক, সোশ্যাল।",
    defaults: footerDefaults,
    fields: [
      { kind: "textarea", key: "about", label: "সম্পর্কে (About)" },
      { kind: "text", key: "email", label: "ইমেইল" },
      { kind: "text", key: "phone", label: "ফোন" },
      { kind: "text", key: "address", label: "ঠিকানা" },
      { kind: "text", key: "quickLinksTitle", label: "Quick Links টাইটেল" },
      {
        kind: "list",
        key: "quickLinks",
        label: "Quick Links",
        itemLabel: "লিংক",
        fields: [
          { kind: "text", key: "label", label: "লেবেল" },
          { kind: "text", key: "href", label: "লিংক" },
        ],
      },
      { kind: "text", key: "supportTitle", label: "Support টাইটেল" },
      {
        kind: "list",
        key: "supportLinks",
        label: "Support লিংক",
        itemLabel: "লিংক",
        fields: [
          { kind: "text", key: "label", label: "লেবেল" },
          { kind: "text", key: "href", label: "লিংক" },
        ],
      },
      {
        kind: "list",
        key: "socials",
        label: "সোশ্যাল লিংক",
        itemLabel: "সোশ্যাল",
        fields: [
          iconFields("icon", "আইকন", "যেমন fa-brands fa-facebook-f"),
          { kind: "text", key: "href", label: "লিংক" },
        ],
      },
      { kind: "text", key: "newsletterTitle", label: "নিউজলেটার টাইটেল" },
      { kind: "text", key: "newsletterPlaceholder", label: "নিউজলেটার প্লেসহোল্ডার" },
      { kind: "text", key: "newsletterButton", label: "নিউজলেটার বাটন" },
      { kind: "text", key: "copyright", label: "কপিরাইট টেক্সট" },
      {
        kind: "stringlist",
        key: "paymentBadges",
        label: "পেমেন্ট ব্যাজ",
        itemLabel: "ব্যাজ",
      },
    ],
  },
];

export const allSections = [...homeSections, ...globalSections];
