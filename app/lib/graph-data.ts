/**
 * Graph: cards that expand into more cards, connected by sketch lines.
 * expandedPath = [rootId, ...] — only this branch shows children; expanding a card collapses unrelated branches.
 */

import type { Project } from "./seed-data";
import { projects } from "./seed-data";

export type GraphNodeData = {
  id: string;
  label: string;
  /** Parent node id (empty for roots). */
  parentId?: string;
  /** Child node ids; expanding this card reveals them. */
  children?: string[];
  project?: Project;
  description?: string;
  tags?: string[];
};

export const graphNodes: Record<string, GraphNodeData> = {
  intro: {
    id: "intro",
    label: "Joshua T. Alemayehu",
    description: "Full-stack developer — production systems, type-safe APIs, and performant interfaces.",
  },
  projects: {
    id: "projects",
    label: "Projects",
    parentId: "",
    children: ["project-1", "project-2", "project-3", "project-4"],
  },
  about: {
    id: "about",
    label: "About",
    parentId: "",
    children: ["bio", "experience"],
  },
  skills: {
    id: "skills",
    label: "Skills",
    parentId: "",
    children: ["skill-frontend", "skill-backend", "skill-devops", "skill-practices"],
  },
  metrics: {
    id: "metrics",
    label: "Metrics",
    parentId: "",
    children: [],
  },
  contact: {
    id: "contact",
    label: "Contact",
    parentId: "",
    children: ["inquiry"],
  },
  inquiry: {
    id: "inquiry",
    label: "Send feedback",
    parentId: "contact",
    description: "Name, email, and your message.",
    children: [],
  },
  "project-1": {
    id: "project-1",
    label: projects[0].title,
    parentId: "projects",
    project: projects[0],
    children: ["p1-tech", "p1-demo", "p1-repo"],
  },
  "project-2": {
    id: "project-2",
    label: projects[1].title,
    parentId: "projects",
    project: projects[1],
    children: ["p2-tech", "p2-demo", "p2-repo"],
  },
  "project-3": {
    id: "project-3",
    label: projects[2].title,
    parentId: "projects",
    project: projects[2],
    children: ["p3-tech", "p3-demo"],
  },
  "project-4": {
    id: "project-4",
    label: projects[3].title,
    parentId: "projects",
    project: projects[3],
    children: ["p4-tech", "p4-docs"],
  },
  "p1-tech": {
    id: "p1-tech",
    label: "Tech",
    parentId: "project-1",
    description: "Next.js, TypeScript, PostgreSQL",
    children: ["p1-next", "p1-ts", "p1-pg"],
  },
  "p1-demo": {
    id: "p1-demo",
    label: "Demo",
    parentId: "project-1",
    description: "Live preview",
    children: ["p1-demo-app", "p1-docs"],
  },
  "p1-repo": {
    id: "p1-repo",
    label: "Repo",
    parentId: "project-1",
    description: "Source code",
    children: [],
  },
  "p1-next": {
    id: "p1-next",
    label: "Next.js",
    parentId: "p1-tech",
    description: "App Router, SSR",
    children: ["p1-next-app", "p1-next-api"],
  },
  "p1-next-app": {
    id: "p1-next-app",
    label: "App Router",
    parentId: "p1-next",
    description: "RSC, layouts",
    children: [],
  },
  "p1-next-api": {
    id: "p1-next-api",
    label: "API Routes",
    parentId: "p1-next",
    description: "REST, server actions",
    children: [],
  },
  "p1-ts": {
    id: "p1-ts",
    label: "TypeScript",
    parentId: "p1-tech",
    description: "Type safety",
    children: [],
  },
  "p1-pg": {
    id: "p1-pg",
    label: "PostgreSQL",
    parentId: "p1-tech",
    description: "Database",
    children: [],
  },
  "p1-demo-app": {
    id: "p1-demo-app",
    label: "Demo app",
    parentId: "p1-demo",
    description: "Live deployment",
    children: [],
  },
  "p1-docs": {
    id: "p1-docs",
    label: "Docs",
    parentId: "p1-demo",
    description: "README, guides",
    children: [],
  },
  "p2-tech": {
    id: "p2-tech",
    label: "Tech",
    parentId: "project-2",
    description: "React, Tailwind, Figma",
    children: ["p2-react", "p2-figma"],
  },
  "p2-demo": { id: "p2-demo", label: "Demo", parentId: "project-2", description: "Storybook", children: [] },
  "p2-repo": { id: "p2-repo", label: "Repo", parentId: "project-2", description: "Source code", children: [] },
  "p2-react": { id: "p2-react", label: "React", parentId: "p2-tech", description: "Components", children: [] },
  "p2-figma": { id: "p2-figma", label: "Figma", parentId: "p2-tech", description: "Design tokens", children: [] },
  "p3-tech": { id: "p3-tech", label: "Tech", parentId: "project-3", description: "Node.js, GraphQL, D3", children: [] },
  "p3-demo": { id: "p3-demo", label: "Dashboard", parentId: "project-3", description: "Internal tool", children: [] },
  "p4-tech": { id: "p4-tech", label: "Tech", parentId: "project-4", description: "Rust, OpenAPI, MDX", children: [] },
  "p4-docs": { id: "p4-docs", label: "Docs", parentId: "project-4", description: "API reference", children: [] },
  bio: {
    id: "bio",
    label: "Bio",
    parentId: "about",
    description: "3+ years building production apps — clean architecture, type-safe APIs, and interfaces that ship.",
    children: [],
  },
  experience: {
    id: "experience",
    label: "Experience",
    parentId: "about",
    description: "Freelance full-stack, Lead Frontend at Go Gerami, community platform development.",
    children: [],
  },
  "skill-frontend": {
    id: "skill-frontend",
    label: "Frontend",
    parentId: "skills",
    description: "React, Angular, Next.js, TypeScript, Tailwind CSS, Framer Motion",
    children: [],
  },
  "skill-backend": {
    id: "skill-backend",
    label: "Backend",
    parentId: "skills",
    description: "Node.js, Spring Boot, PostgreSQL, MongoDB, GraphQL, REST APIs, Prisma",
    children: [],
  },
  "skill-devops": {
    id: "skill-devops",
    label: "DevOps & Tools",
    parentId: "skills",
    description: "Docker, GitHub Actions, Vercel, Linux, Nginx, CI/CD",
    children: [],
  },
  "skill-practices": {
    id: "skill-practices",
    label: "Practices",
    parentId: "skills",
    description: "System Design, Testing, Accessibility, Performance Optimization, Agile",
    children: [],
  },
};

export function getChildrenIds(nodeId: string): string[] {
  return graphNodes[nodeId]?.children ?? [];
}

export function getNode(id: string): GraphNodeData | undefined {
  return graphNodes[id];
}

/** Path from root to node (e.g. ["projects", "project-1", "p1-tech"]). */
export function getPathToNode(nodeId: string): string[] {
  const path: string[] = [];
  let id: string | undefined = nodeId;
  while (id) {
    path.unshift(id);
    const node: GraphNodeData | undefined = graphNodes[id];
    id = node?.parentId && node.parentId !== "" ? node.parentId : undefined;
  }
  return path;
}

/** Whether nodeId is on the expanded path (ancestor or self). */
export function isOnPath(expandedPath: string[], nodeId: string): boolean {
  return expandedPath.includes(nodeId);
}
