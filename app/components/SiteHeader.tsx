"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { sections, type SectionId } from "@/app/lib/sections";
import { toggleTheme, useDarkMode } from "@/app/lib/client-hooks";
import { openPalette, setLayout } from "@/app/lib/ui-store";
import { ThemeToggle } from "./ThemeToggle";

function SearchIcon({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <circle cx="11" cy="11" r="7" strokeWidth={2} />
      <path strokeLinecap="round" strokeWidth={2} d="m20 20-3.5-3.5" />
    </svg>
  );
}

function PencilIcon({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
      <path d="M4 20l1.2-4.4L16.6 4.2a2 2 0 0 1 2.9 0l.3.3a2 2 0 0 1 0 2.9L8.4 18.8z" />
      <path d="M14.5 6.3l3.2 3.2" />
    </svg>
  );
}

function DownloadIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 4v11m-4.5-4.5L12 15l4.5-4.5M5 20h14" />
    </svg>
  );
}

/** Borderless round icon button for the header actions (display is set per button). */
const iconButtonClass =
  "h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--theme-base-muted)] transition-colors hover:bg-[var(--theme-accent)]/12 hover:text-[var(--theme-base)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)]";

/** Thin accent bar under the header showing how far down the page you are. */
function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <div
      ref={barRef}
      className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-[var(--theme-accent)]"
      style={{ transform: "scaleX(0)" }}
      aria-hidden
    />
  );
}

/**
 * Sticky top bar. On the home page section links scroll in place and the current section is
 * highlighted; on project pages they link back to the home page sections.
 */
export function SiteHeader({
  variant,
  activeSection,
  resumeUrl,
}: {
  variant: "home" | "project";
  activeSection?: SectionId;
  resumeUrl: string | null;
}) {
  const darkMode = useDarkMode();
  const hrefFor = (id: string) => (variant === "home" ? `#${id}` : `/#${id}`);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--theme-pencil-light)]/30 bg-[var(--theme-background)]/85 backdrop-blur-md">
      {/* Name left, sections centred, actions right. */}
      <div className="mx-auto grid h-14 max-w-6xl grid-cols-[1fr_auto] items-center gap-3 px-4 sm:px-6 md:grid-cols-[1fr_auto_1fr]">
        <Link
          href={variant === "home" ? "#hero" : "/"}
          aria-label="Joshua T. Alemayehu — home"
          className="flex w-fit shrink-0 items-center gap-2 font-semibold text-[var(--theme-base)]"
        >
          <img src="/logo.svg" alt="" className="h-7 w-7" />
          <span className="hidden text-sm sm:inline">Joshua T. Alemayehu</span>
        </Link>

        <nav aria-label="Sections" className="hidden md:block">
          <ul className="flex items-center gap-2">
            {sections.map((section) => {
              const active = activeSection === section.id;
              return (
                <li key={section.id}>
                  <a
                    href={hrefFor(section.id)}
                    aria-current={active ? "true" : undefined}
                    className={`block px-3 py-2 text-sm transition-colors ${
                      active
                        ? "font-medium text-[var(--theme-base)]"
                        : "text-[var(--theme-base-muted)] hover:text-[var(--theme-base)]"
                    }`}
                  >
                    <span className="relative inline-block pb-1">
                      {section.label}
                      {/* Hand-drawn underline that draws in under the current section. */}
                      <svg
                        className={`pencil-underline !-bottom-0.5 !h-1.5 ${active ? "is-drawn" : ""}`}
                        viewBox="0 0 240 14"
                        preserveAspectRatio="none"
                        aria-hidden
                      >
                        <path d="M3 9 C 45 3, 85 13, 125 7 S 200 4, 237 9" pathLength={1} />
                      </svg>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={openPalette}
            className={`${iconButtonClass} inline-flex`}
            aria-label="Search and quick actions"
            aria-keyshortcuts="Meta+K Control+K"
            title="Search (⌘K)"
          >
            <SearchIcon />
          </button>
          {variant === "home" && (
            <button
              type="button"
              onClick={() => setLayout("canvas")}
              className={`${iconButtonClass} hidden lg:inline-flex`}
              aria-label="Explore canvas mode"
              title="Explore this portfolio as an interactive sketch canvas"
            >
              <PencilIcon />
            </button>
          )}
          <ThemeToggle darkMode={darkMode} toggle={toggleTheme} variant="inline" />
          {resumeUrl && (
            <>
              <span className="mx-2 hidden h-5 w-px bg-[var(--theme-pencil-light)]/50 sm:block" aria-hidden />
              <a
                href={resumeUrl}
                download
                className="sketch sketch-hover hidden h-9 items-center gap-1.5 px-3.5 text-sm font-medium text-[var(--theme-base)] transition-colors hover:text-[var(--theme-accent-ink)] sm:inline-flex"
              >
                <DownloadIcon />
                CV
              </a>
            </>
          )}
        </div>
      </div>
      {variant === "home" && <ScrollProgress />}
    </header>
  );
}

/** Appears after scrolling down a screen or two; returns to the top. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 900);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-5 right-5 z-30 flex h-11 w-11 items-center justify-center sketch-round sketch-hover rounded-full bg-[var(--theme-card-bg)] text-[var(--theme-base)] shadow-md transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)] ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m-6 6 6-6 6 6" />
      </svg>
    </button>
  );
}
