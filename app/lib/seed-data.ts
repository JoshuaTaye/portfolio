/**
 * Portfolio content — projects, experience, metrics, skills, and contact.
 * Update the values below with your actual data.
 */

export type Project = {
  id: string;
  title: string;
  description: string;
  /** Longer narrative shown in the project modal, beneath the tagline. */
  overview?: string;
  tags: string[];
  href: string;
  image?: string;
  links?: { label: string; href: string }[];
  gallery?: string[];
  role?: string;
  challenge?: string;
  solution?: string;
  metrics?: { label: string; value: string }[];
  highlights?: string[];
};

export const projects: Project[] = [
  {
    id: "1",
    title: "goGerami",
    description:
      "Multi-vendor gift marketplace connecting the Ethiopian diaspora to local vendors — browse gifts, events, and services, checkout in USD or ETB, and track delivery.",
    overview:
      "goGerami (formerly Zembil) is a full-stack marketplace built for the Ethiopian diaspora who want to send meaningful gifts, book event tickets, and support local vendors back home. The platform pairs a Spring Boot REST API with a React and TypeScript client, handling everything from product discovery and cart management to vendor payouts and delivery logistics. I worked across the stack — designing the multi-currency payment abstraction (Stripe for USD, Chapa and Telebirr for ETB), building the vendor onboarding and commission system, and shipping the event ticketing and custom-order workflows that let customers request bespoke gifts.",
    tags: ["Java", "Spring Boot", "React", "TypeScript", "PostgreSQL", "Stripe", "Chapa"],
    href: "https://go-zembil-frontend.vercel.app",
    image: "/gogerami.png",
    links: [{ label: "Live app", href: "https://go-zembil-frontend.vercel.app" }],
    role: "Full-Stack Developer",
    challenge:
      "Diaspora customers needed a reliable way to send gifts, book events, and pay local vendors across currencies and payment rails (Stripe, Chapa, Telebirr), while vendors needed tools to manage products, events, and payouts.",
    solution:
      "Built a Spring Boot API and React/TypeScript client covering catalog, cart, multi-currency checkout, vendor onboarding and payouts, event ticketing, custom orders, and an admin dashboard for platform operations.",
    highlights: [
      "Multi-vendor marketplace with onboarding, payouts, and commission handling",
      "Multi-currency checkout via Stripe, Chapa, and Telebirr",
      "Event ticketing, custom orders, and delivery assignment workflows",
      "JWT + OAuth2 authentication with role-based admin access",
      "Admin dashboard for platform-wide analytics, tax zones, and delivery management",
    ],
  },
  {
    id: "2",
    title: "Bilal Community Platform",
    description:
      "Community membership platform for an Australian Muslim organization — manage memberships, events, donations, and fundraising campaigns with Stripe-powered payments.",
    overview:
      "Bilal Community Platform is the operational backbone for an Australian Muslim community organization, replacing spreadsheets and manual processes with a proper membership system. Members register, verify via OTP, and pay recurring dues through Stripe; admins manage events, track donations, and run fundraising campaigns from a single dashboard. I built the Spring Boot API end-to-end — the OTP authentication flow, Liquibase-managed schema, Stripe billing integration with automated grace-period reminders, and the role-based permission system that powers the admin and member portals.",
    tags: ["Java", "Spring Boot", "PostgreSQL", "Liquibase", "Stripe", "Twilio"],
    href: "https://bilalcommunity.com.au",
    image: "/gogerami.png",
    links: [
      { label: "Live site", href: "https://bilalcommunity.com.au" },
      { label: "API", href: "https://api.bilalcommunity.com.au" },
    ],
    role: "Full-Stack Developer",
    challenge:
      "A growing community organization relied on manual processes for member registration, event coordination, and financial tracking — resulting in low engagement and poor transparency across membership tiers.",
    solution:
      "Built a Spring Boot API with OTP-based auth, Stripe membership checkout, event ticketing with check-in, recurring donations, fundraising campaigns, and a CMS for news and community content.",
    highlights: [
      "OTP-based dual-channel auth (email + SMS) with JWT refresh token rotation",
      "Stripe integration for memberships, donations, and recurring giving",
      "Event ticketing with admin check-in and member/guest registration",
      "DB-driven RBAC with configurable membership payment grace periods",
      "Automated child-aging and discount-expiry scheduled jobs",
    ],
  },
  {
    id: "3",
    title: "BSIS",
    description:
      "Blood Safety Information System tracking donated blood from collection through testing, storage, and transfusion — replacing paper-based workflows at blood banks in developing countries.",
    overview:
      "BSIS (Blood Safety Information System) is a healthcare platform that tracks blood from the moment it's donated through testing, processing, and transfusion at hospitals — originally built for blood banks in developing countries with unreliable connectivity. I contributed to the backend split between a dedicated OAuth2 identity server and a core API that models the full donation lifecycle: donor eligibility, component processing, TTI testing, inventory, and transfusion requests. The system uses multi-tenant PostgreSQL schemas, RabbitMQ-driven analytics events, and Hibernate Envers for a complete audit trail — production-grade requirements for a system handling sensitive medical data.",
    tags: ["Java", "Spring Boot", "OAuth2", "PostgreSQL", "RabbitMQ", "Liquibase"],
    href: "",
    image: "/gogerami.png",
    role: "Backend Developer",
    challenge:
      "Blood banks in low-connectivity regions managed donations, testing, and inventory on paper — causing data loss, delayed reporting, and no audit trail across the donation-to-transfusion lifecycle.",
    solution:
      "Contributed to a split microservice architecture with an OAuth2 identity server and a core blood-bank API covering donations, component processing, testing, inventory, transfusions, and analytics fed by RabbitMQ domain events.",
    highlights: [
      "OAuth2 authorization server with PKCE for web and mobile clients",
      "Multi-tenant PostgreSQL with schema-per-tenant connection routing",
      "Full donation-to-transfusion lifecycle with ISBT-128 labeling",
      "Event-driven analytics via RabbitMQ and Hibernate Envers audit trail",
      "Hospital/usage-site interface for transfusion requests and blood inventory",
    ],
  },
  {
    id: "4",
    title: "Fund-ly",
    description:
      "AI-driven crowd investment platform connecting entrepreneurs and investors — project submission, KYC verification, milestone-based funding, and real-time collaboration.",
    overview:
      "Fund-ly is an AI-assisted crowd-investment platform that connects entrepreneurs raising capital with investors looking to fund early-stage ventures. Entrepreneurs submit projects with milestones and documentation, investors get AI-generated credibility scores and personalized recommendations, and both sides negotiate through NDAs, pledges, and a real-time chat before funds move via Chapa. I worked on the backend's verification pipeline (OCR, face match, and liveness checks for KYC), the milestone-based funding engine, and the WebSocket chat that lets investors and entrepreneurs communicate directly inside the platform.",
    tags: ["Java", "Spring Boot", "PostgreSQL", "JWT", "WebSocket", "Chapa"],
    href: "https://fund-ly.app",
    image: "/gogerami.png",
    links: [
      { label: "Live app", href: "https://fund-ly.app" },
      {
        label: "Repo",
        href: "https://github.com/Crowd-Investment-Platform/Backend",
      },
    ],
    role: "Backend Developer",
    challenge:
      "Entrepreneurs in emerging markets lacked a trusted platform to raise capital with proper investor verification, legal agreements, and milestone-based fund disbursement.",
    solution:
      "Built a Spring Boot monolith with entrepreneur/investor verification pipelines (OCR, face match, liveness), Chapa payment integration, AI-powered credibility scoring, NDAs, milestone automation, and WebSocket chat.",
    highlights: [
      "KYC verification pipeline with OCR, face match, and liveness detection",
      "Chapa payment gateway with entrepreneur subaccount onboarding",
      "AI credibility scoring and pgvector-backed investor recommendations",
      "Real-time investor-entrepreneur chat via WebSocket",
      "Google OAuth2 login plus JWT refresh-token authentication",
    ],
  },
  {
    id: "5",
    title: "ECP Registration Bot",
    description:
      "Telegram bot automating course registration for Ethio College Prep — collects student info, validates discount codes, uploads payment receipts, and issues one-time group invite links.",
    overview:
      "The ECP Registration Bot automates course enrollment for Ethio College Prep entirely inside Telegram, replacing a manual, spreadsheet-driven signup process. Prospective students chat with the bot to submit their details, apply an ambassador discount code, upload a payment receipt, and instantly receive a one-time invite link to the correct course group — whether that's an online cohort or an in-person location like Bole or BITS College. I built the full conversational state machine with Telegraf, wired up Cloudinary for receipt storage, and set up the Express webhook server used in production.",
    tags: ["Node.js", "Telegraf", "Express", "MongoDB", "Cloudinary"],
    href: "",
    image: "/gogerami.png",
    role: "Backend Developer",
    challenge:
      "A college prep company processed hundreds of course registrations manually via spreadsheets and messaging — slow, error-prone, and unable to validate ambassador discount codes or payment receipts at scale.",
    solution:
      "Built a Telegraf-powered Telegram bot with a multi-step registration state machine, Cloudinary receipt uploads, ambassador discount validation, and automated one-time invite link generation per course location.",
    highlights: [
      "Multi-step conversational registration flow via Telegram",
      "Ambassador discount code validation across 80+ codes",
      "Payment receipt upload and storage via Cloudinary",
      "Automated one-time Telegram group invite links per location",
      "Express webhook server for production-grade Telegram delivery",
    ],
  },
  {
    id: "6",
    title: "Ethio College Prep Web",
    description:
      "Marketing and enrollment website for Ethio College Prep — SAT, IELTS, and college counseling programs with course pages, blog, and an admin CMS for content management.",
    overview:
      "The Ethio College Prep website is the public face of the company's SAT, IELTS, and college counseling programs — course pages, a blog, and online registration all built on Next.js. Behind the scenes, an admin CMS protected with NextAuth lets non-technical staff manage tutors, testimonials, FAQs, and scholarship announcements without touching code. I built the registration API routes backed by MongoDB, the admin authentication flow, and the Cloudinary-powered media pipeline used across the course and blog pages.",
    tags: ["Next.js", "TypeScript", "MongoDB", "NextAuth", "Tailwind"],
    href: "https://www.ethiocollegeprep.com",
    image: "/gogerami.png",
    links: [{ label: "Live site", href: "https://www.ethiocollegeprep.com" }],
    role: "Full-Stack Developer",
    challenge:
      "A college prep company needed a professional web presence to showcase programs, handle online registrations, and let admins manage tutors, blogs, and testimonials without developer involvement.",
    solution:
      "Built a Next.js site with course landing pages, registration API routes, NextAuth admin authentication, and a CMS for blogs, FAQs, testimonials, tutors, and scholarship awards — deployed on Vercel.",
    highlights: [
      "Course pages for SAT, IELTS, CAC, summer school, and counseling programs",
      "Registration API routes with MongoDB persistence",
      "Admin CMS for blogs, FAQs, testimonials, and tutor profiles",
      "NextAuth authentication with Vercel Analytics integration",
      "Vercel deployment with automated build hooks on content updates",
    ],
  },
];

export const aboutText = `I'm a full-stack developer who ships production systems end-to-end — Spring Boot APIs handling real payments and data, paired with React and Next.js interfaces people actually use, for clients from Ethiopia to Australia.`;

export type Skill = {
  id: string;
  label: string;
  items: string[];
};

export const skillCategories: Skill[] = [
  {
    id: "frontend",
    label: "Frontend",
    items: [
      "React",
      "Angular",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Framer Motion",
    ],
  },
  {
    id: "backend",
    label: "Backend",
    items: [
      "Node.js",
      "Spring Boot",
      "PostgreSQL",
      "MongoDB",
      "GraphQL",
      "REST APIs",
      "Prisma",
    ],
  },
  {
    id: "devops",
    label: "DevOps & Tools",
    items: ["Docker", "GitHub Actions", "Vercel", "Linux", "Nginx", "CI/CD"],
  },
  {
    id: "practices",
    label: "Practices",
    items: [
      "System Design",
      "Testing",
      "Accessibility",
      "Performance Optimization",
      "Agile",
    ],
  },
];

export type Experience = {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
  technologies: string[];
};

export const experiences: Experience[] = [
  {
    id: "exp-1",
    company: "Freelance / Contract",
    role: "Full-Stack Developer",
    period: "2024 – Present",
    description:
      "Building production web applications for clients across education, logistics, and community sectors. End-to-end delivery from architecture to deployment.",
    technologies: ["Next.js", "TypeScript", "PostgreSQL", "Docker", "Vercel"],
  },
  {
    id: "exp-2",
    company: "Go Gerami",
    role: "Lead Frontend Developer",
    period: "2023 – 2024",
    description:
      "Led frontend development for a ride-hailing platform. Built real-time GPS tracking, offline-first PWA architecture, and responsive mobile-first interfaces.",
    technologies: ["React", "Node.js", "MongoDB", "Socket.io", "PWA"],
  },
  {
    id: "exp-3",
    company: "Community Projects",
    role: "Full-Stack Developer",
    period: "2022 – 2023",
    description:
      "Developed community platforms and internal tools using Java/Spring Boot and Angular. Managed databases, authentication, and deployment infrastructure.",
    technologies: ["Angular", "Spring Boot", "PostgreSQL", "JWT", "Liquibase"],
  },
];

export type MetricHighlight = {
  label: string;
  value: string;
  description: string;
};

export const metricsOverview: MetricHighlight[] = [
  {
    label: "API Performance",
    value: "< 150ms",
    description: "p95 response time across production APIs",
  },
  {
    label: "Records Processed",
    value: "10K+",
    description: "Student and project records managed in production",
  },
  {
    label: "Uptime",
    value: "99.8%",
    description: "Average deployment uptime across hosted projects",
  },
  {
    label: "Load Time",
    value: "< 1.5s",
    description: "Largest Contentful Paint on production apps",
  },
];

export const resumeUrl = "/resume.pdf";

export const contact = {
  email: "tayejoshua4@gmail.com",
  phone: "+251943015328",
  links: [
    { label: "GitHub", href: "https://github.com/JoshuaTaye" },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/joshua-alemayehu-71a454227",
    },
    { label: "Instagram", href: "https://www.instagram.com/joshua_taye/" },
  ],
};
