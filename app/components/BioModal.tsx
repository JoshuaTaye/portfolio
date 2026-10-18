"use client";

import { useRef } from "react";
import { useDialogFocus } from "@/app/lib/use-dialog-focus";
import { AnimatePresence, motion } from "framer-motion";
import { theme } from "@/app/lib/theme";
import { aboutParagraphs } from "@/app/lib/seed-data";
import { SketchBorder } from "./SketchBorder";
import { AboutDetails, MarkedText, StatsGrid } from "./AboutDetails";

type BioModalProps = {
  open: boolean;
  onClose: () => void;
};

export function BioModal({ open, onClose }: BioModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLElement>(null);

  useDialogFocus(dialogRef, open, onClose);

  return (
    <AnimatePresence>
      {open && (
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
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4" onClick={onClose}>
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
              aria-labelledby="bio-modal-title"
            >
              <SketchBorder targetRef={contentRef} />
              <button
                type="button"
                onClick={onClose}
                className="sketch-round sketch-hover absolute right-3 top-3 z-20 rounded-full bg-[var(--theme-card-bg)] p-2 text-[var(--theme-base-muted)] transition-colors hover:text-[var(--theme-accent-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]"
                aria-label="Close biography"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
              <div ref={contentRef} className="p-6 sm:p-8">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--theme-accent-ink)]">
                  About me
                </span>
                <h2 id="bio-modal-title" className="mt-2 pr-9 text-2xl font-bold tracking-tight text-[var(--theme-base)] sm:text-3xl">
                  Joshua T. Alemayehu
                </h2>
                <div className="mt-5 flex flex-col gap-3 border-t border-[var(--theme-pencil-light)]/30 pt-5">
                  {aboutParagraphs.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-relaxed text-[var(--theme-base-muted)] sm:text-base">
                      <MarkedText text={paragraph} drawn />
                    </p>
                  ))}
                </div>
                <StatsGrid className="mt-6" />
                <AboutDetails className="mt-8" />
              </div>
            </motion.article>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
