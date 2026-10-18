import { projects } from "@/app/lib/seed-data";
import { ogCard, ogSize } from "@/app/lib/og-card";

export const alt = "Project case study by Joshua T. Alemayehu";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.id }));
}

export default async function ProjectOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.id === slug) ?? projects[0];
  return ogCard({
    eyebrow: `Case study${project.period ? ` · ${project.period}` : ""}`,
    title: project.title,
    subtitle: project.description,
    tags: project.tags,
    footer: `Joshua T. Alemayehu${project.role ? ` · ${project.role}` : ""}`,
  });
}
