/**
 * Graph: cards that expand into more cards, connected by sketch lines.
 * expandedPath = [rootId, ...] — only this branch shows children; expanding a card collapses unrelated branches.
 */

import type { Project } from "./seed-data";
import { projects, featuredProjects, moreProjects, experiences } from "./seed-data";

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
    description: "Full-stack developer",
  },
  projects: {
    id: "projects",
    label: "Projects",
    parentId: "",
    children: [...featuredProjects.map((p) => `project-${p.id}`), "more-projects"],
  },
  "more-projects": {
    id: "more-projects",
    label: "More projects",
    parentId: "projects",
    description: moreProjects.map((p) => p.title).join(" · "),
    children: moreProjects.map((p) => `project-${p.id}`),
  },
  about: {
    id: "about",
    label: "About",
    parentId: "",
    children: ["bio", "experience"],
  },
  contact: {
    id: "contact",
    label: "Contact",
    parentId: "",
    children: ["inquiry"],
  },
  inquiry: {
    id: "inquiry",
    label: "Send a message",
    parentId: "contact",
    description: "Tell me about your project or role.",
    children: [],
  },
  ...Object.fromEntries(
    projects.map((project) => [
      `project-${project.id}`,
      {
        id: `project-${project.id}`,
        label: project.title,
        parentId: project.featured ? "projects" : "more-projects",
        project,
        children: [],
      },
    ])
  ),
  bio: {
    id: "bio",
    label: "About me",
    parentId: "about",
    description: "Background, how I work, skills, education and certifications.",
    children: [],
  },
  experience: {
    id: "experience",
    label: "Experience",
    parentId: "about",
    description: "Roles across backend systems, full-stack products, and developer education.",
    children: experiences.map((e) => e.id),
  },
  ...Object.fromEntries(
    experiences.map((exp) => [
      exp.id,
      {
        id: exp.id,
        label: `${exp.role} · ${exp.company}`,
        parentId: "experience",
        description: `${exp.period} — ${exp.description}`,
        tags: exp.technologies,
        children: [],
      },
    ])
  ),
};

export function getChildrenIds(nodeId: string): string[] {
  return graphNodes[nodeId]?.children ?? [];
}

export function getNode(id: string): GraphNodeData | undefined {
  return graphNodes[id];
}

/** Path from root to node (e.g. ["about", "experience", "exp-1"]). */
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
