/**
 * Portfolio content — hero, projects, experience, skills, education and contact.
 * Every number here should be something you can explain and back up in an interview.
 */

export type Testimonial = {
  quote: string;
  author: string;
  /** Who the author is, without naming a client that hasn't agreed to be named. */
  context: string;
};

export type Project = {
  id: string;
  title: string;
  /** One-line summary shown on cards. */
  description: string;
  /** Longer narrative shown in the project modal, beneath the tagline. */
  overview?: string;
  tags: string[];
  href: string;
  image?: string;
  links?: { label: string; href: string }[];
  /** Shown instead of links for private client work. */
  linkNote?: string;
  gallery?: string[];
  role?: string;
  period?: string;
  challenge?: string;
  solution?: string;
  /** The key technical decision and why — what reviewers look for. */
  decision?: string;
  metrics?: { label: string; value: string }[];
  highlights?: string[];
  testimonial?: Testimonial;
  /** Featured projects get full cards; the rest are listed under "More projects". */
  featured: boolean;
};

const medRouteReview: Testimonial = {
  quote:
    "Joshua was easy to work with. He understood what we needed, suggested a clear way to get there, and delivered on time. Communication was good throughout, and he was quick to reply when we had questions. The work was solid and well organized. Would definitely hire him again.",
  author: "Upwork client",
  context: "US healthcare logistics company · MedRoute",
};

export const projects: Project[] = [
  {
    id: "medroute",
    title: "MedRoute",
    description:
      "Real-time courier platform for medical samples — live dispatch, driver GPS tracking and a chain-of-custody audit trail between clinics, labs and a warehouse.",
    overview:
      "MedRoute replaces phone calls, WhatsApp location pins and spreadsheets for a US healthcare logistics company that moves medical samples and cold packages between clinics, labs and a central warehouse. I built the MVP solo as a freelance project: a Spring Boot 3.5 / Java 21 API with STOMP WebSockets, a React 19 + TypeScript front end with Leaflet maps, and a Flyway-managed PostgreSQL schema — shipped on time as a single Docker image ready for staging and production.",
    tags: ["Java 21", "Spring Boot", "WebSocket", "React", "TypeScript", "PostgreSQL", "Leaflet", "Docker"],
    href: "",
    image: "/medroute-dispatch.webp",
    gallery: ["/medroute-driver.webp", "/medroute-tracking.webp"],
    linkNote: "Private client work — screenshots show fictional demo data. Happy to walk through the code and a live demo on a call.",
    role: "Solo Full-Stack Developer · Freelance",
    period: "Sep 2026",
    challenge:
      "Dispatchers coordinated urgent sample pickups by phone and chat, with no live view of drivers, no record of who handled a sample, and no warning when a cold package left its temperature range.",
    solution:
      "One system with four role-based apps — a dispatcher console with a live map and job board, a mobile-web driver app that streams GPS, a clinic portal for pickup requests, and a public tracking page — on top of a strict job lifecycle with an append-only custody log.",
    decision:
      "Every status change writes an append-only custody event (who, when, GPS position, temperature) instead of overwriting the job. Clinics get an audit trail they can trust, late jobs and temperature excursions become simple queries, and the API rejects invalid transitions with a 409 — with optimistic locking so two dispatchers can't overwrite each other.",
    metrics: [
      { value: "Solo", label: "Built end to end" },
      { value: "On time", label: "Delivered to the client" },
      { value: "4", label: "Role-based apps" },
      { value: "5 s", label: "Live GPS updates" },
    ],
    highlights: [
      "Live dispatcher map and job board over STOMP WebSockets, with KPIs for unassigned, late and temperature-alert jobs",
      "Driver mobile web app: GPS every 5 seconds, next stop with ETA, one-tap navigation and proof of delivery",
      "Server-enforced access control — clinics see only jobs touching their site, drivers only their own",
      "Temperature classes with automatic excursion flags, and SLA deadlines from priority (STAT 1 h, urgent 2 h, routine 4 h)",
      "Public tracking links secured by an unguessable 16-character code that exposes no personal data",
      "One Docker image (React served by Spring Boot), Flyway migrations, and a demo simulator for client walkthroughs",
    ],
    testimonial: medRouteReview,
    featured: true,
  },
  {
    id: "gogerami",
    title: "goGerami",
    description:
      "Multi-vendor gift marketplace connecting the Ethiopian diaspora to local vendors — browse gifts, events and services, check out in USD or ETB, and track delivery.",
    overview:
      "goGerami (formerly Zembil) is a marketplace for the Ethiopian diaspora to send meaningful gifts, book event tickets and support local vendors back home. I lead development across the stack — a Spring Boot 3 / Java 21 API, a React + TypeScript client and a Liquibase-managed PostgreSQL schema — covering product discovery, multi-currency checkout, vendor onboarding and payouts, event ticketing, custom orders, delivery and an admin back office.",
    tags: ["Java 21", "Spring Boot", "React", "TypeScript", "PostgreSQL", "Stripe", "Chapa", "Prometheus"],
    href: "https://gogerami.com",
    image: "/gogerami.webp",
    links: [{ label: "Live site", href: "https://gogerami.com" }],
    role: "Lead Full-Stack Developer",
    period: "Nov 2025 – Present",
    challenge:
      "Diaspora customers needed a reliable way to send gifts, book events and pay local vendors across currencies and payment rails, while vendors needed tools to manage products, events and payouts.",
    solution:
      "A Spring Boot API and React/TypeScript client covering catalog, cart, multi-currency checkout, vendor onboarding and payouts, event ticketing, custom orders, delivery assignment and an admin dashboard for platform operations.",
    decision:
      "Checkout is split into two phases: an idempotent order API first creates a fully priced order, then a separate step initializes payment with Stripe (USD) or Chapa (ETB) and a confirmation flow built for provider webhooks completes it. A retried request or dropped connection can't create duplicate orders, and adding a payment rail doesn't touch order logic.",
    metrics: [
      { value: "560+", label: "REST endpoints" },
      { value: "80+", label: "Database tables" },
      { value: "USD + ETB", label: "Multi-currency pricing" },
      { value: "10", label: "Alert rules → Slack" },
    ],
    highlights: [
      "Two-phase checkout: idempotent order APIs, then Stripe (USD) or Chapa / Telebirr (ETB) payment",
      "Multi-currency pricing that creates and validates USD and ETB prices for every product and SKU",
      "Liquibase-managed PostgreSQL schema (80+ tables) with rollback-tested migrations across local, Neon and Render",
      "React + Vite client with Zustand, React Query and Radix UI for customers, vendors, admins and delivery staff",
      "Prometheus and Alertmanager monitoring with 10 alert rules routed to Slack",
    ],
    featured: true,
  },
  {
    id: "aebis",
    title: "AEBIS",
    description:
      "Adin Ethiopian Blood Information System — the national platform tracking donors, donations, testing, inventory and transfusions across Ethiopia's blood banks and hospitals.",
    overview:
      "AEBIS (Adin Ethiopian Blood Information System) is the modernized platform for blood services in Ethiopia, built by HABTech with the Ethiopian Blood and Tissue Bank Service. It replaces a legacy system with a multi-tenant Spring Boot platform behind three apps: ADIN for blood-bank staff, a facility web app for hospitals, and Adagn, the donor mobile app. On the backend team I built the donor lifecycle, the notification platform, plasma and tissue workflows, and the hospital order and transfusion flows.",
    tags: ["Java", "Spring Boot", "OAuth2", "PostgreSQL", "RabbitMQ", "Liquibase"],
    href: "",
    image: "/bsis2.webp",
    gallery: ["/bsis.webp", "/adin.webp", "/facility.webp", "/adagn.webp"],
    linkNote: "Government health system — code is private.",
    role: "Backend Developer · HABTech",
    period: "Feb 2025 – Present",
    challenge:
      "Ethiopia's blood services ran on a legacy system that couldn't serve every blood bank and hospital from one platform, keep donors engaged, or give a clean audit trail from donation to transfusion.",
    solution:
      "A multi-tenant Spring Boot platform with an OAuth2 identity server, covering donor appointments and eligibility, testing, components, plasma, inventory, hospital orders and transfusions — with event-driven notifications and a star-schema analytics layer.",
    decision:
      "Notifications run through a message-template platform driven by domain events: trigger events and scheduled bulk sends render multilingual templates (including Amharic SMS) and dispatch through RabbitMQ with rate limiting and jitter. A nationwide donor-recall campaign can't flood the SMS gateway, and every message is tracked for analytics.",
    metrics: [
      { value: "12", label: "Notification trigger events" },
      { value: "3", label: "Channels: email, SMS, in-app" },
      { value: "3", label: "Apps served" },
      { value: "ISBT 128", label: "Labelling standard" },
    ],
    highlights: [
      "Donor lifecycle: appointments, versioned multilingual eligibility questionnaires, and assessments that auto-defer and notify donors",
      "Event-triggered and scheduled bulk notifications with Amharic SMS, preference-aware delivery and nearby-donor targeting",
      "Plasma workflows: automatic unit creation, box and pallet management, and configurable ZPL label printing",
      "Tissue recipient waiting lists and allocations; hospital orders, transfusions and returns",
      "Star-schema analytics (fact and dimension tables) and legacy-to-tenant data migration scripts",
      "Multi-tenant PostgreSQL behind an OAuth2 identity server, with a Hibernate Envers audit trail",
    ],
    featured: true,
  },
  {
    id: "fundly",
    title: "Fund-ly",
    description:
      "AI-assisted crowd-investment platform connecting emerging-market founders with investors — KYC, milestone-based funding and AI due-diligence scoring.",
    overview:
      "Fund-ly connects entrepreneurs raising capital with investors looking to fund early-stage ventures. I built and deployed it end to end: a Spring Boot backend with JWT and Google OAuth2, RBAC and a Liquibase-managed PostgreSQL schema covering project listings, KYC/AML verification, NDAs, investment agreements, pledges and webhook-confirmed payments; a Python AI service for due diligence; and a Next.js front end with real-time messaging and admin tooling.",
    tags: ["Java 21", "Spring Boot", "Next.js", "TypeScript", "PostgreSQL", "Python", "LLM agents", "Chapa"],
    href: "https://fund-ly.app",
    image: "/fundly.webp",
    links: [
      { label: "Live app", href: "https://fund-ly.app" },
      {
        label: "Repo",
        href: "https://github.com/Crowd-Investment-Platform/Backend",
      },
    ],
    role: "Full-Stack Developer",
    period: "Dec 2025 – Present",
    challenge:
      "Entrepreneurs in emerging markets lacked a trusted platform to raise capital with proper investor verification, legal agreements and milestone-based fund disbursement.",
    solution:
      "A Spring Boot platform with verification pipelines (OCR, face match, liveness), NDAs and investment agreements, Chapa payments, milestone automation and WebSocket chat — plus a separate AI service for diligence and recommendations.",
    decision:
      "Due diligence runs asynchronously in a separate Python AI service — an agent orchestrator with tools, RAG retrieval and structured JSON output, behind a rate limiter with retries and idempotency. The core platform stays fast and predictable, and model providers (OpenRouter, Ollama, Gemini) can be swapped without touching the Spring Boot API.",
    metrics: [
      { value: "3", label: "LLM providers supported" },
      { value: "18", label: "AI service test suites" },
    ],
    highlights: [
      "KYC/AML verification with OCR, face match, liveness checks and encrypted document storage",
      "NDAs, digital investment agreements, pledges and webhook-confirmed Chapa payments",
      "Milestone-based funding with task tracking, disputes and scheduled automation",
      "AI credibility scoring, summaries, risk flags and pgvector-backed investor recommendations",
      "Next.js front end with TanStack Query, Redux and real-time WebSocket / STOMP messaging",
    ],
    featured: true,
  },
  {
    id: "bilal",
    title: "Bilal Community Platform",
    description:
      "Membership, payments, donations and events platform for an Australian community organisation, with Stripe billing and admin dashboards.",
    overview:
      "Bilal Community Platform is the operational backbone for an Australian Muslim community organisation, replacing spreadsheets and manual processes with a proper membership system. Members register, verify by OTP and pay dues through Stripe; admins manage events, donations and fundraising from one dashboard. I led development across a Spring Boot + PostgreSQL backend and a Next.js + TypeScript front end.",
    tags: ["Java", "Spring Boot", "Next.js", "TypeScript", "PostgreSQL", "Stripe", "Twilio"],
    href: "https://bilalcommunity.com.au",
    image: "/bilal.webp",
    links: [{ label: "Live site", href: "https://bilalcommunity.com.au" }],
    role: "Lead Full-Stack Developer",
    period: "Dec 2025 – Mar 2026",
    challenge:
      "A growing community organisation relied on manual processes for member registration, events and financial tracking — with little visibility into who was behind on payments.",
    solution:
      "A Stripe-backed membership billing engine, OTP and Google sign-in, event registration with QR-code tickets, recurring donations, fundraising campaigns and data-heavy admin and member dashboards.",
    decision:
      "Membership status is calculated from the billing rules rather than stored as a flag: joining fees, monthly and annual plans, and grace-period and suspension rules (different for new and legacy members) produce an exact months-behind figure on every login, so admins and members always see the same, current arrears.",
    highlights: [
      "Stripe membership billing with joining fees, monthly and annual plans, and grace-period and suspension rules",
      "Admin dashboards for arrears, revenue trends, aging buckets and member risk, with CSV export",
      "OTP login by email or SMS (Twilio), Google OAuth2, and refresh-token rotation in HttpOnly cookies",
      "Event registration and Stripe payment with A6 PDF tickets carrying QR codes for admin check-in",
      "Recurring donations and fundraising campaigns",
    ],
    featured: true,
  },
  {
    id: "ecp",
    title: "Ethio College Prep",
    description:
      "Website, admin CMS and Telegram registration bot for a college-prep company running SAT, IELTS and counseling programs.",
    overview:
      "I built and maintain Ethio College Prep's web presence on my own: a Next.js site with course pages, a blog and online registration, plus an admin CMS (NextAuth) that lets staff manage tutors, testimonials, FAQs and scholarships without touching code. I also built a Telegraf.js Telegram bot that runs course registration end to end — collecting student details, validating ambassador discount codes, storing payment receipts in Cloudinary and issuing one-time invite links to the right course group.",
    tags: ["Next.js", "TypeScript", "MongoDB", "Tailwind", "Node.js", "Telegraf"],
    href: "https://www.ethiocollegeprep.com",
    image: "/ecp.webp",
    links: [{ label: "Live site", href: "https://www.ethiocollegeprep.com" }],
    role: "Full-Stack Developer (sole developer)",
    period: "Feb 2024 – Present",
    metrics: [
      { value: "Sole", label: "Developer since 2024" },
      { value: "120", label: "Ambassador codes validated by the bot" },
    ],
    highlights: [
      "Course pages for SAT, IELTS, college counseling and summer programs, with a blog",
      "Registration API routes backed by MongoDB, and a NextAuth-protected admin CMS",
      "Telegram bot with a multi-step registration flow, receipt uploads and one-time group invite links",
    ],
    featured: false,
  },
  {
    id: "gym",
    title: "Gym Management System",
    description:
      "Gym management product with fingerprint access control, running at five client gyms in offline, hybrid, web and mobile deployments.",
    overview:
      "A complete gym management system that handles memberships, class scheduling and reporting, with fingerprint-scanner access control. It ships in several deployment options — offline, hybrid, web and mobile — so each gym can run it the way its internet connection and budget allow.",
    tags: ["React", "Node.js", "MySQL", "Flutter", "Rust", "Hardware integration"],
    href: "https://www.brightfitnessgym.com/",
    links: [{ label: "Client: Bright Fitness Gym", href: "https://www.brightfitnessgym.com/" }],
    role: "Developer",
    period: "Dec 2024 – Present",
    metrics: [
      { value: "5", label: "Client gyms" },
      { value: "4", label: "Deployment options" },
    ],
    highlights: [
      "Fingerprint-scanner access control and hardware integration",
      "Membership management, class scheduling and reporting",
      "Offline, hybrid, web and mobile (Flutter) deployments",
    ],
    featured: false,
  },
  {
    id: "pims",
    title: "PIMS — Pharmacy Inventory",
    description:
      "Desktop pharmacy inventory system for supplier orders, sales, invoicing and analytics, built with Rust and Tauri.",
    overview:
      "PIMS lets pharmacists order from suppliers, record transactions, manage inventory and see operational analytics, while clerks track sales and automate invoicing. I led the system design and was the lead backend developer, building the Rust + Tauri backend with Diesel and SQLite behind a React + Vite interface.",
    tags: ["Rust", "Tauri", "Diesel", "SQLite", "React"],
    href: "",
    role: "Lead Backend Developer · System Design",
    period: "May 2025 – Present",
    highlights: [
      "Supplier ordering, transaction records and inventory management",
      "Invoice management module for pharmacy clerks",
      "Operational analytics dashboards",
    ],
    featured: false,
  },
];

export const featuredProjects = projects.filter((project) => project.featured);
export const moreProjects = projects.filter((project) => !project.featured);

export const hero = {
  headline:
    "Full-stack engineer building payment, healthcare and marketplace systems with Spring Boot, React and PostgreSQL."
};

/** One-paragraph summary used on the canvas About card. */
export const aboutText = `Full-stack engineer with 4+ years shipping Spring Boot APIs and React / Next.js front ends that handle real payments and sensitive data — for clients in the US, Australia and Ethiopia.`;

/** The full bio, one string per paragraph. ==Marked== phrases get a highlighter swipe on the page. */
export const aboutParagraphs = [
  "I'm a full-stack engineer based in Addis Ababa with a BSc in Software Engineering from Addis Ababa University. For the past 4+ years I've ==shipped production systems end to end== — Spring Boot APIs that move real money and sensitive data, with React, Next.js and Angular front ends that people use every day.",
  "My work clusters around ==payments, multi-tenant platforms and healthcare==. I'm on the backend team modernizing AEBIS, Ethiopia's national blood information system, and I built MedRoute — a real-time medical courier platform for a US client — solo and on time.",
  "I care about ==the parts that keep systems trustworthy==: audit trails, idempotent payment flows, migrations that roll back, and alerts that fire before users notice. I also taught an 8-week backend course for Google Developer Student Clubs. I'm open to ==remote full-time roles and freelance projects==.",
];

export const stats = [
  { value: "4+", label: "Years shipping production code" },
  { value: "3", label: "Countries with clients" },
  { value: "560+", label: "API endpoints in goGerami" },
  { value: "5", label: "Gyms running my software" },
];

export const testimonials: Testimonial[] = [medRouteReview];

export type Skill = {
  id: string;
  label: string;
  items: string[];
};

/** Only skills a project on this site demonstrates. */
export const skillCategories: Skill[] = [
  {
    id: "backend",
    label: "Backend",
    items: ["Java", "Spring Boot", "Spring Security / OAuth2", "JPA / Hibernate", "Node.js", "Express", "REST", "WebSocket / STOMP"],
  },
  {
    id: "frontend",
    label: "Frontend",
    items: ["React", "Next.js", "Angular", "TypeScript", "Tailwind CSS", "React Query", "Zustand"],
  },
  {
    id: "data",
    label: "Data & messaging",
    items: ["PostgreSQL", "MySQL", "MongoDB", "SQLite", "Liquibase", "Flyway", "RabbitMQ", "pgvector"],
  },
  {
    id: "integrations",
    label: "Payments & integrations",
    items: ["Stripe", "Chapa", "Telebirr", "Twilio", "SendGrid", "Cloudinary", "Telegram Bot API"],
  },
  {
    id: "devops",
    label: "DevOps & quality",
    items: ["Docker", "GitHub Actions", "Render", "Neon", "Vercel", "Prometheus", "Alertmanager", "JUnit", "Mockito", "Testcontainers", "Playwright"],
  },
  {
    id: "more",
    label: "Also",
    items: ["Python", "LLM agents & RAG", "Rust", "Tauri", "Flutter"],
  },
];

export type Experience = {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
  /** Concrete achievements, shown in the experience modal. */
  highlights?: string[];
  technologies: string[];
};

export const experiences: Experience[] = [
  {
    id: "exp-upwork",
    company: "Freelance · Upwork",
    role: "Full-Stack Developer",
    period: "Sep 2026 – Present",
    description:
      "Built MedRoute solo for a US healthcare logistics company — live dispatch, driver GPS tracking and chain-of-custody records — and delivered it on time with a “would hire again” review.",
    highlights: [
      "Designed and built the full MVP: Spring Boot 3.5 API, React 19 front end, PostgreSQL and real-time WebSockets",
      "Four role-based apps (dispatcher, driver, clinic, public tracking) with server-enforced access control",
      "Packaged as a single Docker image with a staging and production deployment plan",
    ],
    technologies: ["Java 21", "Spring Boot", "React", "TypeScript", "PostgreSQL", "Docker"],
  },
  {
    id: "exp-habtech",
    company: "HABTech Solutions",
    role: "Back End Developer",
    period: "Feb 2025 – Present",
    description:
      "Building the backend of AEBIS, Ethiopia's national blood information system, with the Ethiopian Blood and Tissue Bank Service — a multi-tenant Spring Boot platform for blood and tissue banks nationwide.",
    highlights: [
      "Built donor appointments, versioned multilingual eligibility questionnaires and donor assessments that auto-defer and notify donors",
      "Designed the message-template and notification platform: event-triggered and scheduled bulk sends over email, SMS and in-app, with RabbitMQ rate limiting and Amharic SMS",
      "Implemented plasma workflows (unit creation, boxes and pallets, ZPL label printing), tissue recipient allocation, and hospital order and transfusion flows",
      "Modelled analytics as fact and dimension tables and wrote legacy-to-tenant data migration scripts",
    ],
    technologies: ["Java", "Spring Boot", "PostgreSQL", "RabbitMQ", "OAuth2"],
  },
  {
    id: "exp-gogerami",
    company: "Go Gerami",
    role: "Lead Full-Stack Developer",
    period: "Nov 2025 – Present",
    description:
      "Leading development of a multi-tenant gift and experience marketplace for customers, vendors, admins and delivery partners across Spring Boot, React and PostgreSQL.",
    highlights: [
      "Implemented two-phase checkout with idempotent order APIs and Stripe (USD) and Chapa (ETB) payments",
      "Designed multi-currency pricing that creates and validates USD and ETB prices for every SKU",
      "Evolved a Liquibase-managed PostgreSQL schema of 80+ tables with rollback-tested migrations",
      "Set up Prometheus and Alertmanager monitoring with alerts routed to Slack",
    ],
    technologies: ["Java 21", "Spring Boot", "React", "TypeScript", "PostgreSQL", "Stripe"],
  },
  {
    id: "exp-bilal",
    company: "Bilal Community (Australia)",
    role: "Lead Full-Stack Developer",
    period: "Dec 2025 – Mar 2026",
    description:
      "Delivered a membership, payments, donations and events platform with Stripe billing, OTP and Google sign-in, and admin dashboards for a community organisation.",
    highlights: [
      "Built a Stripe membership billing engine with grace-period and suspension rules for new and legacy members",
      "Built admin dashboards for arrears, revenue trends and member risk, with CSV export",
      "Delivered event registration with Stripe payment and QR-code PDF tickets for check-in",
    ],
    technologies: ["Spring Boot", "Next.js", "PostgreSQL", "Stripe", "Twilio"],
  },
  {
    id: "exp-ecp",
    company: "Ethio College Prep",
    role: "Full-Stack Developer",
    period: "Feb 2024 – Present",
    description:
      "Built and independently maintain the company website and admin CMS, and built a Telegram bot that automates course registration.",
    highlights: [
      "Next.js site with course pages, blog, online registration and a NextAuth admin CMS",
      "Telegraf.js registration bot with discount-code validation, receipt uploads and one-time invite links (May – Jun 2024)",
    ],
    technologies: ["Next.js", "Tailwind CSS", "MongoDB", "Node.js", "Telegraf"],
  },
  {
    id: "exp-gdsc",
    company: "Google Developer Student Clubs",
    role: "Backend Trainer",
    period: "Jul 2024 – Sep 2024",
    description:
      "Led an 8-week backend development course — JavaScript, async programming, Node.js, Express, MongoDB and deployment — with live coding, student projects and mentoring.",
    technologies: ["JavaScript", "Node.js", "Express", "MongoDB"],
  },
];

export const education = [
  {
    school: "Addis Ababa University",
    degree: "BSc in Software Engineering",
    period: "2022 – 2026",
  },
];

export const certifications = [
  {
    name: "Microsoft Azure Developer Associate (AZ-204) — certification course",
    detail: "App Service, Functions, containers, Cosmos DB, Key Vault, Entra ID, Service Bus and Event Grid",
  },
];

/** Served from public/; the CV button only appears once this file exists. */
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
  ],
};
