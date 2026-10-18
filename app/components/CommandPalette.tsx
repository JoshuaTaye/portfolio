"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { projects, contact } from "@/app/lib/seed-data";
import { sections } from "@/app/lib/sections";
import { toggleTheme, useMediaQuery } from "@/app/lib/client-hooks";
import { useDialogFocus } from "@/app/lib/use-dialog-focus";
import {
  closePalette,
  copyToClipboard,
  setLayout,
  togglePalette,
  useUiState,
} from "@/app/lib/ui-store";

type Command = {
  id: string;
  group: "Go to" | "Projects" | "Actions" | "Links";
  label: string;
  hint?: string;
  keywords?: string;
  run: () => void;
};

/** Scrolls to a section of the home page, switching out of canvas view first if needed. */
function useGoToSection() {
  const router = useRouter();
  const pathname = usePathname();
  const layout = useUiState((s) => s.layout);
  return (id: string) => {
    if (pathname !== "/") {
      router.push(`/#${id}`);
      return;
    }
    const scroll = () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (layout === "canvas") {
      setLayout("page");
      // Wait for the scroll page to mount before scrolling to it.
      window.setTimeout(scroll, 80);
    } else {
      scroll();
    }
  };
}

export function CommandPalette({ resumeUrl }: { resumeUrl: string | null }) {
  const open = useUiState((s) => s.paletteOpen);
  const layout = useUiState((s) => s.layout);
  const router = useRouter();
  const pathname = usePathname();
  const isWide = useMediaQuery("(min-width: 1024px)");
  const goToSection = useGoToSection();

  // ⌘K / Ctrl+K anywhere toggles the palette.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        togglePalette();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const commands = useMemo<Command[]>(() => {
    const list: Command[] = [
      ...sections.map((section) => ({
        id: `go-${section.id}`,
        group: "Go to" as const,
        label: section.label,
        keywords: "section scroll navigate",
        run: () => goToSection(section.id),
      })),
      ...projects.map((project) => ({
        id: `project-${project.id}`,
        group: "Projects" as const,
        label: project.title,
        hint: project.featured ? "Case study" : "Project",
        keywords: `${project.tags.join(" ")} ${project.description}`,
        run: () => router.push(`/projects/${project.id}`, { scroll: false }),
      })),
      {
        id: "copy-email",
        group: "Actions",
        label: "Copy email address",
        hint: contact.email,
        keywords: "contact mail clipboard",
        run: () => copyToClipboard(contact.email, "Email copied to clipboard"),
      },
      {
        id: "email",
        group: "Actions",
        label: "Send an email",
        keywords: "contact mail hire",
        run: () => {
          window.location.href = `mailto:${contact.email}`;
        },
      },
    ];
    if (resumeUrl) {
      list.push({
        id: "cv",
        group: "Actions",
        label: "Download CV",
        keywords: "resume pdf",
        run: () => {
          const link = document.createElement("a");
          link.href = resumeUrl;
          link.download = "";
          link.click();
        },
      });
    }
    list.push({
      id: "theme",
      group: "Actions",
      label: "Toggle light / dark theme",
      keywords: "dark mode light mode appearance",
      run: () => toggleTheme(),
    });
    if (pathname === "/" && isWide) {
      list.push(
        layout === "canvas"
          ? {
              id: "layout-page",
              group: "Actions",
              label: "Switch to page view",
              keywords: "layout scroll",
              run: () => setLayout("page"),
            }
          : {
              id: "layout-canvas",
              group: "Actions",
              label: "Explore as canvas",
              keywords: "layout sketch map graph",
              run: () => setLayout("canvas"),
            }
      );
    }
    for (const link of contact.links) {
      list.push({
        id: `link-${link.label}`,
        group: "Links",
        label: `Open ${link.label}`,
        keywords: "profile social",
        run: () => window.open(link.href, "_blank", "noopener,noreferrer"),
      });
    }
    return list;
  }, [goToSection, router, resumeUrl, pathname, isWide, layout]);

  return (
    <AnimatePresence>
      {open && <PaletteDialog commands={commands} />}
    </AnimatePresence>
  );
}

function PaletteDialog({ commands }: { commands: Command[] }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  useDialogFocus(dialogRef, true, closePalette);

  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const results = commands.filter((command) => {
    const haystack = `${command.label} ${command.group} ${command.hint ?? ""} ${command.keywords ?? ""}`.toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
  const active = Math.min(activeIndex, Math.max(results.length - 1, 0));

  const run = (command: Command) => {
    closePalette();
    // Let the dialog unmount (and restore scrolling) before scrolling or navigating.
    window.requestAnimationFrame(() => command.run());
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((active + 1) % Math.max(results.length, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((active - 1 + results.length) % Math.max(results.length, 1));
    } else if (event.key === "Enter" && results[active]) {
      event.preventDefault();
      run(results[active]);
    }
  };

  useEffect(() => {
    document.getElementById(`cmd-${results[active]?.id}`)?.scrollIntoView({ block: "nearest" });
  }, [active, results]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[130] bg-black/40 backdrop-blur-[2px]"
        onClick={closePalette}
        aria-hidden
      />
      <div className="fixed inset-0 z-[131] flex items-start justify-center px-4 pt-[12vh]" onClick={closePalette}>
        <motion.div
          ref={dialogRef}
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="sketch-strong w-full max-w-xl bg-[var(--theme-card-bg)] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <div className="flex items-center gap-3 border-b border-[var(--theme-pencil-light)]/50 px-4">
            <svg className="h-4 w-4 shrink-0 text-[var(--theme-base-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <circle cx="11" cy="11" r="7" strokeWidth={2} />
              <path strokeLinecap="round" strokeWidth={2} d="m20 20-3.5-3.5" />
            </svg>
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Search projects, sections, actions…"
              className="h-12 w-full bg-transparent text-sm text-[var(--theme-base)] placeholder:text-[var(--theme-base-muted)] focus:outline-none"
              role="combobox"
              aria-expanded="true"
              aria-controls="command-list"
              aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined}
              aria-autocomplete="list"
            />
            <kbd className="sketch sketch-sm hidden shrink-0 px-1.5 py-0.5 text-xs text-[var(--theme-base-muted)] sm:inline">
              esc
            </kbd>
          </div>
          <ul id="command-list" role="listbox" aria-label="Commands" className="max-h-[50vh] overflow-y-auto p-2">
            {results.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-[var(--theme-base-muted)]">No results for “{query}”</li>
            )}
            {results.map((command, index) => {
              const showGroup = index === 0 || results[index - 1].group !== command.group;
              return (
                <li key={command.id} role="presentation">
                  {showGroup && (
                    <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--theme-base-muted)]" aria-hidden>
                      {command.group}
                    </p>
                  )}
                  <div
                    id={`cmd-${command.id}`}
                    role="option"
                    aria-selected={index === active}
                    onMouseMove={() => setActiveIndex(index)}
                    onClick={() => run(command)}
                    className={`flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm ${
                      index === active
                        ? "bg-[var(--theme-accent)]/15 text-[var(--theme-base)]"
                        : "text-[var(--theme-base)]"
                    }`}
                  >
                    <span>{command.label}</span>
                    {command.hint && <span className="truncate text-xs text-[var(--theme-base-muted)]">{command.hint}</span>}
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center gap-4 border-t border-[var(--theme-pencil-light)]/50 px-4 py-2 text-xs text-[var(--theme-base-muted)]">
            <span>↑↓ to move</span>
            <span>↵ to select</span>
            <span className="ml-auto">⌘K to toggle</span>
          </div>
        </motion.div>
      </div>
    </>
  );
}
