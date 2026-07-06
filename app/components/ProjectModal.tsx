"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Project } from "@/app/lib/seed-data";
import { theme } from "@/app/lib/theme";
import { SketchBorder } from "./SketchBorder";

const DEFAULT_IMAGE = "/gogerami.png";

type ProjectModalProps = {
  project: Project | null;
  onClose: () => void;
};

/** Staggered fade/slide-up reveal for modal content sections. */
const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: theme.timing.focus, delay: 0.08 + i * 0.05, ease: theme.easing.calm },
  }),
};

function GithubIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.78-.25.78-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.78 1.19 1.78 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 015.8 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.58.24 2.75.12 3.04.74.8 1.18 1.82 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.66.79.55A10.52 10.52 0 0023.5 12c0-6.35-5.15-11.5-11.5-11.5z" />
    </svg>
  );
}

function ExternalLinkIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function CheckCircleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" strokeWidth={1.6} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.5 12.5l2.4 2.4L15.8 9" />
    </svg>
  );
}

function TargetIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="8" strokeWidth={1.6} />
      <circle cx="12" cy="12" r="3.5" strokeWidth={1.6} />
    </svg>
  );
}

function BulbIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 18h6M10 21h4M12 3a6 6 0 00-3.6 10.8c.5.4.85 1 .85 1.7h5.5c0-.7.35-1.3.85-1.7A6 6 0 0012 3z" />
    </svg>
  );
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);

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

  const displayLinks =
    project?.links && project.links.length > 0
      ? project.links
      : project?.href
        ? [{ label: "View project", href: project.href }]
        : [];

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
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative flex max-h-[92svh] w-full max-w-5xl flex-col overflow-y-auto bg-[var(--theme-card-bg)] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-modal-title"
            >
              <SketchBorder targetRef={contentWrapperRef} />

              {/* Close button — floats over the hero image */}
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 z-30 rounded-full bg-black/40 p-2 text-white backdrop-blur-md transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/40 sm:right-4 sm:top-4 sm:p-2.5"
                aria-label="Close"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div ref={contentWrapperRef}>
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
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--theme-card-bg)] to-transparent sm:h-32" />
                  <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-medium text-white/80 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 sm:bottom-4 sm:right-4 sm:text-xs">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                    Expand
                  </div>
                </button>

                {/* Content — overlaps the hero gradient slightly */}
                <div className="relative z-10 -mt-6 flex flex-col px-5 pb-6 sm:-mt-8 sm:px-8 sm:pb-9 md:px-10 md:pb-11">
                <motion.div custom={0} initial="hidden" animate="visible" variants={sectionVariants}>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <h2
                      id="project-modal-title"
                      className="text-2xl font-bold tracking-tight text-[var(--theme-base)] sm:text-3xl md:text-4xl"
                    >
                      {project.title}
                    </h2>
                    {project.role && (
                      <span className="inline-flex items-center border border-[var(--theme-accent)]/30 bg-[var(--theme-accent)]/10 px-2.5 py-1 text-[11px] font-semibold text-[var(--theme-accent)] sm:text-xs">
                        {project.role}
                      </span>
                    )}
                  </div>

                  <p className="mt-2.5 max-w-2xl text-sm italic leading-relaxed text-[var(--theme-base-muted)] sm:mt-3 sm:text-base">
                    {project.description}
                  </p>

                  {project.tags.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-2" aria-label="Technologies">
                      {project.tags.map((tag) => (
                        <li
                          key={tag}
                          className="rounded border border-[var(--theme-accent)]/25 bg-[var(--theme-accent)]/8 px-2.5 py-1 text-xs font-medium text-[var(--theme-base)] sm:px-3 sm:text-sm"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>

                {project.overview && (
                  <motion.div
                    custom={1}
                    initial="hidden"
                    animate="visible"
                    variants={sectionVariants}
                    className="mt-6 border-t border-[var(--theme-pencil-light)]/25 pt-5 sm:mt-7 sm:pt-6"
                  >
                    <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--theme-base-muted)] sm:text-xs">
                      Overview
                    </h3>
                    <p className="max-w-3xl text-sm leading-relaxed text-[var(--theme-base-muted)] sm:text-base">
                      {project.overview}
                    </p>
                  </motion.div>
                )}

                {/* Metrics grid */}
                {project.metrics && project.metrics.length > 0 && (
                  <motion.div custom={2} initial="hidden" animate="visible" variants={sectionVariants} className="mt-6 sm:mt-7">
                    <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--theme-base-muted)] sm:text-xs">
                      Results
                    </h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                      {project.metrics.map((m) => (
                        <div
                          key={m.label}
                          className="border border-[var(--theme-pencil-light)]/40 bg-black/[0.02] p-3 dark:bg-white/[0.04]"
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
                  </motion.div>
                )}

                {/* Challenge → Solution */}
                {(project.challenge || project.solution) && (
                  <motion.div
                    custom={3}
                    initial="hidden"
                    animate="visible"
                    variants={sectionVariants}
                    className="mt-6 grid gap-3 sm:mt-7 sm:grid-cols-2 sm:gap-4"
                  >
                    {project.challenge && (
                      <div className="border border-[var(--theme-pencil-light)]/30 bg-black/[0.015] p-4 dark:bg-white/[0.03]">
                        <h3 className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--theme-base-muted)] sm:text-xs">
                          <TargetIcon className="h-3.5 w-3.5 text-[var(--theme-accent)]" />
                          Challenge
                        </h3>
                        <p className="text-sm leading-relaxed text-[var(--theme-base-muted)]">
                          {project.challenge}
                        </p>
                      </div>
                    )}
                    {project.solution && (
                      <div className="border border-[var(--theme-pencil-light)]/30 bg-black/[0.015] p-4 dark:bg-white/[0.03]">
                        <h3 className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--theme-base-muted)] sm:text-xs">
                          <BulbIcon className="h-3.5 w-3.5 text-[var(--theme-accent)]" />
                          Solution
                        </h3>
                        <p className="text-sm leading-relaxed text-[var(--theme-base-muted)]">
                          {project.solution}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Key highlights */}
                {project.highlights && project.highlights.length > 0 && (
                  <motion.div custom={4} initial="hidden" animate="visible" variants={sectionVariants} className="mt-6 sm:mt-7">
                    <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--theme-base-muted)] sm:text-xs">
                      Highlights
                    </h3>
                    <ul className="grid gap-2 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-2.5">
                      {project.highlights.map((h) => (
                        <li
                          key={h}
                          className="flex items-start gap-2 text-sm leading-relaxed text-[var(--theme-base-muted)]"
                        >
                          <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--theme-accent)]" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Links */}
                {displayLinks.length > 0 && (
                  <motion.ul
                    custom={5}
                    initial="hidden"
                    animate="visible"
                    variants={sectionVariants}
                    className="mt-6 flex flex-wrap gap-2 sm:mt-7 sm:gap-3"
                  >
                    {displayLinks.map(({ label, href }) => {
                      const isGithub = href.includes("github.com");
                      return (
                        <li key={label}>
                          <a
                            href={href}
                            target={href.startsWith("http") ? "_blank" : undefined}
                            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="inline-flex items-center gap-2 border border-[var(--theme-pencil-light)] px-3.5 py-1.5 text-sm font-medium text-[var(--theme-base)] transition-colors hover:border-[var(--theme-accent)] hover:bg-[var(--theme-accent)]/8 hover:text-[var(--theme-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)] sm:px-4 sm:py-2"
                          >
                            {isGithub ? <GithubIcon /> : <ExternalLinkIcon />}
                            {label}
                          </a>
                        </li>
                      );
                    })}
                  </motion.ul>
                )}

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
