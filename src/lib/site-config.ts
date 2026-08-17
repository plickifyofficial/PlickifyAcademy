export type Stat = {
  icon: string;
  value: string;
  label: string;
};

export type AiTool = {
  icon: string;
  name: string;
};

export type Skill = {
  icon: string;
  title: string;
  desc: string;
};

export type Product = {
  name: string;
  price: string;
  oldPrice?: string;
  gradient: string;
  icon: string;
  tag: string;
};

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
  color: string;
  initials: string;
};

export type Faq = {
  q: string;
  a: string;
};

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/#live-batch", label: "Live Batch" },
  { href: "/#products", label: "Digital Products" },
  { href: "/#why", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export const siteStats: Stat[] = [
  { icon: "fa-solid fa-user-group", value: "500+", label: "Happy Students" },
  { icon: "fa-solid fa-book-open", value: "50+", label: "Premium Resources" },
  { icon: "fa-solid fa-play", value: "10+", label: "Expert Courses" },
  { icon: "fa-solid fa-trophy", value: "95%", label: "Satisfaction Rate" },
];

export const aiTools: AiTool[] = [
  { icon: "fa-solid fa-comment-dots", name: "ChatGPT" },
  { icon: "fa-solid fa-palette", name: "Canva" },
  { icon: "fa-solid fa-brain", name: "Google AI" },
  { icon: "fa-solid fa-wand-magic-sparkles", name: "Midjourney" },
  { icon: "fa-solid fa-gem", name: "Gemini" },
  { icon: "fa-solid fa-robot", name: "Claude" },
];

export const skills: Skill[] = [
  {
    icon: "fa-solid fa-brain",
    title: "AI Productivity",
    desc: "AI tools দিয়ে smart work করার skill।",
  },
  {
    icon: "fa-solid fa-briefcase",
    title: "Freelancing",
    desc: "Online marketplace এবং client work শেখা।",
  },
  {
    icon: "fa-solid fa-chart-line",
    title: "Passive Income",
    desc: "Digital assets এবং online income strategy।",
  },
  {
    icon: "fa-solid fa-palette",
    title: "Graphic Design",
    desc: "AI-powered modern graphic design।",
  },
  {
    icon: "fa-solid fa-bullhorn",
    title: "Digital Marketing",
    desc: "Marketing, ads এবং audience growth।",
  },
  {
    icon: "fa-solid fa-globe",
    title: "Web & Tech",
    desc: "Modern web এবং digital technology।",
  },
];

export const featuredCourse = {
  badge: "BEST SELLER",
  tagline: "FEATURED COURSE",
  title: "AI Income Mastery 2026",
  description:
    "AI দিয়ে smart income তৈরি করার জন্য complete practical course।",
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

export const whyUs = [
  {
    icon: "fa-solid fa-graduation-cap",
    title: "Real Skills",
    desc: "Practical এবং market-ready skill শেখানো হবে।",
  },
  {
    icon: "fa-solid fa-rocket",
    title: "Real Projects",
    desc: "বাস্তব project-এর মাধ্যমে experience তৈরি করুন।",
  },
  {
    icon: "fa-solid fa-dollar-sign",
    title: "Real Income",
    desc: "Skill ব্যবহার করে online income-এর পথে এগিয়ে যান।",
  },
];

export const learningSteps = [
  { icon: "fa-solid fa-user-plus", title: "Enroll", desc: "কোর্সে ভর্তি হন" },
  { icon: "fa-solid fa-book-open-reader", title: "Learn", desc: "ক্লাস এবং resources ব্যবহার করুন" },
  { icon: "fa-solid fa-keyboard", title: "Practice", desc: "Homework এবং practical কাজ করুন" },
  { icon: "fa-solid fa-diagram-project", title: "Build Portfolio", desc: "Real project দিয়ে portfolio তৈরি করুন" },
  { icon: "fa-solid fa-sack-dollar", title: "Start Earning", desc: "Freelancing/online income শুরু করুন" },
];

export const liveBatch = {
  title: "Batch 01 ভর্তি চলছে!",
  checks: ["লাইভ ক্লাস", "ক্লাস রেকর্ডিং", "প্র্যাকটিক্যাল সাপোর্ট"],
  deadline: new Date("2026-10-01T00:00:00+06:00").getTime(),
  seatsFilled: 28,
  seatsTotal: 100,
};

export const products: Product[] = [
  {
    name: "AI Prompt Pack",
    price: "৳490",
    gradient: "from-blue-600 to-indigo-600",
    icon: "fa-solid fa-bolt",
    tag: "PROMPTS",
  },
  {
    name: "Canva Templates",
    price: "৳690",
    oldPrice: "৳990",
    gradient: "from-violet-600 to-fuchsia-600",
    icon: "fa-solid fa-palette",
    tag: "DESIGN",
  },
  {
    name: "AI Toolkit",
    price: "৳990",
    gradient: "from-cyan-600 to-blue-700",
    icon: "fa-solid fa-toolbox",
    tag: "TOOLS",
  },
  {
    name: "Freelance Guide eBook",
    price: "৳390",
    oldPrice: "৳590",
    gradient: "from-emerald-600 to-teal-600",
    icon: "fa-solid fa-book",
    tag: "EBOOK",
  },
];

export const testimonials: Testimonial[] = [
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
];

export const faqs: Faq[] = [
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
    a: "Stripe এর মাধ্যমে যেকোনো আন্তর্জাতিক কার্ড বা বিকাশ সহজে পেমেন্ট করতে পারবেন। পেমেন্ট সম্পন্ন হওয়ার সাথে সাথেই এনরোলমেন্ট কনফার্ম হয়।",
  },
  {
    q: "কোর্সে কিভাবে ভর্তি হবো?",
    a: "কোর্স পেজ থেকে 'এখনই ভর্তি করুন' বাটনে ক্লিক করুন, একাউন্ট তৈরি করে পেমেন্ট সম্পন্ন করলেই ভর্তি সম্পন্ন। প্রয়োজনে আমাদের সাপোর্ট টিম সাহায্য করবে।",
  },
];
