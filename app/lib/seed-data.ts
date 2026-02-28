/**
 * Portfolio content — projects, experience, metrics, skills, and contact.
 * Update the values below with your actual data.
 */

export type Project = {
  id: string;
  title: string;
  description: string;
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
    title: "BSIS",
    description:
      "Business and student information system with real-time enrollment tracking, grade management, and automated report generation serving educational institutions.",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "REST API"],
    href: "#",
    image: "/gogerami.png",
    links: [
      { label: "Live demo", href: "#" },
      { label: "Repo", href: "#" },
    ],
    gallery: ["/gogerami.png", "/vendor.png"],
    role: "Full-Stack Developer",
    challenge:
      "Educational institutions managed student records across disconnected spreadsheets and legacy systems, causing data inconsistencies and delayed reporting.",
    solution:
      "Built a unified platform with role-based dashboards, automated grade calculation, and real-time enrollment tracking. Implemented optimistic UI updates and server-side pagination for large datasets.",
    metrics: [
      { label: "Data Processing", value: "60% faster" },
      { label: "Records Managed", value: "10K+" },
      { label: "Report Generation", value: "< 2s" },
      { label: "Uptime", value: "99.8%" },
    ],
    highlights: [
      "Role-based access control for admins, teachers, and students",
      "Automated PDF report generation with server actions",
      "Real-time enrollment dashboard with WebSocket updates",
    ],
  },
  {
    id: "2",
    title: "Go Gerami",
    description:
      "Ride-hailing and delivery platform connecting drivers and riders with real-time GPS tracking, fare estimation, and in-app payments.",
    tags: ["React", "Node.js", "MongoDB", "Socket.io", "Tailwind"],
    href: "#",
    image: "/gogerami.png",
    links: [
      { label: "Live app", href: "#" },
      { label: "Case study", href: "#" },
    ],
    gallery: ["/gogerami.png", "/portrait.jpg"],
    role: "Lead Frontend Developer",
    challenge:
      "Existing ride-hailing solutions lacked localization and reliable GPS tracking in areas with intermittent connectivity.",
    solution:
      "Developed a progressive web app with offline-first architecture, optimistic location updates, and a fallback SMS-based dispatch system for low-connectivity zones.",
    metrics: [
      { label: "Active Users", value: "2K+" },
      { label: "Avg. Response", value: "< 200ms" },
      { label: "GPS Accuracy", value: "95%+" },
      { label: "Offline Cache", value: "30s" },
    ],
    highlights: [
      "Real-time driver tracking with WebSocket and GPS interpolation",
      "Offline-first PWA with service worker caching",
      "Fare estimation engine with surge pricing logic",
    ],
  },
  {
    id: "3",
    title: "Bilal Community",
    description:
      "Community engagement platform with event management, member directories, and donation tracking for religious organizations.",
    tags: ["Angular", "Spring Boot", "PostgreSQL", "JWT", "D3.js"],
    href: "#",
    image: "/gogerami.png",
    links: [{ label: "View project", href: "#" }],
    gallery: ["/gogerami.png"],
    role: "Full-Stack Developer",
    challenge:
      "Community organizations relied on manual processes for member management, event coordination, and financial tracking — resulting in low engagement and poor transparency.",
    solution:
      "Built a platform with automated event reminders, transparent donation dashboards using D3.js visualizations, and a searchable member directory.",
    metrics: [
      { label: "Member Engagement", value: "+40%" },
      { label: "Event Attendance", value: "+55%" },
      { label: "Donation Tracking", value: "100% digital" },
      { label: "Load Time", value: "< 1.5s" },
    ],
    highlights: [
      "Interactive analytics dashboard with D3.js",
      "JWT-based authentication with role hierarchies",
      "Automated email notifications via Spring Boot scheduling",
    ],
  },
  {
    id: "4",
    title: "PIMS",
    description:
      "Project information management system for tracking deliverables, budgets, and team workloads across multiple concurrent projects.",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "GraphQL", "Docker"],
    href: "#",
    image: "/gogerami.png",
    links: [
      { label: "Docs", href: "#" },
      { label: "API", href: "#" },
    ],
    gallery: ["/gogerami.png", "/portrait.jpg", "/gogerami.png"],
    role: "Backend & API Developer",
    challenge:
      "Project managers lacked a unified view of deliverables, budgets, and team capacity across concurrent projects, causing resource conflicts and missed deadlines.",
    solution:
      "Designed a GraphQL API with fine-grained authorization, real-time status updates via subscriptions, and a Gantt-style timeline view for cross-project visibility.",
    metrics: [
      { label: "API Response", value: "< 150ms p95" },
      { label: "Projects Tracked", value: "50+" },
      { label: "Deployment", value: "CI/CD" },
      { label: "Query Efficiency", value: "3x fewer" },
    ],
    highlights: [
      "GraphQL API with DataLoader for N+1 query prevention",
      "Dockerized deployment with GitHub Actions CI/CD",
      "Real-time updates via GraphQL subscriptions",
    ],
  },
];

export const aboutText = `I'm a full-stack developer with 3+ years of experience building production applications — from business systems and community platforms to real-time tracking apps. I focus on clean architecture, type-safe APIs, and interfaces that actually work for users.

I've shipped systems handling 10K+ records, designed GraphQL APIs serving under 150ms at p95, and built offline-first PWAs for low-connectivity environments. I care about performance, maintainability, and getting the details right.`;

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
  links: [
    { label: "GitHub", href: "https://github.com/JoshuaTaye" },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/joshua-alemayehu-71a454227",
    },
    { label: "Instagram", href: "https://www.instagram.com/joshua_taye/" },
  ],
};
