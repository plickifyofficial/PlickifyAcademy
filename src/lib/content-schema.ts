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
  titleA: "Start Your",
  titleHighlight: "Digital Career",
  titleB: "with AI",
  subtitle:
    "Build your digital career by learning AI Skills, Freelancing, Passive Income and Real-World Projects.",
  primaryBtn: "Get Started Now",
  primaryBtnLink: "/signup",
  secondaryBtn: "Browse Courses",
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
  title: "Every Skill You Need for Your Future",
  items: [
    { icon: "fa-solid fa-brain", title: "AI Productivity", desc: "Learn to work smarter using AI tools." },
    { icon: "fa-solid fa-briefcase", title: "Freelancing", desc: "Learn online marketplaces and client work." },
    { icon: "fa-solid fa-chart-line", title: "Passive Income", desc: "Digital assets and online income strategies." },
    { icon: "fa-solid fa-palette", title: "Graphic Design", desc: "Modern graphic design powered by AI." },
    { icon: "fa-solid fa-bullhorn", title: "Digital Marketing", desc: "Marketing, ads and audience growth." },
    { icon: "fa-solid fa-globe", title: "Web & Tech", desc: "Modern web and digital technology." },
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
  viewAllLink: "/products",
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
    { label: "Live Batch", href: "/live-batch" },
    { label: "Digital Products", href: "/products" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
};
export type NavContent = typeof navDefaults;

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
    { label: "Digital Products", href: "/products" },
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
        kind: "list",
        key: "items",
        label: "Products",
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
];

export const globalSections: SectionDef[] = [
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
};
export type CoursePageContent = typeof coursePageDefaults;

export const pageSections: SectionDef[] = [
  {
    key: "page.course",
    title: "Course Detail Page",
    description:
      "Edit the course page highlights, description, who-for, outcome, instructor, pricing and FAQ. The curriculum and lessons come from the database.",
    defaults: coursePageDefaults,
    fields: [
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
    ],
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
