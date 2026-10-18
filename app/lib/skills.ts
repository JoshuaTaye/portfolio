import { projects, type Project } from "./seed-data";

/** Skill labels that need different words to find them in project text. */
const SKILL_TERMS: Record<string, string[]> = {
  "Spring Security / OAuth2": ["Spring Security", "OAuth2"],
  "JPA / Hibernate": ["JPA", "Hibernate"],
  "WebSocket / STOMP": ["WebSocket", "STOMP"],
  "Tailwind CSS": ["Tailwind"],
  "React Query": ["React Query", "TanStack Query"],
  "LLM agents & RAG": ["LLM", "RAG"],
  "Telegram Bot API": ["Telegram"],
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function projectText(project: Project) {
  return [
    ...project.tags,
    project.description,
    project.overview,
    project.solution,
    project.decision,
    ...(project.highlights ?? []),
  ]
    .filter(Boolean)
    .join(" \n ");
}

/**
 * Projects whose tags or write-up mention the skill. Case-sensitive whole-word matching,
 * so "Java" doesn't match "JavaScript" and "REST" doesn't match "the rest".
 */
export function projectsForSkill(skill: string): Project[] {
  const terms = SKILL_TERMS[skill] ?? [skill];
  const patterns = terms.map((term) => new RegExp(`(^|[^\\w])${escapeRegExp(term)}($|[^\\w])`));
  return projects.filter((project) => {
    const text = projectText(project);
    return patterns.some((pattern) => pattern.test(text));
  });
}
