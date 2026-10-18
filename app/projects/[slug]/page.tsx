import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects } from "@/app/lib/seed-data";
import { getResumeUrl } from "@/app/lib/resume";
import { ProjectPage } from "@/app/components/ProjectPage";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.id === slug);
  if (!project) return {};
  const title = `${project.title} — case study`;
  return {
    title,
    description: project.description,
    alternates: { canonical: `/projects/${project.id}` },
    openGraph: { type: "article", url: `/projects/${project.id}`, title, description: project.description },
    twitter: { card: "summary_large_image", title, description: project.description },
  };
}

/** Direct visits and shared links get the case study as a full, crawlable page. */
export default async function ProjectRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.id === slug);
  if (!project) notFound();
  return <ProjectPage project={project} resumeUrl={getResumeUrl()} />;
}
