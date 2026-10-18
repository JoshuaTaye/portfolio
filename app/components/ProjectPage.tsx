"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Project } from "@/app/lib/seed-data";
import { SiteHeader } from "./SiteHeader";
import { SketchBorder } from "./SketchBorder";
import { ProjectCaseStudy } from "./ProjectCaseStudy";

/** Full-page case study for /projects/[slug] when it's opened directly or shared. */
export function ProjectPage({ project, resumeUrl }: { project: Project; resumeUrl: string | null }) {
  const contentRef = useRef<HTMLDivElement>(null);
  return (
    <div className="min-h-screen bg-[var(--theme-background)]">
      <SiteHeader variant="project" resumeUrl={resumeUrl} />
      <main className="mx-auto max-w-5xl px-3 py-8 sm:px-6 sm:py-12">
        <Link
          href="/#m-projects"
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--theme-base-muted)] transition-colors hover:text-[var(--theme-accent-ink)]"
        >
          <span aria-hidden>←</span> All projects
        </Link>
        <article className="relative bg-[var(--theme-card-bg)]" aria-labelledby="project-page-title">
          <SketchBorder targetRef={contentRef} />
          <div ref={contentRef}>
            <ProjectCaseStudy project={project} titleId="project-page-title" variant="page" />
          </div>
        </article>
      </main>
    </div>
  );
}
