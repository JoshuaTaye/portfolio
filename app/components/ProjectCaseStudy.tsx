"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { projects, type Project } from "@/app/lib/seed-data";
import { theme } from "@/app/lib/theme";

/** Staggered fade/slide-up reveal for case-study sections. */
const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: theme.timing.focus, delay: 0.08 + i * 0.05, ease: theme.easing.calm },
  }),
};

const labelClass = "mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--theme-base-muted)]";

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

/** Full-screen image viewer. Handles its own Escape so the surrounding dialog stays open. */
function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      onClose();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [onClose]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="fixed inset-0 z-[121] flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="relative max-h-[90svh] max-w-5xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-2 top-2 z-20 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-4 sm:top-4"
            aria-label="Close image"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={src}
            alt={alt}
            className="max-h-[88svh] w-auto max-w-full rounded-sm border border-[var(--theme-pencil-light)] object-contain"
          />
        </motion.div>
      </div>
    </>
  );
}

/**
 * The case-study body shared by the project modal and the standalone /projects/[slug] page.
 * `variant="modal"` keeps "Next project" inside the modal; `variant="page"` does a full navigation.
 */
export function ProjectCaseStudy({
  project,
  titleId,
  variant,
}: {
  project: Project;
  titleId: string;
  variant: "modal" | "page";
}) {
  const [activeImage, setActiveImage] = useState<{ src: string; alt: string } | null>(null);

  const displayLinks =
    project.links && project.links.length > 0
      ? project.links
      : project.href
        ? [{ label: "View project", href: project.href }]
        : [];

  const index = projects.findIndex((p) => p.id === project.id);
  const nextProject = projects[(index + 1) % projects.length];

  return (
    <div>
      {/* Hero image — full-bleed, clickable to expand. Projects without a screenshot get a plain header. */}
      {project.image ? (
        <button
          type="button"
          onClick={() => setActiveImage({ src: project.image!, alt: `${project.title} screenshot` })}
          className="group relative w-full shrink-0 cursor-zoom-in overflow-hidden"
          aria-label={`View ${project.title} screenshot full screen`}
        >
          <div className="relative aspect-[21/9] w-full sm:aspect-[3/1]">
            <Image
              src={project.image}
              alt={`${project.title} screenshot`}
              fill
              priority
              sizes="(min-width: 1024px) 1024px, 100vw"
              className="object-cover object-top transition-transform duration-700 ease-out will-change-transform [backface-visibility:hidden] group-hover:scale-[1.03]"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--theme-card-bg)] to-transparent sm:h-32" />
          <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-white/90 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 sm:bottom-4 sm:right-4">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
            Expand
          </div>
        </button>
      ) : (
        <div className="relative flex aspect-[21/9] w-full items-center justify-center overflow-hidden bg-[var(--theme-accent)]/10 sm:aspect-[3/1]">
          <span className="font-hand px-6 text-center text-4xl text-[var(--theme-accent-ink)] opacity-60 sm:text-6xl" aria-hidden>
            {project.title}
          </span>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--theme-card-bg)] to-transparent sm:h-32" />
        </div>
      )}

      {/* Content — overlaps the hero gradient slightly */}
      <div className="relative z-10 -mt-6 flex flex-col px-5 pb-6 sm:-mt-8 sm:px-8 sm:pb-9 md:px-10 md:pb-11">
        <motion.div custom={0} initial="hidden" animate="visible" variants={sectionVariants}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h2 id={titleId} className="text-2xl font-bold tracking-tight text-[var(--theme-base)] sm:text-3xl md:text-4xl">
              {project.title}
            </h2>
            {project.role && (
              <span className="sketch sketch-sm sketch-accent inline-flex items-center px-2.5 py-1 text-xs font-semibold text-[var(--theme-accent-ink)]">
                {project.role}
              </span>
            )}
            {project.period && <span className="text-xs text-[var(--theme-base-muted)]">{project.period}</span>}
          </div>

          <p className="mt-2.5 max-w-2xl text-sm italic leading-relaxed text-[var(--theme-base-muted)] sm:mt-3 sm:text-base">
            {project.description}
          </p>

          {project.tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-2" aria-label="Technologies">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="sketch sketch-sm px-2.5 py-1 text-xs font-medium text-[var(--theme-base)] sm:px-3 sm:text-sm"
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
            <h3 className={labelClass}>Overview</h3>
            <p className="max-w-3xl text-sm leading-relaxed text-[var(--theme-base-muted)] sm:text-base">{project.overview}</p>
          </motion.div>
        )}

        {project.metrics && project.metrics.length > 0 && (
          <motion.div custom={2} initial="hidden" animate="visible" variants={sectionVariants} className="mt-6 sm:mt-7">
            <h3 className={labelClass}>Results</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              {project.metrics.map((m) => (
                <div key={m.label} className="sketch-faint p-3">
                  <div className="text-lg font-bold text-[var(--theme-accent-ink)] sm:text-xl">{m.value}</div>
                  <div className="mt-0.5 text-xs font-medium uppercase tracking-wider text-[var(--theme-base-muted)]">{m.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {(project.challenge || project.solution) && (
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="mt-6 grid gap-3 sm:mt-7 sm:grid-cols-2 sm:gap-4"
          >
            {project.challenge && (
              <div className="sketch-faint p-4">
                <h3 className={`${labelClass} flex items-center gap-1.5`}>
                  <TargetIcon className="h-3.5 w-3.5 text-[var(--theme-accent-ink)]" />
                  Challenge
                </h3>
                <p className="text-sm leading-relaxed text-[var(--theme-base-muted)]">{project.challenge}</p>
              </div>
            )}
            {project.solution && (
              <div className="sketch-faint p-4">
                <h3 className={`${labelClass} flex items-center gap-1.5`}>
                  <BulbIcon className="h-3.5 w-3.5 text-[var(--theme-accent-ink)]" />
                  Solution
                </h3>
                <p className="text-sm leading-relaxed text-[var(--theme-base-muted)]">{project.solution}</p>
              </div>
            )}
          </motion.div>
        )}

        {project.decision && (
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="mt-6 border-l-2 border-[var(--theme-accent)] pl-4 sm:mt-7"
          >
            <h3 className={labelClass}>Key technical decision</h3>
            <p className="max-w-3xl text-sm leading-relaxed text-[var(--theme-base-muted)] sm:text-base">{project.decision}</p>
          </motion.div>
        )}

        {project.highlights && project.highlights.length > 0 && (
          <motion.div custom={4} initial="hidden" animate="visible" variants={sectionVariants} className="mt-6 sm:mt-7">
            <h3 className={labelClass}>Highlights</h3>
            <ul className="grid gap-2 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-2.5">
              {project.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm leading-relaxed text-[var(--theme-base-muted)]">
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--theme-accent-ink)]" />
                  {h}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {project.testimonial && (
          <motion.figure
            custom={4}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="sketch mt-6 px-5 py-6 sm:mt-7 sm:px-8 sm:py-7"
          >
            <blockquote className="text-sm italic leading-relaxed text-[var(--theme-base)] sm:text-base">
              “{project.testimonial.quote}”
            </blockquote>
            <figcaption className="mt-4 text-xs text-[var(--theme-base-muted)]">
              — {project.testimonial.author}, {project.testimonial.context}
            </figcaption>
          </motion.figure>
        )}

        {displayLinks.length === 0 && project.linkNote && (
          <p className="mt-6 text-sm text-[var(--theme-base-muted)] sm:mt-7">{project.linkNote}</p>
        )}

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
                    className="sketch sketch-hover inline-flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium text-[var(--theme-base)] transition duration-200 hover:-translate-y-0.5 hover:text-[var(--theme-accent-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)] sm:px-4 sm:py-2"
                  >
                    {isGithub ? <GithubIcon /> : <ExternalLinkIcon />}
                    {label}
                  </a>
                </li>
              );
            })}
          </motion.ul>
        )}

        {project.gallery && project.gallery.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <h3 className={labelClass}>Gallery</h3>
            {/* Four across when that fills rows evenly, otherwise three — avoids a lone image on the last row. */}
            <div
              className={`grid grid-cols-2 gap-2 sm:gap-3 ${
                project.gallery.length % 4 === 0 ? "sm:grid-cols-4" : "sm:grid-cols-3"
              }`}
            >
              {project.gallery.map((src, i) => {
                const alt = `${project.title} screenshot ${i + 1}`;
                return (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    onClick={() => setActiveImage({ src, alt })}
                    className="group/thumb relative aspect-[4/3] cursor-zoom-in overflow-hidden border border-[var(--theme-pencil-light)] bg-black/[0.03] dark:bg-white/[0.05]"
                    aria-label={`Open ${alt} full screen`}
                  >
                    <Image
                      src={src}
                      alt={alt}
                      fill
                      sizes="(min-width: 640px) 320px, 50vw"
                      className="object-cover object-top transition-transform duration-500 group-hover/thumb:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 border border-white/0 transition-all duration-300 group-hover/thumb:border-[var(--theme-accent)]/30" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {nextProject && nextProject.id !== project.id && (
          <div className="mt-8 flex justify-end border-t border-[var(--theme-pencil-light)]/25 pt-5">
            {variant === "modal" ? (
              <Link
                href={`/projects/${nextProject.id}`}
                replace
                scroll={false}
                className="group inline-flex items-center gap-2 text-sm font-semibold text-[var(--theme-accent-ink)]"
              >
                Next: {nextProject.title}
                <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            ) : (
              <a
                href={`/projects/${nextProject.id}`}
                className="group inline-flex items-center gap-2 text-sm font-semibold text-[var(--theme-accent-ink)]"
              >
                Next: {nextProject.title}
                <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
              </a>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {activeImage && <Lightbox src={activeImage.src} alt={activeImage.alt} onClose={() => setActiveImage(null)} />}
      </AnimatePresence>
    </div>
  );
}
