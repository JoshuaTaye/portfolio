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
    children: ["project-1", "project-2", "project-3", "project-4", "project-5", "project-6"],
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
    children: [],
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
    children: ["p3-tech", "p3-demo", "p3-repo"],
  },
  "project-4": {
    id: "project-4",
    label: projects[3].title,
    parentId: "projects",
    project: projects[3],
    children: ["p4-tech", "p4-demo", "p4-repo"],
  },
  "project-5": {
    id: "project-5",
    label: projects[4].title,
    parentId: "projects",
    project: projects[4],
    children: ["p5-tech", "p5-demo", "p5-repo"],
  },
  "project-6": {
    id: "project-6",
    label: projects[5].title,
    parentId: "projects",
    project: projects[5],
    children: ["p6-tech", "p6-demo", "p6-repo"],
  },
  "p1-tech": {
    id: "p1-tech",
    label: "Tech",
    parentId: "project-1",
    description: "Java, Spring Boot, React, PostgreSQL",
    children: [],
  },
  "p1-demo": {
    id: "p1-demo",
    label: "Demo",
    parentId: "project-1",
    description: "Live marketplace app",
    children: [],
  },
  "p1-repo": {
    id: "p1-repo",
    label: "Repo",
    parentId: "project-1",
    description: "Backend + frontend source",
    children: [],
  },
  "p2-tech": {
    id: "p2-tech",
    label: "Tech",
    parentId: "project-2",
    description: "Java, Spring Boot, PostgreSQL, Stripe",
    children: [],
  },
  "p2-demo": {
    id: "p2-demo",
    label: "Demo",
    parentId: "project-2",
    description: "Live community site",
    children: [],
  },
  "p2-repo": {
    id: "p2-repo",
    label: "Repo",
    parentId: "project-2",
    description: "Backend source code",
    children: [],
  },
  "p3-tech": {
    id: "p3-tech",
    label: "Tech",
    parentId: "project-3",
    description: "Java, OAuth2, PostgreSQL, RabbitMQ",
    children: [],
  },
  "p3-demo": {
    id: "p3-demo",
    label: "Demo",
    parentId: "project-3",
    description: "Docker Compose stack",
    children: [],
  },
  "p3-repo": {
    id: "p3-repo",
    label: "Repo",
    parentId: "project-3",
    description: "Identity server + core API",
    children: [],
  },
  "p4-tech": {
    id: "p4-tech",
    label: "Tech",
    parentId: "project-4",
    description: "Java, Spring Boot, PostgreSQL, WebSocket",
    children: [],
  },
  "p4-demo": {
    id: "p4-demo",
    label: "Demo",
    parentId: "project-4",
    description: "fund-ly.app",
    children: [],
  },
  "p4-repo": {
    id: "p4-repo",
    label: "Repo",
    parentId: "project-4",
    description: "Backend source code",
    children: [],
  },
  "p5-tech": {
    id: "p5-tech",
    label: "Tech",
    parentId: "project-5",
    description: "Node.js, Telegraf, MongoDB",
    children: [],
  },
  "p5-demo": {
    id: "p5-demo",
    label: "Demo",
    parentId: "project-5",
    description: "Telegram bot",
    children: [],
  },
  "p5-repo": {
    id: "p5-repo",
    label: "Repo",
    parentId: "project-5",
    description: "Bot source code",
    children: [],
  },
  "p6-tech": {
    id: "p6-tech",
    label: "Tech",
    parentId: "project-6",
    description: "Next.js, TypeScript, MongoDB",
    children: [],
  },
  "p6-demo": {
    id: "p6-demo",
    label: "Demo",
    parentId: "project-6",
    description: "ethiocollegeprep.com",
    children: [],
  },
  "p6-repo": {
    id: "p6-repo",
    label: "Repo",
    parentId: "project-6",
    description: "Website source code",
    children: [],
  },
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
    description: "Freelance full-stack developer — marketplaces, fintech, and community platforms in Java/Spring Boot and React/Next.js.",
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
