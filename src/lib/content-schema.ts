export type ScalarField =
  | { kind: "text"; key: string; label: string; hint?: string }
  | { kind: "textarea"; key: string; label: string; hint?: string }
  | { kind: "url"; key: string; label: string; hint?: string }
  | { kind: "image"; key: string; label: string; hint?: string }
  | { kind: "number"; key: string; label: string; hint?: string }
  | { kind: "datetime"; key: string; label: string; hint?: string }
  | { kind: "icon"; key: string; label: string; hint?: string }
  | { kind: "boolean"; key: string; label: string; hint?: string };

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
  titleA: "Start Your",
  titleHighlight: "Digital Career",
  titleB: "with AI",
  subtitle:
    "Build your digital career by learning AI Skills, Freelancing, Passive Income and Real-World Projects.",
  primaryBtn: "এখনই শুরু করুন",
  primaryBtnLink: "/signup",
  secondaryBtn: "কোর্সগুলো দেখুন",
  secondaryBtnLink: "/courses",
  rating: "4.9/5",
  reviews: "500+ Reviews",
  studentsCount: "500+ Happy Students",
  heroImage: "",
  heroImageAlt: "Plickify Academy dashboard preview",
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
  title: "Every Skill You Need for Your Future",
  items: [
    { icon: "fa-solid fa-brain", title: "AI Productivity", desc: "Learn to work smarter using AI tools.", link: "/courses" },
    { icon: "fa-solid fa-briefcase", title: "Freelancing", desc: "Learn online marketplaces and client work.", link: "/courses" },
    { icon: "fa-solid fa-chart-line", title: "Passive Income", desc: "Digital assets and online income strategies.", link: "/courses" },
    { icon: "fa-solid fa-palette", title: "Graphic Design", desc: "Modern graphic design powered by AI.", link: "/courses" },
    { icon: "fa-solid fa-bullhorn", title: "Digital Marketing", desc: "Marketing, ads and audience growth.", link: "/courses" },
    { icon: "fa-solid fa-globe", title: "Web & Tech", desc: "Modern web and digital technology.", link: "/courses" },
  ],
};
export type SkillsContent = typeof skillsDefaults;

export const ourCoursesDefaults = {
  eyebrow: "Our Courses",
  title: "Our Courses",
  subtitle: "Pick the best practical courses and start learning.",
  viewAllText: "View All Courses",
  viewAllLink: "/courses",
  limit: 6,
};
export type OurCoursesContent = typeof ourCoursesDefaults;

export const featuredDefaults = {
  badge: "BEST SELLER",
  tagline: "FEATURED COURSE",
  cardTop1: "AI Income",
  cardTop2: "Mastery",
  cardYear: "2026",
  title: "AI Income Mastery 2026",
  description: "A complete practical course to build smart income with AI.",
  buttonText: "Enroll Now",
  buttonLink: "/signup",
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
export type FeaturedContent = typeof featuredDefaults;

export const whyDefaults = {
  eyebrow: "Why Plickify Academy",
  title: "Why Learn With Us?",
  items: [
    { icon: "fa-solid fa-graduation-cap", title: "Real Skills", desc: "You will be taught practical, market-ready skills." },
    { icon: "fa-solid fa-rocket", title: "Real Projects", desc: "Build real experience through actual projects." },
    { icon: "fa-solid fa-dollar-sign", title: "Real Income", desc: "Move toward online income by using your skills." },
  ],
};
export type WhyContent = typeof whyDefaults;

export const processDefaults = {
  eyebrow: "Learning Process",
  title: "Our Learning Process",
  steps: [
    { icon: "fa-solid fa-user-plus", title: "Enroll", desc: "Enroll in the course" },
    { icon: "fa-solid fa-book-open-reader", title: "Learn", desc: "Use the classes and resources" },
    { icon: "fa-solid fa-keyboard", title: "Practice", desc: "Do homework and practical work" },
    { icon: "fa-solid fa-diagram-project", title: "Build Portfolio", desc: "Create a portfolio with real projects" },
    { icon: "fa-solid fa-sack-dollar", title: "Start Earning", desc: "Start freelancing / online income" },
  ],
};
export type ProcessContent = typeof processDefaults;

export const liveBatchDefaults = {
  eyebrow: "Live Batch",
  title: "Batch 01 Admissions Open!",
  checks: ["Live Classes", "Class Recordings", "Practical Support"],
  deadline: "2026-10-01T00:00:00+06:00",
  seatsFilled: 28,
  seatsTotal: 100,
  seatLabel: "Seat filled",
  buttonText: "Enroll Now",
  buttonLink: "/signup",
};
export type LiveBatchContent = typeof liveBatchDefaults;

export const productsDefaults = {
  eyebrow: "Learning Products",
  title: "Premium Digital Resources",
  viewAllText: "View All Resources",
  viewAllLink: "/digital-products",
  limit: 8,
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
  title: "What Our Students Say",
  items: [
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
  ],
};
export type TestimonialsContent = typeof testimonialsDefaults;

export const faqDefaults = {
  title: "Frequently Asked Questions",
  items: [
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
      a: "Pay via bKash or Nagad and submit the TrxID — our team verifies it and enrolls you. Enrollment is usually confirmed within 5-30 minutes.",
    },
    {
      q: "How do I enroll in the course?",
      a: "Click the 'Enroll Now' button on the course page, create an account and complete the payment to finish enrolling. Our support team can help if needed.",
    },
  ],
};
export type FaqContent = typeof faqDefaults;

export const ctaDefaults = {
  eyebrow: "Ready To Start?",
  title: "Start Your AI Journey Today!",
  subtitle: "Begin learning new skills and building your digital career from today.",
  icon: "fa-brands fa-telegram",
  buttonText: "Get Started Now",
  buttonLink: "/signup",
};
export type CtaContent = typeof ctaDefaults;

export const navDefaults = {
  links: [
    { label: "Home", href: "/" },
    { label: "Courses", href: "/courses" },
    { label: "Live Courses", href: "/live-course" },
    { label: "Digital Products", href: "/digital-products" },
    { label: "Blog", href: "/blog" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
};
export type NavContent = typeof navDefaults;

export const blogSettingsDefaults = {
  postsPerPage: 9,
  defaultCategoryId: null,
  defaultAuthorId: null,
  commentsEnabled: true,
  commentsModeration: "manual",
  shareButtons: true,
  relatedPosts: true,
  showReadingTime: true,
  showViewCounter: true,
  showNewsletter: true,
  showSidebar: true,
  showFeatured: true,
  pagination: "load-more",
  seoTitleTemplate: "{title} | Plickify Academy Blog",
};
export type BlogSettingsContent = typeof blogSettingsDefaults;

const businessHourDefaults = [
  { day: 0, label: "Sunday", enabled: true, open: "10:00", close: "22:00" },
  { day: 1, label: "Monday", enabled: true, open: "10:00", close: "22:00" },
  { day: 2, label: "Tuesday", enabled: true, open: "10:00", close: "22:00" },
  { day: 3, label: "Wednesday", enabled: true, open: "10:00", close: "22:00" },
  { day: 4, label: "Thursday", enabled: true, open: "10:00", close: "22:00" },
  { day: 5, label: "Friday", enabled: true, open: "10:00", close: "22:00" },
  { day: 6, label: "Saturday", enabled: true, open: "10:00", close: "22:00" },
];

export const contactSettingsDefaults = {
  enabled: true,
  backToTopEnabled: true,
  whatsappEnabled: true,
  whatsappNumber: "",
  whatsappMessage:
    "Assalamu Alaikum, I need help regarding Plickify Academy.",
  whatsappLabel: "WhatsApp Us",
  messengerEnabled: true,
  messengerUrl: "",
  messengerLabel: "Messenger",
  liveChatEnabled: true,
  botName: "Plickify Support",
  botAvatarUrl: "",
  welcomeMessage: "Assalamu Alaikum! 👋 How can we help you?",
  quickReplies: [
    {
      label: "Courses",
      reply:
        "We offer practical courses on AI, Freelancing, Graphic Design, Digital Marketing, Content Creation and Digital Business. Which course are you interested in?",
    },
    {
      label: "Enrollment",
      reply:
        "To enroll, open any course page, press the enroll button, complete payment via bKash or Nagad and submit your TrxID. You'll be enrolled instantly.",
    },
    {
      label: "Payment",
      reply:
        "We accept bKash and Nagad. Send the course fee to our merchant number shown at checkout, then submit your Transaction ID (TrxID). You'll be enrolled instantly.",
    },
    {
      label: "Student Support",
      reply:
        "For account or course access help, please share your issue details and our support team will resolve it as soon as possible.",
    },
    {
      label: "Technical Support",
      reply:
        "If you're facing a technical problem, please describe it here or talk to our support team for immediate help.",
    },
    {
      label: "Digital Products",
      reply:
        "After payment, digital products are unlocked instantly in your dashboard under My Products. For any issue, contact our support team.",
    },
  ],
  supportMessage:
    "I'm not completely sure about that. Would you like to talk to our support team?",
  offlineMessage:
    "We're currently offline. Leave a message and we'll get back to you.",
  handoffEnabled: true,
  handoffTarget: "whatsapp",
  availability: "always",
  businessHours: businessHourDefaults,
  placement: {
    all: true,
    home: true,
    courses: true,
    products: true,
    blog: true,
    dashboard: true,
    checkout: true,
    pages: true,
  },
};
export type ContactSettingsContent = typeof contactSettingsDefaults;
export type BusinessHour = (typeof businessHourDefaults)[number];
export type QuickReply = {
  label: string;
  reply: string;
};
export type ContactPlacement = ContactSettingsContent["placement"];

export const announcementDefaults = {
  is_enabled: false,
  text: "🎉 New batch admission is open — enroll today!",
  linkText: "Learn more",
  link: "/courses",
  bg: "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600",
};
export type AnnouncementContent = typeof announcementDefaults;

export const popupDefaults = {
  is_enabled: false,
  title: "🎉 Special Offer!",
  body: "<p>Enroll in any course this week and get <strong>50% OFF</strong>. Limited time offer!</p>",
  image: "",
  buttonText: "Enroll Now",
  buttonLink: "/courses",
  delaySeconds: 5,
  showOncePerSession: true,
};
export type PopupContent = typeof popupDefaults;

export const footerDefaults = {
  about:
    "A practical learning platform for AI, Freelancing and Digital Skills.",
  email: "hello@plickifyacademy.com",
  phone: "+880 1234-567890",
  address: "Dhaka, Bangladesh",
  quickLinksTitle: "Quick Links",
  quickLinks: [
    { label: "Courses", href: "/courses" },
    { label: "Live Batch", href: "/live-batch" },
    { label: "Digital Products", href: "/digital-products" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  supportTitle: "Support",
  supportLinks: [
    { label: "FAQ", href: "/faq" },
    { label: "Contact Us", href: "/contact" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Refund Policy", href: "/refund" },
  ],
  socials: [
    { icon: "fa-brands fa-facebook-f", href: "#" },
    { icon: "fa-brands fa-youtube", href: "#" },
    { icon: "fa-brands fa-linkedin-in", href: "#" },
    { icon: "fa-brands fa-instagram", href: "#" },
  ],
  newsletterTitle: "Subscribe for the latest updates",
  newsletterPlaceholder: "Your email",
  newsletterButton: "Subscribe",
  copyright: "© 2026 Plickify Academy. All rights reserved.",
  paymentBadges: ["VISA", "MC", "BKASH", "NAGAD"],
};
export type FooterContent = typeof footerDefaults;

export const aboutDefaults = {
  heroEyebrow: "ABOUT PLICKIFY ACADEMY",
  heroTitle: "শেখার মাধ্যমে নিজের ভবিষ্যৎ তৈরি করুন",
  heroParagraphs: [
    "Plickify Academy হলো AI, Freelancing, Digital Skills এবং Online Income শেখার জন্য একটি practical learning platform।",
    "আমাদের লক্ষ্য হলো আধুনিক technology এবং AI-এর শক্তিকে ব্যবহার করে শিক্ষার্থীদের market-ready skill তৈরি করতে সাহায্য করা।",
  ],
  heroPrimary: "আমাদের কোর্স দেখুন",
  heroPrimaryLink: "/courses",
  heroSecondary: "Join Our Community",
  heroSecondaryLink: "/signup",
  heroVisualTitle: "Learn → Practice → Build → Earn",
  heroVisualStats: [
    "500+ Happy Students",
    "10+ Expert Courses",
    "50+ Premium Resources",
    "95% Satisfaction",
  ],
  stats: [
    { value: "500+", label: "Happy Students" },
    { value: "10+", label: "Expert Courses" },
    { value: "50+", label: "Premium Resources" },
    { value: "95%", label: "Student Satisfaction" },
  ],
  storyLabel: "OUR STORY",
  storyTitle: "একটি ছোট স্বপ্ন থেকে একটি বড় Learning Community",
  storyParagraphs: [
    "Plickify Academy শুরু হয়েছে একটি simple vision থেকে—বাংলাভাষী শিক্ষার্থীদের জন্য practical এবং modern digital education সহজলভ্য করা।",
    "আমরা বিশ্বাস করি, শুধু certificate নয়; real-world skill, practice এবং proper guidance একজন শিক্ষার্থীর career পরিবর্তন করতে পারে।",
    "সেই লক্ষ্যেই আমরা AI, freelancing, graphic design, digital marketing, content creation এবং online income-এর মতো skill-based learning নিয়ে কাজ করছি।",
  ],
  storyTimeline: [
    { year: "2024", text: "একটি ছোট ভিশন নিয়ে পথচলা শুরু" },
    { year: "2025", text: "AI, Freelancing ও Digital Skill কোর্স চালু" },
    { year: "2026", text: "Digital Resources ও Learning Community সম্প্রসারণ" },
  ],
  missionIcon: "fa-solid fa-bullseye",
  missionTitle: "আমাদের Mission",
  missionDesc:
    "প্রতিটি শিক্ষার্থীকে practical, accessible এবং industry-relevant digital skills শেখার সুযোগ তৈরি করা।",
  visionIcon: "fa-solid fa-eye",
  visionTitle: "আমাদের Vision",
  visionDesc:
    "বাংলাভাষী তরুণদের জন্য একটি trusted digital learning ecosystem তৈরি করা, যেখানে skill শেখা, practice করা এবং career/income opportunity তৈরি করা একই journey-এর অংশ।",
  philosophyLabel: "OUR PHILOSOPHY",
  philosophyTitle: "শুধু শেখানো নয়, বাস্তবে কাজে লাগানো",
  philosophySubtitle:
    "আমরা মনে করি education তখনই valuable যখন একজন শিক্ষার্থী শেখা skill বাস্তব জীবনে ব্যবহার করতে পারে।",
  philosophySteps: [
    {
      icon: "fa-solid fa-book-open",
      title: "Learn",
      sub: "সঠিকভাবে শেখা",
      desc: "Structured lessons এবং practical resources।",
    },
    {
      icon: "fa-solid fa-laptop-code",
      title: "Practice",
      sub: "নিজে করে শেখা",
      desc: "Assignments, projects এবং real-world practice।",
    },
    {
      icon: "fa-solid fa-rocket",
      title: "Apply",
      sub: "বাস্তবে কাজে লাগানো",
      desc: "Freelancing, career এবং online income-এর জন্য skill ব্যবহার।",
    },
  ],
  whyTitle: "কেন Plickify Academy আলাদা?",
  whyItems: [
    {
      icon: "fa-solid fa-list-check",
      title: "Practical Curriculum",
      desc: "শুধু theory নয়, practical skill।",
    },
    {
      icon: "fa-solid fa-robot",
      title: "AI Powered Learning",
      desc: "Modern AI tools এবং workflow।",
    },
    {
      icon: "fa-solid fa-diagram-project",
      title: "Real Projects",
      desc: "Portfolio তৈরির জন্য real-world projects।",
    },
    {
      icon: "fa-solid fa-user-group",
      title: "Community Support",
      desc: "Learning journey-তে continuous support।",
    },
  ],
  teachLabel: "WHAT WE TEACH",
  teachTitle: "আজকের Digital World-এর জন্য প্রয়োজনীয় Skills",
  teachItems: [
    {
      icon: "fa-solid fa-brain",
      title: "AI & Productivity",
      desc: "AI tools, automation এবং smart workflow।",
    },
    {
      icon: "fa-solid fa-briefcase",
      title: "Freelancing",
      desc: "Marketplace, client communication এবং earning।",
    },
    {
      icon: "fa-solid fa-palette",
      title: "Graphic Design",
      desc: "AI-powered graphic design এবং creative skills।",
    },
    {
      icon: "fa-solid fa-bullhorn",
      title: "Digital Marketing",
      desc: "Marketing, advertising এবং audience growth।",
    },
    {
      icon: "fa-solid fa-wand-magic-sparkles",
      title: "Content Creation",
      desc: "Content strategy, AI content এবং creator workflow।",
    },
    {
      icon: "fa-solid fa-globe",
      title: "Digital Business",
      desc: "Online business এবং digital income strategy।",
    },
  ],
  instructorsLabel: "MEET OUR INSTRUCTORS",
  instructorsTitle: "অভিজ্ঞদের কাছ থেকে শিখুন",
  instructors: [
    {
      name: "মোঃ মিনহাজুল ইসলাম",
      role: "Founder & Lead Instructor",
      expertise: ["AI", "Graphic Design", "Freelancing", "Digital Business"],
      bio: "AI, Design ও Freelancing-এ কাজের অভিজ্ঞতা নিয়ে শিক্ষার্থীদের practical skill শেখান।",
      initials: "MI",
      color: "from-blue-600 to-indigo-600",
    },
    {
      name: "মোঃ সজীব শেখ",
      role: "Trainer & Mentor",
      expertise: ["Digital Skills", "Freelancing", "AI Tools", "Practical Training"],
      bio: "শিক্ষার্থীদের hands-on training ও mentorship-এর মাধ্যমে skill develop করতে সাহায্য করেন।",
      initials: "SS",
      color: "from-violet-600 to-fuchsia-600",
    },
  ],
  credibility: [
    { value: "2+", label: "Years Experience" },
    { value: "500+", label: "Students" },
    { value: "50+", label: "Projects/Resources" },
    { value: "10+", label: "Courses" },
  ],
  journeyTitle: "একজন Student হিসেবে আপনার Experience কেমন হবে?",
  journeySteps: [
    { num: "01", title: "Structured Learning", desc: "Step-by-step lessons।" },
    { num: "02", title: "Live Support", desc: "Live classes এবং Q&A।" },
    { num: "03", title: "Practice", desc: "Assignments এবং exercises।" },
    { num: "04", title: "Community", desc: "Peer এবং mentor support।" },
    { num: "05", title: "Career Growth", desc: "Portfolio, freelancing এবং income direction।" },
  ],
  impactTitle: "আমাদের Impact",
  impactStats: [
    { value: "500+", label: "Students" },
    { value: "1,000+", label: "Learning Hours" },
    { value: "50+", label: "Resources" },
    { value: "10+", label: "Courses" },
    { value: "95%", label: "Satisfaction" },
  ],
  impactNote:
    "আমাদের লক্ষ্য শুধু সংখ্যা বাড়ানো নয়—প্রতিটি শিক্ষার্থীর learning journey-তে measurable value তৈরি করা।",
  successLabel: "STUDENT SUCCESS",
  successTitle: "আমাদের শিক্ষার্থীদের সাফল্যই আমাদের অনুপ্রেরণা",
  successStories: [
    {
      name: "মেহেদী হাসান",
      role: "Freelancer",
      course: "AI Income Mastery",
      tag: "Freelancing Started",
      text: "কোর্স থেকে শেখা skill দিয়ে ফ্রিল্যান্সিং শুরু করেছি। প্রথম মাসেই ক্লায়েন্টের কাজ পেয়েছি।",
      initials: "MH",
      color: "from-blue-600 to-indigo-600",
    },
    {
      name: "সুমাইয়া আক্তার",
      role: "Graphic Designer",
      course: "Design & AI",
      tag: "Portfolio Built",
      text: "AI tools শিখে আমার ডিজাইন quality অনেক উন্নত হয়েছে। এখন নিজের portfolio দিয়ে কাজ করছি।",
      initials: "SA",
      color: "from-violet-600 to-fuchsia-600",
    },
    {
      name: "রাকিব ইসলাম",
      role: "Content Creator",
      course: "AI Content Creation",
      tag: "AI Workflow Mastered",
      text: "AI workflow শিখে content তৈরি অনেক দ্রুত করছি। আগের চেয়ে অনেক বেশি consistent হতে পেরেছি।",
      initials: "RI",
      color: "from-emerald-600 to-teal-600",
    },
  ],
  valuesTitle: "আমাদের Values",
  values: [
    { icon: "fa-solid fa-gem", title: "Quality", desc: "মানসম্মত learning experience।" },
    { icon: "fa-solid fa-scale-balanced", title: "Transparency", desc: "Clear pricing এবং honest communication।" },
    { icon: "fa-solid fa-toolbox", title: "Practicality", desc: "শেখা হবে বাস্তব কাজের মাধ্যমে।" },
    { icon: "fa-solid fa-chart-line", title: "Growth", desc: "Continuous learning এবং improvement।" },
  ],
  communityLabel: "JOIN THE COMMUNITY",
  communityTitle: "একাই শিখবেন না—একটি Learning Community-এর সাথে এগিয়ে যান",
  communityDesc:
    "সহশিক্ষার্থী, mentor এবং learning resources-এর সাথে connected থেকে আপনার skill journey আরও সহজ করুন।",
  communityPrimary: "Community-তে Join করুন",
  communityPrimaryLink: "/signup",
  communitySecondary: "কোর্স দেখুন",
  communitySecondaryLink: "/courses",
  communityAvatars: [
    { initials: "RH", color: "from-blue-500 to-indigo-500" },
    { initials: "NJ", color: "from-violet-500 to-fuchsia-500" },
    { initials: "TA", color: "from-emerald-500 to-teal-500" },
    { initials: "SA", color: "from-rose-500 to-pink-500" },
    { initials: "MK", color: "from-amber-500 to-orange-500" },
    { initials: "AR", color: "from-cyan-500 to-blue-500" },
  ],
  faqTitle: "Plickify Academy সম্পর্কে সাধারণ প্রশ্ন",
  faqItems: [
    {
      q: "Plickify Academy কী?",
      a: "Plickify Academy হলো AI, Freelancing, Digital Skills এবং Online Income শেখার জন্য একটি practical learning platform। এখানে কোর্স, live class এবং premium digital resources পাওয়া যায়।",
    },
    {
      q: "এখানে কী ধরনের course পাওয়া যায়?",
      a: "AI, Graphic Design, Freelancing, Digital Marketing, Content Creation এবং Digital Business—এই sector-এর practical skill-based courses এবং live batch পাওয়া যায়।",
    },
    {
      q: "Beginner হলে কি আমি course করতে পারবো?",
      a: "অবশ্যই। আমাদের কোর্সগুলো step-by-step design করা হয়েছে যেন একদম beginner থেকেও সহজে শেখা যায়। কোনো আগের অভিজ্ঞতা লাগে না।",
    },
    {
      q: "Live class এবং recorded class দুটোই কি আছে?",
      a: "হ্যাঁ। প্রতিটি course-এ recorded lessons থাকে এবং নির্দিষ্ট সময়ে live class হয় যেখানে সরাসরি প্রশ্ন করা যায়।",
    },
    {
      q: "Course শেষ করলে certificate পাওয়া যাবে?",
      a: "হ্যাঁ, course সফলভাবে শেষ করলে verifiable certificate দেওয়া হয় যা portfolio বা resume-এ ব্যবহার করা যায়।",
    },
    {
      q: "Digital products কোথা থেকে কিনতে পারবো?",
      a: "আমাদের Digital Products সেকশন থেকে AI prompt packs, Canva templates, eBooks সহ premium resources কিনতে পারবেন।",
    },
    {
      q: "Student support কীভাবে পাবো?",
      a: "কোর্সের মধ্যে Q&A, live classes এবং community-এর মাধ্যমে support পাওয়া যায়। প্রযুক্তিগত সমস্যায় contact page থেকে যোগাযোগ করতে পারবেন।",
    },
    {
      q: "Plickify Academy-এর সাথে কীভাবে যুক্ত হবো?",
      a: "Join Now বাটনে ক্লিক করে account তৈরি করুন, তারপর আপনার পছন্দের course-এ ভর্তি হয়ে learning journey শুরু করুন।",
    },
  ],
  ctaEyebrow: "YOUR JOURNEY STARTS HERE",
  ctaTitle: "আপনার Digital Career Journey আজই শুরু করুন",
  ctaSubtitle:
    "সঠিক skill, practical learning এবং continuous support-এর সাথে আপনার next step নিন।",
  ctaPrimary: "কোর্স দেখুন",
  ctaPrimaryLink: "/courses",
  ctaSecondary: "Join Now",
  ctaSecondaryLink: "/signup",
};
export type AboutContent = typeof aboutDefaults;

export const contactDefaults = {
  heroEyebrow: "CONTACT US",
  heroTitle: "আমাদের সাথে যোগাযোগ করুন",
  heroSubtitle:
    "কোর্স, ভর্তি, পেমেন্ট, ডিজিটাল প্রোডাক্ট অথবা যেকোনো প্রশ্নের জন্য আমাদের সাথে যোগাযোগ করুন। আমরা আপনাকে সাহায্য করতে প্রস্তুত।",
  cards: [
    {
      icon: "fa-solid fa-envelope",
      title: "Email Us",
      value: "hello@plickifyacademy.com",
      desc: "সাধারণ প্রশ্ন ও support-এর জন্য",
      action: "Email করুন",
      href: "mailto:hello@plickifyacademy.com",
    },
    {
      icon: "fa-solid fa-phone",
      title: "Call Us",
      value: "+880 1234-567890",
      desc: "সকাল 10টা – রাত 8টা",
      action: "কল করুন",
      href: "tel:+8801234567890",
    },
    {
      icon: "fa-solid fa-comments",
      title: "Live Support",
      value: "Chat with us",
      desc: "Support team-এর সাথে সরাসরি কথা বলুন।",
      action: "Chat শুরু করুন",
      href: "#contact-form",
    },
    {
      icon: "fa-solid fa-location-dot",
      title: "Our Location",
      value: "Dhaka, Bangladesh",
      desc: "Plickify Academy",
      action: "Map দেখুন",
      href: "#map",
    },
  ],
  infoLabel: "GET IN TOUCH",
  infoTitle: "আমরা আপনার কথা শুনতে চাই",
  infoDesc:
    "আপনার প্রশ্ন, feedback অথবা সমস্যার কথা আমাদের জানান। আমাদের support team যত দ্রুত সম্ভব আপনার সাথে যোগাযোগ করবে।",
  email: "hello@plickifyacademy.com",
  supportEmail: "support@plickifyacademy.com",
  phone: "+880 1234-567890",
  hoursTitle: "Working Hours",
  hours: ["Saturday – Thursday", "10:00 AM – 8:00 PM"],
  locationTitle: "Location",
  location: "Dhaka, Bangladesh",
  priorityTitle: "PRIORITY SUPPORT",
  priorityDesc:
    "Student বা customer হিসেবে আপনার urgent account/payment সমস্যা থাকলে আপনার order ID অথবা registered email দিয়ে support request পাঠান।",
  priorityButton: "Get Support",
  priorityButtonLink: "mailto:support@plickifyacademy.com",
  socialTitle: "আমাদের সাথে Connected থাকুন",
  socials: [
    { icon: "fa-brands fa-facebook-f", href: "#" },
    { icon: "fa-brands fa-instagram", href: "#" },
    { icon: "fa-brands fa-youtube", href: "#" },
    { icon: "fa-brands fa-linkedin-in", href: "#" },
    { icon: "fa-brands fa-telegram", href: "#" },
  ],
  formTitle: "একটি মেসেজ পাঠান",
  formDesc: "নিচের form পূরণ করুন। আমাদের team আপনার সাথে যোগাযোগ করবে।",
  successTitle: "আপনার মেসেজ সফলভাবে পাঠানো হয়েছে!",
  successDesc: "আমাদের team শীঘ্রই আপনার সাথে যোগাযোগ করবে।",
  helpLabel: "NEED QUICK HELP?",
  helpTitle: "আপনার প্রশ্নের উত্তর হয়তো এখানেই আছে",
  helpDesc: "যোগাযোগ করার আগে আমাদের FAQ section দেখে নিতে পারেন।",
  helpPrimary: "FAQ দেখুন",
  helpPrimaryLink: "/faq",
  helpSecondary: "Courses দেখুন",
  helpSecondaryLink: "/courses",
  faqTitle: "সাধারণ কিছু প্রশ্ন",
  faqItems: [
    { q: "Course সম্পর্কে কিভাবে জানতে পারবো?", a: "আমাদের Courses page-এ সব কোর্সের বিস্তারিত description, curriculum, price এবং enrollment তথ্য পাওয়া যায়।" },
    { q: "Course-এ কিভাবে ভর্তি হবো?", a: "পছন্দের course-এ ভর্তি বাটনে ক্লিক করে checkout page থেকে payment complete করলেই ভর্তি হয়ে যাবেন।" },
    { q: "Payment করার পর access কিভাবে পাবো?", a: "Payment সফল হওয়ার সঙ্গে সঙ্গে আপনার account-এ course unlock হয়ে যাবে এবং Dashboard থেকে শুরু করতে পারবেন।" },
    { q: "Digital product কেনার পর download কোথায় পাবো?", a: "Digital Products সেকশনে My Digital Products area থেকে কেনা product download করতে পারবেন।" },
    { q: "Technical সমস্যা হলে কী করবো?", a: "এই page-এর form-এ Technical Support subject নির্বাচন করে মেসেজ পাঠান, আমাদের team সাহায্য করবে।" },
    { q: "Support team-এর সাথে কিভাবে যোগাযোগ করবো?", a: "Email (hello@plickifyacademy.com) অথবা এই page-এর contact form দিয়ে যোগাযোগ করতে পারবেন।" },
    { q: "Refund policy কী?", a: "Refund policy বিস্তারিত জানতে আমাদের Refund Policy page দেখুন।" },
    { q: "Live class সম্পর্কে কোথায় জানতে পারবো?", a: "Live Courses page-এ upcoming live classes, schedule এবং registration তথ্য দেখতে পাবেন।" },
  ],
  mapLabel: "FIND US",
  mapTitle: "আমাদের Location",
  mapLocation: "Dhaka, Bangladesh",
  mapEmbedUrl:
    "https://www.openstreetmap.org/export/embed.html?bbox=90.34%2C23.69%2C90.47%2C23.79&layer=mapnik&marker=23.74%2C90.40",
  channelsLabel: "SUPPORT CHANNELS",
  channelsTitle: "কোন বিষয়ে সাহায্য লাগবে?",
  channels: [
    {
      icon: "fa-solid fa-book-open",
      title: "Course Questions",
      desc: "Course Support",
      href: "/faq",
    },
    {
      icon: "fa-solid fa-money-bill-wave",
      title: "Payment Problems",
      desc: "Billing Support",
      href: "/contact#contact-form",
    },
    {
      icon: "fa-solid fa-box",
      title: "Product Problems",
      desc: "Product Support",
      href: "/contact#contact-form",
    },
    {
      icon: "fa-solid fa-gear",
      title: "Technical Issues",
      desc: "Technical Support",
      href: "/contact#contact-form",
    },
  ],
  ctaEyebrow: "WE'RE HERE TO HELP",
  ctaTitle: "আপনার প্রশ্ন আছে? আমাদের সাথে কথা বলুন।",
  ctaSubtitle: "সঠিক information এবং support পেতে আজই আমাদের সাথে যোগাযোগ করুন।",
  ctaPrimary: "মেসেজ পাঠান",
  ctaPrimaryLink: "/contact#contact-form",
  ctaSecondary: "FAQ দেখুন",
  ctaSecondaryLink: "/faq",
};
export type ContactContent = typeof contactDefaults;

const iconFields = (
  key: string,
  label: string,
  hint = "FontAwesome icon class, e.g. fa-solid fa-brain",
): FieldDef => ({ kind: "icon", key, label, hint });

export const homeSections: SectionDef[] = [
  {
    key: "home.hero",
    title: "Hero Section",
    description: "The first big section of the page — badge, title, subtitle and buttons.",
    defaults: heroDefaults,
    fields: [
      { kind: "text", key: "badge", label: "Badge Text" },
      { kind: "text", key: "titleA", label: "Title (Part 1)" },
      { kind: "text", key: "titleHighlight", label: "Title Highlight (colored)" },
      { kind: "text", key: "titleB", label: "Title (Last Part)" },
      { kind: "textarea", key: "subtitle", label: "Subtitle" },
      { kind: "text", key: "primaryBtn", label: "Primary Button Text" },
      { kind: "url", key: "primaryBtnLink", label: "Primary Button Link" },
      { kind: "text", key: "secondaryBtn", label: "Secondary Button Text" },
      { kind: "url", key: "secondaryBtnLink", label: "Secondary Button Link" },
      { kind: "text", key: "rating", label: "Rating" },
      { kind: "text", key: "reviews", label: "Reviews Text" },
      { kind: "text", key: "studentsCount", label: "Students Count Text" },
      { kind: "image", key: "heroImage", label: "Hero Image (optional, replaces mockup)" },
      { kind: "text", key: "heroImageAlt", label: "Hero Image Alt Text" },
      {
        kind: "list",
        key: "avatars",
        label: "Profile Avatars",
        itemLabel: "Avatar",
        fields: [
          { kind: "text", key: "initials", label: "Initials (e.g. RH)" },
          {
            kind: "text",
            key: "color",
            label: "Color (Tailwind class)",
            hint: "e.g. bg-blue-500",
          },
        ],
      },
    ],
  },
  {
    key: "home.stats",
    title: "Stats Section",
    description: "4 numbers/statistics on a colored banner.",
    defaults: statsDefaults,
    fields: [
      {
        kind: "list",
        key: "items",
        label: "Statistics",
        itemLabel: "Stat",
        fields: [
          iconFields("icon", "Icon"),
          { kind: "text", key: "value", label: "Value (e.g. 500+)" },
          { kind: "text", key: "label", label: "Label" },
        ],
      },
    ],
  },
  {
    key: "home.tools",
    title: "Tools Bar",
    description: "A logo list of the tools we work with.",
    defaults: toolsDefaults,
    fields: [
      { kind: "text", key: "label", label: "Label" },
      {
        kind: "list",
        key: "tools",
        label: "Tools",
        itemLabel: "Tool",
        fields: [
          iconFields("icon", "Icon"),
          { kind: "text", key: "name", label: "Name" },
        ],
      },
    ],
  },
  {
    key: "home.skills",
    title: "Skills Section",
    description: "6 cards of the skills that are taught.",
    defaults: skillsDefaults,
    fields: [
      { kind: "text", key: "eyebrow", label: "Upper Label" },
      { kind: "text", key: "title", label: "Title" },
      {
        kind: "list",
        key: "items",
        label: "Skill Cards",
        itemLabel: "Card",
        fields: [
          iconFields("icon", "Icon"),
          { kind: "text", key: "title", label: "Title" },
          { kind: "text", key: "desc", label: "Description" },
        ],
      },
    ],
  },
  {
    key: "home.featured",
    title: "Featured Course",
    description: "The big best-seller course block.",
    defaults: featuredDefaults,
    fields: [
      { kind: "text", key: "badge", label: "Badge" },
      { kind: "text", key: "tagline", label: "Upper Label" },
      { kind: "text", key: "cardTop1", label: "Card Text 1" },
      { kind: "text", key: "cardTop2", label: "Card Text 2" },
      { kind: "text", key: "cardYear", label: "Card Year" },
      { kind: "text", key: "title", label: "Course Title" },
      { kind: "textarea", key: "description", label: "Description" },
      { kind: "text", key: "buttonText", label: "Button Text" },
      { kind: "url", key: "buttonLink", label: "Button Link" },
      {
        kind: "stringlist",
        key: "features",
        label: "Features List",
        itemLabel: "Feature",
      },
      {
        kind: "list",
        key: "info",
        label: "Info Row",
        itemLabel: "Row",
        fields: [
          iconFields("icon", "Icon"),
          { kind: "text", key: "label", label: "Label" },
          { kind: "text", key: "value", label: "Value" },
        ],
      },
    ],
  },
  {
    key: "home.our_courses",
    title: "Our Courses",
    description: "Grid of published courses from the database — edit the title and count.",
    defaults: ourCoursesDefaults,
    fields: [
      { kind: "text", key: "eyebrow", label: "Upper Label" },
      { kind: "text", key: "title", label: "Title" },
      { kind: "text", key: "subtitle", label: "Subtitle" },
      { kind: "text", key: "viewAllText", label: "View All Button Text" },
      { kind: "url", key: "viewAllLink", label: "View All Link" },
      { kind: "number", key: "limit", label: "How Many Courses To Show" },
    ],
  },
  {
    key: "home.why",
    title: "Why Us",
    description: "Our difference in 3 points.",
    defaults: whyDefaults,
    fields: [
      { kind: "text", key: "eyebrow", label: "Upper Label" },
      { kind: "text", key: "title", label: "Title" },
      {
        kind: "list",
        key: "items",
        label: "Points",
        itemLabel: "Point",
        fields: [
          iconFields("icon", "Icon"),
          { kind: "text", key: "title", label: "Title" },
          { kind: "text", key: "desc", label: "Description" },
        ],
      },
    ],
  },
  {
    key: "home.process",
    title: "Learning Process",
    description: "A 5-step learning journey.",
    defaults: processDefaults,
    fields: [
      { kind: "text", key: "eyebrow", label: "Upper Label" },
      { kind: "text", key: "title", label: "Title" },
      {
        kind: "list",
        key: "steps",
        label: "Steps",
        itemLabel: "Step",
        fields: [
          iconFields("icon", "Icon"),
          { kind: "text", key: "title", label: "Title" },
          { kind: "text", key: "desc", label: "Description" },
        ],
      },
    ],
  },
  {
    key: "home.live_batch",
    title: "Live Batch",
    description: "Admissions open bar + countdown + seats.",
    defaults: liveBatchDefaults,
    fields: [
      { kind: "text", key: "eyebrow", label: "Upper Label" },
      { kind: "text", key: "title", label: "Title" },
      {
        kind: "stringlist",
        key: "checks",
        label: "Benefits List",
        itemLabel: "Benefit",
      },
      {
        kind: "datetime",
        key: "deadline",
        label: "Deadline (countdown)",
        hint: "Enter in local time; the countdown will run until then",
      },
      { kind: "number", key: "seatsFilled", label: "Seats Filled" },
      { kind: "number", key: "seatsTotal", label: "Total Seats" },
      { kind: "text", key: "seatLabel", label: "Seat Label" },
      { kind: "text", key: "buttonText", label: "Button Text" },
      { kind: "url", key: "buttonLink", label: "Button Link" },
    ],
  },
  {
    key: "home.products",
    title: "Digital Products",
    description: "A grid of product cards.",
    defaults: productsDefaults,
    fields: [
      { kind: "text", key: "eyebrow", label: "Upper Label" },
      { kind: "text", key: "title", label: "Title" },
      { kind: "text", key: "viewAllText", label: "View All Button Text" },
      { kind: "url", key: "viewAllLink", label: "View All Link" },
      {
        kind: "number",
        key: "limit",
        label: "Products To Show (from database)",
        hint: "e.g. 4, 6, 8 or 12",
      },
      {
        kind: "list",
        key: "items",
        label: "Fallback Products (used only if database is empty)",
        itemLabel: "Product",
        fields: [
          { kind: "text", key: "name", label: "Name" },
          { kind: "text", key: "price", label: "Price" },
          { kind: "text", key: "oldPrice", label: "Old Price (hidden if empty)" },
          { kind: "text", key: "tag", label: "Tag" },
          iconFields("icon", "Icon"),
          {
            kind: "text",
            key: "gradient",
            label: "Gradient",
            hint: "e.g. from-blue-600 to-indigo-600",
          },
        ],
      },
    ],
  },
  {
    key: "home.testimonials",
    title: "Testimonials",
    description: "Reviews shown as a slider.",
    defaults: testimonialsDefaults,
    fields: [
      { kind: "text", key: "eyebrow", label: "Upper Label" },
      { kind: "text", key: "title", label: "Title" },
      {
        kind: "list",
        key: "items",
        label: "Reviews",
        itemLabel: "Review",
        fields: [
          { kind: "text", key: "name", label: "Name" },
          { kind: "text", key: "role", label: "Profession/Role" },
          { kind: "textarea", key: "quote", label: "Testimonial" },
          { kind: "text", key: "initials", label: "Initials" },
          {
            kind: "text",
            key: "color",
            label: "Color (Tailwind class)",
            hint: "e.g. bg-blue-500",
          },
        ],
      },
    ],
  },
  {
    key: "home.faq",
    title: "FAQ Section",
    description: "Frequently asked questions.",
    defaults: faqDefaults,
    fields: [
      { kind: "text", key: "title", label: "Title" },
      {
        kind: "number",
        key: "limit",
        label: "How Many FAQs To Show",
      },
      {
        kind: "list",
        key: "items",
        label: "Questions",
        itemLabel: "Question",
        fields: [
          { kind: "text", key: "q", label: "Question" },
          { kind: "textarea", key: "a", label: "Answer" },
        ],
      },
    ],
  },
  {
    key: "home.cta",
    title: "Final CTA Section",
    description: "The big call-to-action block at the end of the page.",
    defaults: ctaDefaults,
    fields: [
      { kind: "text", key: "eyebrow", label: "Upper Label" },
      { kind: "text", key: "title", label: "Title" },
      { kind: "text", key: "subtitle", label: "Subtitle" },
      iconFields("icon", "Icon"),
      { kind: "text", key: "buttonText", label: "Button Text" },
      { kind: "url", key: "buttonLink", label: "Button Link" },
    ],
  },
  {
    key: "about",
    title: "About Page",
    description: "Edit the About page content.",
    defaults: aboutDefaults,
    fields: [
      { kind: "text", key: "heroEyebrow", label: "Hero Upper Label" },
      { kind: "text", key: "heroTitle", label: "Hero Title" },
      {
        kind: "stringlist",
        key: "heroParagraphs",
        label: "Hero Paragraphs",
        itemLabel: "Paragraph",
      },
      { kind: "text", key: "heroPrimary", label: "Hero Primary Button" },
      { kind: "url", key: "heroPrimaryLink", label: "Hero Primary Link" },
      { kind: "text", key: "heroSecondary", label: "Hero Secondary Button" },
      { kind: "url", key: "heroSecondaryLink", label: "Hero Secondary Link" },
      { kind: "text", key: "heroVisualTitle", label: "Hero Visual Title" },
      {
        kind: "stringlist",
        key: "heroVisualStats",
        label: "Hero Visual Stats",
        itemLabel: "Stat",
      },
      {
        kind: "list",
        key: "stats",
        label: "Trust Statistics",
        itemLabel: "Statistic",
        fields: [
          { kind: "text", key: "value", label: "Value" },
          { kind: "text", key: "label", label: "Label" },
        ],
      },
      { kind: "text", key: "storyLabel", label: "Story Upper Label" },
      { kind: "text", key: "storyTitle", label: "Story Title" },
      {
        kind: "stringlist",
        key: "storyParagraphs",
        label: "Story Paragraphs",
        itemLabel: "Paragraph",
      },
      {
        kind: "list",
        key: "storyTimeline",
        label: "Story Timeline",
        itemLabel: "Event",
        fields: [
          { kind: "text", key: "year", label: "Year" },
          { kind: "text", key: "text", label: "Event" },
        ],
      },
      iconFields("missionIcon", "Mission Icon"),
      { kind: "text", key: "missionTitle", label: "Mission Title" },
      { kind: "textarea", key: "missionDesc", label: "Mission Description" },
      iconFields("visionIcon", "Vision Icon"),
      { kind: "text", key: "visionTitle", label: "Vision Title" },
      { kind: "textarea", key: "visionDesc", label: "Vision Description" },
      { kind: "text", key: "philosophyLabel", label: "Philosophy Upper Label" },
      { kind: "text", key: "philosophyTitle", label: "Philosophy Title" },
      { kind: "textarea", key: "philosophySubtitle", label: "Philosophy Subtitle" },
      {
        kind: "list",
        key: "philosophySteps",
        label: "Philosophy Steps",
        itemLabel: "Step",
        fields: [
          iconFields("icon", "Icon"),
          { kind: "text", key: "title", label: "Title" },
          { kind: "text", key: "sub", label: "Bengali Sub-title" },
          { kind: "text", key: "desc", label: "Description" },
        ],
      },
      { kind: "text", key: "whyTitle", label: "Why Title" },
      {
        kind: "list",
        key: "whyItems",
        label: "Why Cards",
        itemLabel: "Feature",
        fields: [
          iconFields("icon", "Icon"),
          { kind: "text", key: "title", label: "Title" },
          { kind: "text", key: "desc", label: "Description" },
        ],
      },
      { kind: "text", key: "teachLabel", label: "What We Teach Upper Label" },
      { kind: "text", key: "teachTitle", label: "What We Teach Title" },
      {
        kind: "list",
        key: "teachItems",
        label: "Teaching Categories",
        itemLabel: "Category",
        fields: [
          iconFields("icon", "Icon"),
          { kind: "text", key: "title", label: "Title" },
          { kind: "text", key: "desc", label: "Description" },
        ],
      },
      { kind: "text", key: "instructorsLabel", label: "Instructors Upper Label" },
      { kind: "text", key: "instructorsTitle", label: "Instructors Title" },
      {
        kind: "list",
        key: "instructors",
        label: "Instructors",
        itemLabel: "Instructor",
        fields: [
          { kind: "text", key: "name", label: "Name" },
          { kind: "text", key: "role", label: "Role" },
          {
            kind: "stringlist",
            key: "expertise",
            label: "Expertise",
            itemLabel: "Skill",
          },
          { kind: "textarea", key: "bio", label: "Bio" },
          { kind: "text", key: "initials", label: "Initials" },
          {
            kind: "text",
            key: "color",
            label: "Color (Tailwind class)",
            hint: "e.g. from-blue-600 to-indigo-600",
          },
        ],
      },
      {
        kind: "list",
        key: "credibility",
        label: "Instructor Credibility",
        itemLabel: "Stat",
        fields: [
          { kind: "text", key: "value", label: "Value" },
          { kind: "text", key: "label", label: "Label" },
        ],
      },
      { kind: "text", key: "journeyTitle", label: "Learning Experience Title" },
      {
        kind: "list",
        key: "journeySteps",
        label: "Learning Experience Steps",
        itemLabel: "Step",
        fields: [
          { kind: "text", key: "num", label: "Number" },
          { kind: "text", key: "title", label: "Title" },
          { kind: "text", key: "desc", label: "Description" },
        ],
      },
      { kind: "text", key: "impactTitle", label: "Impact Title" },
      {
        kind: "list",
        key: "impactStats",
        label: "Impact Statistics",
        itemLabel: "Statistic",
        fields: [
          { kind: "text", key: "value", label: "Value" },
          { kind: "text", key: "label", label: "Label" },
        ],
      },
      { kind: "textarea", key: "impactNote", label: "Impact Note" },
      { kind: "text", key: "successLabel", label: "Success Upper Label" },
      { kind: "text", key: "successTitle", label: "Success Title" },
      {
        kind: "list",
        key: "successStories",
        label: "Student Stories",
        itemLabel: "Story",
        fields: [
          { kind: "text", key: "name", label: "Name" },
          { kind: "text", key: "role", label: "Profession" },
          { kind: "text", key: "course", label: "Course" },
          { kind: "text", key: "tag", label: "Achievement Tag" },
          { kind: "textarea", key: "text", label: "Story" },
          { kind: "text", key: "initials", label: "Initials" },
          {
            kind: "text",
            key: "color",
            label: "Color (Tailwind class)",
            hint: "e.g. bg-blue-500",
          },
        ],
      },
      { kind: "text", key: "valuesTitle", label: "Values Title" },
      {
        kind: "list",
        key: "values",
        label: "Values",
        itemLabel: "Value",
        fields: [
          iconFields("icon", "Icon"),
          { kind: "text", key: "title", label: "Title" },
          { kind: "text", key: "desc", label: "Description" },
        ],
      },
      { kind: "text", key: "communityLabel", label: "Community Upper Label" },
      { kind: "text", key: "communityTitle", label: "Community Title" },
      { kind: "textarea", key: "communityDesc", label: "Community Description" },
      { kind: "text", key: "communityPrimary", label: "Community Primary Button" },
      { kind: "url", key: "communityPrimaryLink", label: "Community Primary Link" },
      { kind: "text", key: "communitySecondary", label: "Community Secondary Button" },
      { kind: "url", key: "communitySecondaryLink", label: "Community Secondary Link" },
      {
        kind: "list",
        key: "communityAvatars",
        label: "Community Avatars",
        itemLabel: "Avatar",
        fields: [
          { kind: "text", key: "initials", label: "Initials" },
          {
            kind: "text",
            key: "color",
            label: "Color (Tailwind class)",
            hint: "e.g. bg-blue-500",
          },
        ],
      },
      { kind: "text", key: "faqTitle", label: "FAQ Title" },
      {
        kind: "list",
        key: "faqItems",
        label: "FAQ Questions",
        itemLabel: "Question",
        fields: [
          { kind: "text", key: "q", label: "Question" },
          { kind: "textarea", key: "a", label: "Answer" },
        ],
      },
      { kind: "text", key: "ctaEyebrow", label: "CTA Upper Label" },
      { kind: "text", key: "ctaTitle", label: "CTA Title" },
      { kind: "textarea", key: "ctaSubtitle", label: "CTA Subtitle" },
      { kind: "text", key: "ctaPrimary", label: "CTA Primary Button" },
      { kind: "url", key: "ctaPrimaryLink", label: "CTA Primary Link" },
      { kind: "text", key: "ctaSecondary", label: "CTA Secondary Button" },
      { kind: "url", key: "ctaSecondaryLink", label: "CTA Secondary Link" },
    ],
  },
  {
    key: "contact",
    title: "Contact Page",
    description: "Edit the Contact page content.",
    defaults: contactDefaults,
    fields: [
      { kind: "text", key: "heroEyebrow", label: "Hero Upper Label" },
      { kind: "text", key: "heroTitle", label: "Hero Title" },
      { kind: "textarea", key: "heroSubtitle", label: "Hero Subtitle" },
      {
        kind: "list",
        key: "cards",
        label: "Quick Contact Cards",
        itemLabel: "Card",
        fields: [
          iconFields("icon", "Icon"),
          { kind: "text", key: "title", label: "Title" },
          { kind: "text", key: "value", label: "Value" },
          { kind: "text", key: "desc", label: "Description" },
          { kind: "text", key: "action", label: "Button Text" },
          { kind: "url", key: "href", label: "Link" },
        ],
      },
      { kind: "text", key: "infoLabel", label: "Info Upper Label" },
      { kind: "text", key: "infoTitle", label: "Info Heading" },
      { kind: "textarea", key: "infoDesc", label: "Info Description" },
      { kind: "text", key: "email", label: "Contact Email" },
      { kind: "text", key: "supportEmail", label: "Support Email" },
      { kind: "text", key: "phone", label: "Phone Number" },
      { kind: "text", key: "hoursTitle", label: "Hours Title" },
      {
        kind: "stringlist",
        key: "hours",
        label: "Working Hours",
        itemLabel: "Line",
      },
      { kind: "text", key: "locationTitle", label: "Location Title" },
      { kind: "text", key: "location", label: "Location" },
      { kind: "text", key: "priorityTitle", label: "Priority Support Title" },
      { kind: "textarea", key: "priorityDesc", label: "Priority Support Text" },
      { kind: "text", key: "priorityButton", label: "Priority Button Text" },
      { kind: "url", key: "priorityButtonLink", label: "Priority Button Link" },
      { kind: "text", key: "socialTitle", label: "Social Heading" },
      {
        kind: "list",
        key: "socials",
        label: "Social Links",
        itemLabel: "Social",
        fields: [
          iconFields("icon", "Icon"),
          { kind: "url", key: "href", label: "URL" },
        ],
      },
      { kind: "text", key: "formTitle", label: "Form Title" },
      { kind: "text", key: "formDesc", label: "Form Description" },
      { kind: "text", key: "successTitle", label: "Success Title" },
      { kind: "text", key: "successDesc", label: "Success Description" },
      { kind: "text", key: "helpLabel", label: "Quick Help Upper Label" },
      { kind: "text", key: "helpTitle", label: "Quick Help Heading" },
      { kind: "text", key: "helpDesc", label: "Quick Help Text" },
      { kind: "text", key: "helpPrimary", label: "Quick Help Primary Button" },
      { kind: "url", key: "helpPrimaryLink", label: "Quick Help Primary Link" },
      { kind: "text", key: "helpSecondary", label: "Quick Help Secondary Button" },
      { kind: "url", key: "helpSecondaryLink", label: "Quick Help Secondary Link" },
      { kind: "text", key: "faqTitle", label: "FAQ Title" },
      {
        kind: "list",
        key: "faqItems",
        label: "FAQ Questions",
        itemLabel: "Question",
        fields: [
          { kind: "text", key: "q", label: "Question" },
          { kind: "textarea", key: "a", label: "Answer" },
        ],
      },
      { kind: "text", key: "mapLabel", label: "Map Upper Label" },
      { kind: "text", key: "mapTitle", label: "Map Heading" },
      { kind: "text", key: "mapLocation", label: "Map Location" },
      { kind: "url", key: "mapEmbedUrl", label: "Map Embed URL" },
      { kind: "text", key: "channelsLabel", label: "Channels Upper Label" },
      { kind: "text", key: "channelsTitle", label: "Channels Heading" },
      {
        kind: "list",
        key: "channels",
        label: "Support Channels",
        itemLabel: "Channel",
        fields: [
          iconFields("icon", "Icon"),
          { kind: "text", key: "title", label: "Title" },
          { kind: "text", key: "desc", label: "Description" },
          { kind: "url", key: "href", label: "Link" },
        ],
      },
      { kind: "text", key: "ctaEyebrow", label: "CTA Upper Label" },
      { kind: "text", key: "ctaTitle", label: "CTA Title" },
      { kind: "textarea", key: "ctaSubtitle", label: "CTA Subtitle" },
      { kind: "text", key: "ctaPrimary", label: "CTA Primary Button" },
      { kind: "url", key: "ctaPrimaryLink", label: "CTA Primary Link" },
      { kind: "text", key: "ctaSecondary", label: "CTA Secondary Button" },
      { kind: "url", key: "ctaSecondaryLink", label: "CTA Secondary Link" },
    ],
  },
];

export const globalSections: SectionDef[] = [
  {
    key: "global.announcement",
    title: "Announcement Bar",
    description: "A thin bar shown above the header. Turn it on and write a short message.",
    defaults: announcementDefaults,
    fields: [
      { kind: "boolean", key: "is_enabled", label: "Show Announcement Bar" },
      { kind: "text", key: "text", label: "Message" },
      { kind: "text", key: "linkText", label: "Link Text (optional)" },
      { kind: "url", key: "link", label: "Link (optional)" },
      {
        kind: "text",
        key: "bg",
        label: "Background (Tailwind class)",
        hint: "e.g. bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600",
      },
    ],
  },
  {
    key: "global.popup",
    title: "Popup Banner",
    description: "A popup shown to visitors after a few seconds — for offers and announcements.",
    defaults: popupDefaults,
    fields: [
      { kind: "boolean", key: "is_enabled", label: "Show Popup" },
      { kind: "text", key: "title", label: "Title" },
      { kind: "textarea", key: "body", label: "Body (HTML allowed)" },
      { kind: "image", key: "image", label: "Image (optional)" },
      { kind: "text", key: "buttonText", label: "Button Text" },
      { kind: "url", key: "buttonLink", label: "Button Link" },
      { kind: "number", key: "delaySeconds", label: "Delay Before Showing (seconds)" },
      { kind: "boolean", key: "showOncePerSession", label: "Show Only Once Per Visit" },
    ],
  },
  {
    key: "global.nav",
    title: "Navigation Menu",
    description: "The header menu links.",
    defaults: navDefaults,
    fields: [
      {
        kind: "list",
        key: "links",
        label: "Menu Links",
        itemLabel: "Link",
        fields: [
          { kind: "text", key: "label", label: "Label" },
          { kind: "text", key: "href", label: "Link", hint: "e.g. /courses or /#contact" },
        ],
      },
    ],
  },
  {
    key: "global.footer",
    title: "Footer",
    description: "The bottom part of the page — contact, links, social.",
    defaults: footerDefaults,
    fields: [
      { kind: "textarea", key: "about", label: "About" },
      { kind: "text", key: "email", label: "Email" },
      { kind: "text", key: "phone", label: "Phone" },
      { kind: "text", key: "address", label: "Address" },
      { kind: "text", key: "quickLinksTitle", label: "Quick Links Title" },
      {
        kind: "list",
        key: "quickLinks",
        label: "Quick Links",
        itemLabel: "Link",
        fields: [
          { kind: "text", key: "label", label: "Label" },
          { kind: "text", key: "href", label: "Link" },
        ],
      },
      { kind: "text", key: "supportTitle", label: "Support Title" },
      {
        kind: "list",
        key: "supportLinks",
        label: "Support Links",
        itemLabel: "Link",
        fields: [
          { kind: "text", key: "label", label: "Label" },
          { kind: "text", key: "href", label: "Link" },
        ],
      },
      {
        kind: "list",
        key: "socials",
        label: "Social Links",
        itemLabel: "Social",
        fields: [
          iconFields("icon", "Icon", "e.g. fa-brands fa-facebook-f"),
          { kind: "text", key: "href", label: "Link" },
        ],
      },
      { kind: "text", key: "newsletterTitle", label: "Newsletter Title" },
      { kind: "text", key: "newsletterPlaceholder", label: "Newsletter Placeholder" },
      { kind: "text", key: "newsletterButton", label: "Newsletter Button" },
      { kind: "text", key: "copyright", label: "Copyright Text" },
      {
        kind: "stringlist",
        key: "paymentBadges",
        label: "Payment Badges",
        itemLabel: "Badge",
      },
    ],
  },
];

export const faqPageDefaults = {
  title: "Frequently Asked Questions",
  intro:
    "Find answers to common questions about enrollment, payment, courses and certificates here.",
  items: [
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
      a: "Pay via bKash or Nagad and submit the TrxID — our team verifies it and enrolls you. Enrollment is usually confirmed within 5-30 minutes.",
    },
    {
      q: "How do I enroll in the course?",
      a: "Click the 'Enroll Now' button on the course page, create an account and complete the payment to finish enrolling. Our support team can help if needed.",
    },
  ],
};
export type FaqPageContent = typeof faqPageDefaults;

export const legalPageDefaults = {
  title: "",
  intro: "",
  updated: "",
  sections: [] as { heading: string; body: string }[],
};
export type LegalPageContent = typeof legalPageDefaults;

export const termsPageDefaults: LegalPageContent = {
  title: "Terms & Conditions",
  intro:
    "Please read the following terms carefully before using Plickify Academy. By using this website, you agree to these terms.",
  updated: "Last updated: January 2026",
  sections: [
    {
      heading: "1. Account & Enrollment",
      body: "You must create a valid account to enroll in a course. Enrollment may be cancelled if a student creates multiple accounts to share or resell courses.",
    },
    {
      heading: "2. Payment",
      body: "Course fees must be paid via bKash or Nagad. Enrollment is confirmed only after the payment is verified. Contact our support team for any incorrect transaction.",
    },
    {
      heading: "3. Content Usage",
      body: "Course videos, resources and content are for personal learning only. Downloading, sharing or reselling any content is strictly prohibited.",
    },
    {
      heading: "4. Code of Conduct",
      body: "Be respectful in the course forum, Q&A and community. An account may be banned for disrespectful or harmful behavior toward other students.",
    },
    {
      heading: "5. Changes to Terms",
      body: "We may change these terms at any time. Using the website after a change means the new terms apply.",
    },
  ],
};

export const privacyPageDefaults: LegalPageContent = {
  title: "Privacy Policy",
  intro:
    "The security of your personal information matters to us. Below is how we collect and use your information.",
  updated: "Last updated: January 2026",
  sections: [
    {
      heading: "1. What Information We Collect",
      body: "We collect your name, email, mobile number and course progress information, which is needed to create an account and manage courses.",
    },
    {
      heading: "2. How Information Is Used",
      body: "The collected information is used to manage your account, verify payments, issue certificates and provide a better learning experience.",
    },
    {
      heading: "3. Information Security",
      body: "Your information is stored on secure servers. We use modern security measures to keep your information protected.",
    },
    {
      heading: "4. Information Sharing",
      body: "We do not sell your personal information to any third party. Information is provided to authorities only when required by law.",
    },
    {
      heading: "5. Contact",
      body: "Contact us by email for any privacy-related questions.",
    },
  ],
};

export const refundPageDefaults: LegalPageContent = {
  title: "Refund Policy",
  intro:
    "The refund terms after enrollment are given below. Please read carefully before purchasing.",
  updated: "Last updated: January 2026",
  sections: [
    {
      heading: "1. Within 7 Days of Enrollment",
      body: "You may request a full refund if you have not completed any lesson within 7 days of enrollment. Refunds are returned via the payment method used.",
    },
    {
      heading: "2. When Refunds Are Not Available",
      body: "Refunds are not given after completing multiple lessons, once a certificate has been issued, or after 30 days from payment.",
    },
    {
      heading: "3. Incorrect Transactions",
      body: "If you paid to the wrong number, contact our support team with the transaction ID and we will verify and arrange a return.",
    },
    {
      heading: "4. Refund Processing",
      body: "After approval, refunds are returned via the payment method within 3-7 working days.",
    },
  ],
};

export const coursePageDefaults = {
  highlights: [
    { icon: "fa-solid fa-video", title: "25+ Live Classes" },
    { icon: "fa-solid fa-infinity", title: "Lifetime Access" },
    { icon: "fa-solid fa-users", title: "VIP Community" },
    { icon: "fa-solid fa-rotate", title: "Future Updates" },
    { icon: "fa-solid fa-gift", title: "Premium Resource Pack" },
  ],
  descriptionHeading: "About AI Income Mastery 2026",
  description:
    "AI Income Mastery 2026 is a complete practical course on AI, Microstock, Freelancing, Content Creation, Digital Business and Vibe Coding. It is not just theory — every lesson teaches through real work, live classes and practical assignments. By the end of the course you will be able to work efficiently with AI tools, start earning from microstock and freelancing, and build AI-powered digital projects.",
  whoFor: [
    { icon: "fa-solid fa-seedling", title: "Beginner", desc: "New to AI — unsure where to start" },
    { icon: "fa-solid fa-briefcase", title: "Freelancer", desc: "Want to grow your freelancing income further" },
    { icon: "fa-solid fa-graduation-cap", title: "Student", desc: "Want to build a career with digital skills" },
    { icon: "fa-solid fa-pen-nib", title: "Content Creator", desc: "Want to create AI-powered content" },
    { icon: "fa-solid fa-rocket", title: "Aspiring Entrepreneur", desc: "Want to start a digital business" },
    { icon: "fa-solid fa-laptop-code", title: "Digital Skill Learner", desc: "Interested in learning new digital skills" },
  ],
  outcomeTitle: "What You Will Be Able To Do After This Course?",
  outcomeSubtitle: "Not just learning — move forward on the path of real work and income.",
  outcome: [
    "Use AI tools efficiently",
    "Build a microstock workflow",
    "Start a freelancing service",
    "Create AI-powered content",
    "Build a digital business model",
    "Build websites/projects with AI",
  ],
  instructorName: "Md. Minhajul Islam",
  instructorRole: "AI & Digital Skills Trainer",
  instructorDescription:
    "Years of working experience in AI, Microstock, Freelancing and Digital Marketing. Has guided hundreds of students toward AI-powered income. Every lesson in the course is taught from real experience.",
  instructorImage: "",
  instructorFacebook: "#",
  instructorYoutube: "#",
  instructorLinkedin: "#",
  discountLabel: "50% OFF",
  secureText: "Secure Payment · Instant Enrollment · Lifetime Course Access",
  pricingNote: "One-time fee — no hidden charges",
  faqTitle: "Frequently Asked Questions",
  faqItems: [
    { q: "Who is this course for?", a: "This course is for everyone who wants to learn AI, Microstock, Freelancing and Digital Business — students, freelancers, content creators and entrepreneurs." },
    { q: "What is the duration of the course?", a: "You can complete the course at your own pace. With recorded lessons you can watch anytime, anywhere." },
    { q: "Are there live classes?", a: "Yes, the course has regular live classes. If you miss a live class, you get the recording." },
    { q: "Will I get class recordings?", a: "Yes, the recording of every live class will be in your dashboard." },
    { q: "How long is the course access?", a: "Once enrolled, you have lifetime course access — including all future updates." },
    { q: "How do I get the course after payment?", a: "Pay via bKash/Nagad and submit the TrxID — our team verifies and enrolls you within 5-30 minutes." },
    { q: "Is there any support/community?", a: "Yes, you get direct instructor support through the VIP community and weekly Q&A sessions." },
    { q: "What if I am a beginner?", a: "No problem at all — the course is arranged from beginner to advanced level, so even starting from zero you can become skilled." },
  ],
  ctaTitle: "Start Your AI & Digital Income Journey Today 🚀",
  ctaSubtitle: "Seats are limited — enroll today and start your digital career.",
  ctaButtonText: "Enroll Now",
};
export type CoursePageContent = typeof coursePageDefaults;

export const courseContentFields: FieldDef[] = [
  {
    kind: "list",
    key: "highlights",
    label: "Course Highlights",
    itemLabel: "Highlight",
    fields: [
      iconFields("icon", "Icon"),
      { kind: "text", key: "title", label: "Title" },
    ],
  },
  { kind: "text", key: "descriptionHeading", label: "Description Heading" },
  { kind: "textarea", key: "description", label: "Detailed Description" },
  {
    kind: "list",
    key: "whoFor",
    label: "Who This Course Is For",
    itemLabel: "Card",
        fields: [
          iconFields("icon", "Icon"),
          { kind: "text", key: "title", label: "Title" },
          { kind: "text", key: "desc", label: "Description" },
          { kind: "url", key: "link", label: "Link (optional)" },
        ],
  },
  { kind: "text", key: "outcomeTitle", label: "Outcome Title" },
  { kind: "text", key: "outcomeSubtitle", label: "Outcome Subtitle" },
  {
    kind: "stringlist",
    key: "outcome",
    label: "Outcome Points",
    itemLabel: "Point",
  },
  { kind: "text", key: "instructorName", label: "Instructor Name" },
  { kind: "text", key: "instructorRole", label: "Instructor Role" },
  { kind: "textarea", key: "instructorDescription", label: "Instructor Description" },
  { kind: "image", key: "instructorImage", label: "Instructor Image" },
  { kind: "url", key: "instructorFacebook", label: "Facebook Link" },
  { kind: "url", key: "instructorYoutube", label: "YouTube Link" },
  { kind: "url", key: "instructorLinkedin", label: "LinkedIn Link" },
  { kind: "text", key: "discountLabel", label: "Discount Badge" },
  { kind: "text", key: "secureText", label: "Secure Payment Text" },
  { kind: "text", key: "pricingNote", label: "Pricing Note" },
  { kind: "text", key: "faqTitle", label: "FAQ Title" },
  {
    kind: "list",
    key: "faqItems",
    label: "FAQ Questions",
    itemLabel: "Question",
    fields: [
      { kind: "text", key: "q", label: "Question" },
      { kind: "textarea", key: "a", label: "Answer" },
    ],
  },
  { kind: "text", key: "ctaTitle", label: "Final CTA Title" },
  { kind: "textarea", key: "ctaSubtitle", label: "Final CTA Subtitle" },
  { kind: "text", key: "ctaButtonText", label: "Final CTA Button Text" },
];

export const pageSections: SectionDef[] = [
  {
    key: "page.course",
    title: "Course Detail Page",
    description:
      "Edit the course page highlights, description, who-for, outcome, instructor, pricing and FAQ. The curriculum and lessons come from the database.",
    defaults: coursePageDefaults,
    fields: courseContentFields,
  },
  {
    key: "page.faq",
    title: "FAQ Page",
    description: "The page for the FAQ link in the footer — edit the questions and answers.",
    defaults: faqPageDefaults,
    fields: [
      { kind: "text", key: "title", label: "Title" },
      { kind: "textarea", key: "intro", label: "Introduction" },
      {
        kind: "list",
        key: "items",
        label: "Questions",
        itemLabel: "Question",
        fields: [
          { kind: "text", key: "q", label: "Question" },
          { kind: "textarea", key: "a", label: "Answer" },
        ],
      },
    ],
  },
  {
    key: "page.terms",
    title: "Terms & Conditions Page",
    description: "Terms — edit the title, introduction and sections.",
    defaults: termsPageDefaults,
    fields: [
      { kind: "text", key: "title", label: "Title" },
      { kind: "textarea", key: "intro", label: "Introduction" },
      { kind: "text", key: "updated", label: "Updated Date Text" },
      {
        kind: "list",
        key: "sections",
        label: "Sections",
        itemLabel: "Section",
        fields: [
          { kind: "text", key: "heading", label: "Heading" },
          { kind: "textarea", key: "body", label: "Body" },
        ],
      },
    ],
  },
  {
    key: "page.privacy",
    title: "Privacy Policy Page",
    description: "Privacy policy — edit the title, introduction and sections.",
    defaults: privacyPageDefaults,
    fields: [
      { kind: "text", key: "title", label: "Title" },
      { kind: "textarea", key: "intro", label: "Introduction" },
      { kind: "text", key: "updated", label: "Updated Date Text" },
      {
        kind: "list",
        key: "sections",
        label: "Sections",
        itemLabel: "Section",
        fields: [
          { kind: "text", key: "heading", label: "Heading" },
          { kind: "textarea", key: "body", label: "Body" },
        ],
      },
    ],
  },
  {
    key: "page.refund",
    title: "Refund Policy Page",
    description: "Refund policy — edit the title, introduction and sections.",
    defaults: refundPageDefaults,
    fields: [
      { kind: "text", key: "title", label: "Title" },
      { kind: "textarea", key: "intro", label: "Introduction" },
      { kind: "text", key: "updated", label: "Updated Date Text" },
      {
        kind: "list",
        key: "sections",
        label: "Sections",
        itemLabel: "Section",
        fields: [
          { kind: "text", key: "heading", label: "Heading" },
          { kind: "textarea", key: "body", label: "Body" },
        ],
      },
    ],
  },
];

export const allSections = [...homeSections, ...globalSections, ...pageSections];

export function findSection(key: string): SectionDef | undefined {
  return allSections.find((s) => s.key === key);
}

// ============================================================
// HOMEPAGE SECTION MANAGER (order + visibility)
// ============================================================
export const homeSectionLabels: Record<string, string> = Object.fromEntries(
  homeSections.map((s) => [s.key, s.title]),
);

export const sectionsMetaDefaults = {
  order: homeSections.map((s) => s.key),
  hidden: [] as string[],
  devices: {} as Record<
    string,
    { desktop: boolean; tablet: boolean; mobile: boolean }
  >,
};

export type SectionsMeta = typeof sectionsMetaDefaults;

// ============================================================
// CUSTOM HOMEPAGE SECTIONS (admin-created, rich text)
// ============================================================
export const customSectionsDefaults = {
  items: [] as {
    id: string;
    title: string;
    eyebrow: string;
    body: string;
    visible: boolean;
  }[],
};

export type CustomSectionsContent = typeof customSectionsDefaults;
