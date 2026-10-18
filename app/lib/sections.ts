/** Page sections, in order — used by the header, the command palette and scroll tracking. */
export const sections = [
  { id: "m-projects", label: "Work" },
  { id: "m-about", label: "About" },
  { id: "m-experience", label: "Experience" },
  { id: "m-contact", label: "Contact" },
] as const;

export type SectionId = (typeof sections)[number]["id"] | "hero";
