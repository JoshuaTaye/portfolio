"use client";

import { useRef } from "react";
import { useDialogFocus } from "@/app/lib/use-dialog-focus";
import { AnimatePresence, motion } from "framer-motion";
import type { Experience } from "@/app/lib/seed-data";
import { theme } from "@/app/lib/theme";
import { SketchBorder } from "./SketchBorder";

type ExperienceModalProps = {
  experience: Experience | null;
  onClose: () => void;
};

export function ExperienceModal({ experience, onClose }: ExperienceModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLElement>(null);

  useDialogFocus(dialogRef, Boolean(experience), onClose);

  return (
    <AnimatePresence>
      {experience && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-100 bg-black/50 backdrop-blur-sm dark:bg-black/70"
            onClick={onClose}
            aria-hidden
          />
          <div className="fixed inset-0 z-101 flex items-center justify-center p-4" onClick={onClose}>
            <motion.article
              ref={dialogRef}
              tabIndex={-1}
              initial={{ opacity: 0, y: 32, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.98 }}
              transition={{ duration: theme.timing.focus, ease: theme.easing.calm }}
              className="relative max-h-[92svh] w-full max-w-2xl overflow-y-auto bg-[var(--theme-card-bg)] shadow-2xl"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="experience-modal-title"
            >
              <SketchBorder targetRef={contentRef} />
              <button
                type="button"
                onClick={onClose}
                className="sketch-round sketch-hover absolute right-3 top-3 z-20 rounded-full bg-[var(--theme-card-bg)] p-2 text-[var(--theme-base-muted)] transition-colors hover:text-[var(--theme-accent-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]"
                aria-label="Close experience details"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
              <div ref={contentRef} className="p-6 sm:p-8">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--theme-accent-ink)]">
                  Experience
                </span>
                <h2 id="experience-modal-title" className="mt-2 pr-9 text-2xl font-bold tracking-tight text-[var(--theme-base)] sm:text-3xl">
                  {experience.role}
                </h2>
                <p className="mt-1 text-sm font-medium text-(--theme-accent-ink)">{experience.company}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-(--theme-base-muted)">{experience.period}</p>

                <div className="mt-6 border-t border-(--theme-pencil-light)/30 pt-5">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--theme-base-muted)]">
                    Role overview
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--theme-base-muted)] sm:text-base">
                    {experience.description}
                  </p>
                </div>

                {experience.highlights && experience.highlights.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--theme-base-muted)]">
                      What I did
                    </h3>
                    <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-[var(--theme-base-muted)]">
                      {experience.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--theme-base-muted)]">
                    Technologies
                  </h3>
                  <ul className="mt-3 flex flex-wrap gap-2" aria-label="Technologies">
                    {experience.technologies.map((technology) => (
                      <li
                        key={technology}
                        className="sketch sketch-sm sketch-accent px-2.5 py-1 text-xs font-medium text-[var(--theme-base)]"
                      >
                        {technology}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.article>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
