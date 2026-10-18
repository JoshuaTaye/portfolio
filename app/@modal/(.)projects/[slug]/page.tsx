import { notFound } from "next/navigation";
import { projects } from "@/app/lib/seed-data";
import { ProjectModal } from "@/app/components/ProjectModal";

/** In-app navigation to /projects/[slug] opens the case study as a modal over the current page. */
export default async function ProjectModalRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.id === slug);
  if (!project) notFound();
  return <ProjectModal project={project} />;
}
