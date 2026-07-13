"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { theme } from "@/app/lib/theme";
import { SketchBorder } from "./SketchBorder";

type BioModalProps = {
  open: boolean;
  biography: string;
  onClose: () => void;
};

export function BioModal({ open, biography, onClose }: BioModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

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
              initial={{ opacity: 0, y: 32, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.98 }}
              transition={{ duration: theme.timing.focus, ease: theme.easing.calm }}
              className="relative w-full max-w-xl overflow-hidden bg-[var(--theme-card-bg)] shadow-2xl"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="bio-modal-title"
            >
              <SketchBorder targetRef={contentRef} />
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 z-20 rounded-full border border-[var(--theme-pencil-light)]/50 bg-[var(--theme-card-bg)] p-2 text-[var(--theme-base-muted)] transition-colors hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]"
                aria-label="Close biography"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
              <div ref={contentRef} className="p-6 sm:p-8">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--theme-accent)]">
                  About me
                </span>
                <h2 id="bio-modal-title" className="mt-2 pr-9 text-2xl font-bold tracking-tight text-[var(--theme-base)] sm:text-3xl">
                  Bio
                </h2>
                <p className="mt-5 border-t border-[var(--theme-pencil-light)]/30 pt-5 text-sm leading-relaxed text-[var(--theme-base-muted)] sm:text-base">
                  {biography}
                </p>
              </div>
            </motion.article>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
