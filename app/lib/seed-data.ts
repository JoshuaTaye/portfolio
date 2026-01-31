/**
 * Placeholder content for portfolio sections.
 * Replace with real projects, about text, and contact info.
 */

export type Project = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  href: string;
};

export const projects: Project[] = [
  {
    id: "1",
    title: "Project Alpha",
    description: "A full-stack application with real-time collaboration and modern tooling.",
    tags: ["Next.js", "TypeScript", "PostgreSQL"],
    href: "#",
  },
  {
    id: "2",
    title: "Project Beta",
    description: "Design system and component library for cross-product consistency.",
    tags: ["React", "Tailwind", "Figma"],
    href: "#",
  },
  {
    id: "3",
    title: "Project Gamma",
    description: "Internal dashboard for analytics and workflow automation.",
    tags: ["Node.js", "GraphQL", "D3"],
    href: "#",
  },
  {
    id: "4",
    title: "Project Delta",
    description: "API platform and developer documentation portal.",
    tags: ["Rust", "OpenAPI", "MDX"],
    href: "#",
  },
];

export const aboutText = `I'm a full-stack developer focused on clear architecture, thoughtful UX, and maintainable code. I work across the stack—from APIs and data modeling to responsive interfaces and design systems—and care about performance, accessibility, and craft.`;

export const contact = {
  email: "hello@example.com",
  links: [
    { label: "GitHub", href: "https://github.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
    { label: "Twitter", href: "https://twitter.com" },
  ],
};
