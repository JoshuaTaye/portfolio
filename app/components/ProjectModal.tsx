"use client";

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Project } from "@/app/lib/seed-data";
import { useDialogFocus } from "@/app/lib/use-dialog-focus";
import { SketchBorder } from "./SketchBorder";
import { ProjectCaseStudy } from "./ProjectCaseStudy";

/**
 * Case study shown as a modal over the page. Rendered by the intercepted
 * /projects/[slug] route, so closing it is a history "back" to wherever it was opened from.
 */
export function ProjectModal({ project }: { project: Project }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => router.back(), [router]);
  useDialogFocus(dialogRef, true, close);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm dark:bg-black/70"
        onClick={close}
        aria-hidden
      />
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-3 sm:p-4" onClick={close}>
        <motion.article
          ref={dialogRef}
          key={project.id}
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative flex max-h-[92svh] w-full max-w-5xl flex-col overflow-y-auto bg-[var(--theme-card-bg)] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
          tabIndex={-1}
        >
          <SketchBorder targetRef={contentRef} />
          <button
            type="button"
            onClick={close}
            className="absolute right-3 top-3 z-40 rounded-full bg-black/40 p-2 text-white backdrop-blur-md transition hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-4 sm:top-4 sm:p-2.5"
            aria-label="Close case study"
          >
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div ref={contentRef}>
            <ProjectCaseStudy project={project} titleId="project-modal-title" variant="modal" />
          </div>
        </motion.article>
      </div>
    </>
  );
}
