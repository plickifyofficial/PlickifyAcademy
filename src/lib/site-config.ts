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
  { href: "/digital-products", label: "Digital Products" },
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
    desc: "Learn to work smarter using AI tools.",
  },
  {
    icon: "fa-solid fa-briefcase",
    title: "Freelancing",
    desc: "Learn online marketplaces and client work.",
  },
  {
    icon: "fa-solid fa-chart-line",
    title: "Passive Income",
    desc: "Digital assets and online income strategies.",
  },
  {
    icon: "fa-solid fa-palette",
    title: "Graphic Design",
    desc: "Modern graphic design powered by AI.",
  },
  {
    icon: "fa-solid fa-bullhorn",
    title: "Digital Marketing",
    desc: "Marketing, ads and audience growth.",
  },
  {
    icon: "fa-solid fa-globe",
    title: "Web & Tech",
    desc: "Modern web and digital technology.",
  },
];

export const featuredCourse = {
  badge: "BEST SELLER",
  tagline: "FEATURED COURSE",
  title: "AI Income Mastery 2026",
  description:
    "A complete practical course to build smart income with AI.",
  features: [
    "40+ Video Lessons",
    "Live Classes",
    "Weekly Q&A",
    "Practical Assignments",
    "Premium Resources",
    "Certificate",
  ],
  info: [
    { icon: "fa-solid fa-signal", label: "Level", value: "Beginner to Advanced" },
    { icon: "fa-solid fa-language", label: "Language", value: "Bengali" },
    { icon: "fa-solid fa-user-group", label: "Students", value: "500+ Enrolled" },
    { icon: "fa-solid fa-clock", label: "Duration", value: "10+ Hours" },
    { icon: "fa-solid fa-certificate", label: "Certificate", value: "Yes, Verifiable" },
  ],
};

export const whyUs = [
  {
    icon: "fa-solid fa-graduation-cap",
    title: "Real Skills",
    desc: "You will be taught practical, market-ready skills.",
  },
  {
    icon: "fa-solid fa-rocket",
    title: "Real Projects",
    desc: "Build real experience through actual projects.",
  },
  {
    icon: "fa-solid fa-dollar-sign",
    title: "Real Income",
    desc: "Move toward online income by using your skills.",
  },
];

export const learningSteps = [
  { icon: "fa-solid fa-user-plus", title: "Enroll", desc: "Enroll in the course" },
  { icon: "fa-solid fa-book-open-reader", title: "Learn", desc: "Use the classes and resources" },
  { icon: "fa-solid fa-keyboard", title: "Practice", desc: "Do homework and practical work" },
  { icon: "fa-solid fa-diagram-project", title: "Build Portfolio", desc: "Create a portfolio with real projects" },
  { icon: "fa-solid fa-sack-dollar", title: "Start Earning", desc: "Start freelancing / online income" },
];

export const liveBatch = {
  title: "Batch 01 Admissions Open!",
  checks: ["Live Classes", "Class Recordings", "Practical Support"],
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
      "Within the first month of the AI Income Mastery course, my freelancing income started. The practical videos in the course are outstanding.",
    color: "bg-blue-500",
    initials: "RH",
  },
  {
    name: "Nusrat Jahan",
    role: "Graphic Designer",
    quote:
      "After learning Canva and AI tools, I now get design work directly from clients. Plickify's support is truly great.",
    color: "bg-violet-500",
    initials: "NJ",
  },
  {
    name: "Mahadi Hasan",
    role: "Digital Marketer",
    quote:
      "The digital marketing course changed my career. The live classes and Q&A sessions were extremely helpful.",
    color: "bg-emerald-500",
    initials: "MH",
  },
];

export const faqs: Faq[] = [
  {
    q: "How does the course work?",
    a: "All video lessons unlock in your dashboard as soon as you enroll. You can watch the lessons at your own pace and do the practical work.",
  },
  {
    q: "Can I do the course from mobile?",
    a: "Yes, our platform is fully mobile-friendly. You can watch videos and practice from any smartphone or tablet.",
  },
  {
    q: "Will I get a certificate?",
    a: "Yes, you get a Verifiable Certificate after completing the course. The certificate includes your name, the course name and the completion date.",
  },
  {
    q: "When are the live classes?",
    a: "Live classes happen weekly at scheduled times. After enrolling you will find the schedule in your dashboard. If you miss one, you get the recording.",
  },
  {
    q: "How do I make the payment?",
    a: "Pay via Stripe with any international card or easily with bKash. Enrollment is confirmed as soon as the payment is completed.",
  },
  {
    q: "How do I enroll in the course?",
    a: "Click the 'Enroll Now' button on the course page, create an account and complete the payment to finish enrolling. Our support team can help if needed.",
  },
];
