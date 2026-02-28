"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Project } from "@/app/lib/seed-data";

const DEFAULT_IMAGE = "/gogerami.png";

type ProjectModalProps = {
  project: Project | null;
  onClose: () => void;
};

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    if (!project) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeImage) {
          setActiveImage(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [project, onClose, activeImage]);

  useEffect(() => {
    if (!project) {
      setActiveImage(null);
    }
  }, [project]);

  return (
    <AnimatePresence>
      {project && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm dark:bg-black/70"
            onClick={onClose}
            aria-hidden
          />
          <div
            className="fixed inset-0 z-[101] flex items-center justify-center p-3 sm:p-4"
            onClick={onClose}
          >
            <motion.article
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative flex max-h-[92svh] w-full max-w-5xl flex-col overflow-y-auto border border-[var(--theme-pencil-light)] bg-[var(--theme-card-bg)] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-modal-title"
            >
              {/* Close button — floats over the hero image */}
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 z-30 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/40 sm:right-4 sm:top-4 sm:p-2.5"
                aria-label="Close"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Hero image — full-bleed, clickable to expand */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImage(project.image ?? DEFAULT_IMAGE);
                }}
                className="group relative w-full shrink-0 cursor-zoom-in overflow-hidden"
                aria-label="View image full screen"
              >
                <div className="aspect-[21/9] w-full sm:aspect-[3/1]">
                  <img
                    src={project.image ?? DEFAULT_IMAGE}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 ease-out will-change-transform [backface-visibility:hidden] group-hover:scale-[1.03]"
                  />
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--theme-card-bg)] to-transparent sm:h-32" />
                <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-medium text-white/80 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 sm:bottom-4 sm:right-4 sm:text-xs">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                  Expand
                </div>
              </button>

              {/* Content — overlaps the hero gradient slightly */}
              <div className="relative z-10 -mt-6 flex flex-col px-5 pb-5 sm:-mt-8 sm:px-8 sm:pb-8 md:px-10 md:pb-10">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2
                    id="project-modal-title"
                    className="text-2xl font-bold tracking-tight text-[var(--theme-base)] sm:text-3xl md:text-4xl"
                  >
                    {project.title}
                  </h2>
                  {project.role && (
                    <span className="text-xs font-medium text-[var(--theme-accent)] sm:text-sm">
                      {project.role}
                    </span>
                  )}
                </div>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--theme-base-muted)] sm:mt-3 sm:text-base md:text-lg">
                  {project.description}
                </p>

                {project.tags.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2" aria-label="Technologies">
                    {project.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded border border-[var(--theme-pencil-light)] bg-black/[0.04] px-2 py-0.5 text-xs text-[var(--theme-base-muted)] sm:px-2.5 sm:py-1 sm:text-sm dark:bg-white/[0.08]"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Metrics grid */}
                {project.metrics && project.metrics.length > 0 && (
                  <div className="mt-5 sm:mt-6">
                    <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--theme-base-muted)] sm:text-xs">
                      Results
                    </h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                      {project.metrics.map((m) => (
                        <div
                          key={m.label}
                          className="border border-[var(--theme-pencil-light)] bg-black/[0.02] p-3 dark:bg-white/[0.04]"
                        >
                          <div className="text-lg font-bold text-[var(--theme-accent)] sm:text-xl">
                            {m.value}
                          </div>
                          <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--theme-base-muted)] sm:text-xs">
                            {m.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Challenge → Solution */}
                {(project.challenge || project.solution) && (
                  <div className="mt-5 grid gap-4 sm:mt-6 sm:grid-cols-2">
                    {project.challenge && (
                      <div>
                        <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--theme-base-muted)] sm:text-xs">
                          Challenge
                        </h3>
                        <p className="text-sm leading-relaxed text-[var(--theme-base-muted)]">
                          {project.challenge}
                        </p>
                      </div>
                    )}
                    {project.solution && (
                      <div>
                        <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--theme-base-muted)] sm:text-xs">
                          Solution
                        </h3>
                        <p className="text-sm leading-relaxed text-[var(--theme-base-muted)]">
                          {project.solution}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Key highlights */}
                {project.highlights && project.highlights.length > 0 && (
                  <div className="mt-5 sm:mt-6">
                    <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--theme-base-muted)] sm:text-xs">
                      Highlights
                    </h3>
                    <ul className="flex flex-col gap-1.5">
                      {project.highlights.map((h) => (
                        <li
                          key={h}
                          className="flex items-start gap-2 text-sm leading-relaxed text-[var(--theme-base-muted)]"
                        >
                          <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--theme-accent)]" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <ul className="mt-5 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
                  {(project.links && project.links.length > 0
                    ? project.links
                    : [{ label: "View project", href: project.href }]
                  ).map(({ label, href }) => (
                    <li key={label}>
                      <a
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="inline-flex items-center gap-1.5 border border-[var(--theme-pencil-light)] px-3 py-1.5 text-sm font-medium text-[var(--theme-base)] transition-colors hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)] sm:px-4 sm:py-2"
                      >
                        {label}
                        <svg className="h-3 w-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </li>
                  ))}
                </ul>

                {/* Gallery */}
                {project.gallery && project.gallery.length > 0 && (
                  <div className="mt-6 sm:mt-8">
                    <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--theme-base-muted)] sm:text-xs">
                      Gallery
                    </h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                      {project.gallery.map((src, i) => (
                        <button
                          key={`${src}-${i}`}
                          type="button"
                          onClick={() => setActiveImage(src)}
                          className="group/thumb relative aspect-[4/3] cursor-zoom-in overflow-hidden border border-[var(--theme-pencil-light)] bg-black/[0.03] dark:bg-white/[0.05]"
                          aria-label="Open gallery image in full screen"
                        >
                          <img
                            src={src}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
                          />
                          <div className="pointer-events-none absolute inset-0 border border-white/0 transition-all duration-300 group-hover/thumb:border-[var(--theme-accent)]/30" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.article>
          </div>
          <AnimatePresence>
            {activeImage && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm"
                  onClick={() => setActiveImage(null)}
                  aria-hidden
                />
                <div
                  className="fixed inset-0 z-[121] flex items-center justify-center p-3 sm:p-4"
                  onClick={() => setActiveImage(null)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="relative max-h-[90svh] max-w-5xl"
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveImage(null)}
                      className="absolute right-2 top-2 z-20 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-[var(--theme-pencil-light)] sm:right-4 sm:top-4"
                      aria-label="Close image"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <img
                      src={activeImage}
                      alt=""
                      className="max-h-[88svh] w-auto max-w-full rounded-sm border border-[var(--theme-pencil-light)] object-contain"
                    />
                  </motion.div>
                </div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
