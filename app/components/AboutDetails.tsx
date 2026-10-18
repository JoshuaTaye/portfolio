"use client";

import { useEffect, useId, useRef, useState } from "react";
import { animate, motion, useInView } from "framer-motion";
import { stats, skillCategories, education, certifications } from "@/app/lib/seed-data";
import { projectsForSkill } from "@/app/lib/skills";
import { usePrefersReducedMotion } from "@/app/lib/client-hooks";

const headingClass = "text-xs font-semibold uppercase tracking-[0.15em] text-[var(--theme-base-muted)]";

/**
 * Renders a bio string, turning `==phrase==` into a highlighter-marker swipe. The swipe animates
 * when an ancestor gets `.is-marked` (or immediately with `drawn`).
 */
export function MarkedText({ text, drawn = false }: { text: string; drawn?: boolean }) {
  return (
    <>
      {text.split(/==(.+?)==/).map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className={`marker ${drawn ? "is-marked" : ""}`}>
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

/** Bio paragraphs: the first one is the lead; marked phrases swipe in once the text is in view. */
export function AboutBio({ paragraphs, className = "" }: { paragraphs: string[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-25% 0px" });
  return (
    <div ref={ref} className={`flex max-w-[62ch] flex-col gap-5 ${inView ? "is-marked" : ""} ${className}`}>
      {paragraphs.map((paragraph, i) => (
        <p
          key={paragraph}
          className={
            i === 0
              ? "text-lg leading-[1.7] text-[var(--theme-base)] sm:text-xl"
              : "text-[15px] leading-[1.8] text-[var(--theme-base-muted)] sm:text-base"
          }
        >
          <MarkedText text={paragraph} />
        </p>
      ))}
    </div>
  );
}

/** Counts up from zero the first time it scrolls into view; keeps any suffix ("+") and decimals. */
function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const reducedMotion = usePrefersReducedMotion();
  const match = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (!match || reducedMotion || !inView) return;
    const target = parseFloat(match[1]);
    const decimals = match[1].split(".")[1]?.length ?? 0;
    const controls = animate(0, target, {
      duration: 1.3,
      ease: [0.2, 0.7, 0.3, 1],
      onUpdate: (n) => setShown(n.toFixed(decimals) + match[2]),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when it first comes into view
  }, [inView, reducedMotion]);

  return (
    <span ref={ref} className="tabular-nums">
      {shown}
    </span>
  );
}

/** By-the-numbers strip: handwritten figures separated by faint pencil rules, no boxes. */
export function StatsGrid({ className = "" }: { className?: string }) {
  return (
    <dl className={`grid grid-cols-2 gap-y-6 sm:grid-cols-4 ${className}`}>
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`pr-3 ${i % 2 === 1 ? "border-l border-dashed border-[var(--theme-pencil-light)]/60 pl-5" : ""} ${
            i === 2 ? "sm:border-l sm:border-dashed sm:border-[var(--theme-pencil-light)]/60 sm:pl-5" : ""
          }`}
        >
          <dt className="sr-only">{stat.label}</dt>
          <dd className="font-hand text-4xl leading-none text-[var(--theme-accent-ink)] sm:text-5xl">
            <CountUp value={stat.value} />
          </dd>
          <dd className="mt-2 text-xs leading-snug text-[var(--theme-base-muted)]">{stat.label}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A loose pencil loop, drawn around the active toolbox tab. */
function PencilCircle() {
  return (
    <svg
      className="pointer-events-none absolute -left-3.5 -top-2 h-[calc(100%+1rem)] w-[calc(100%+1.75rem)] overflow-visible"
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      aria-hidden
    >
      <motion.path
        d="M10 24 C 6 10, 38 3, 62 4 C 86 5, 98 13, 96 22 C 94 33, 66 38, 44 37 C 18 36, 3 30, 7 18 C 9 11, 20 7, 32 6"
        fill="none"
        stroke="var(--theme-accent)"
        strokeWidth={1.8}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      />
    </svg>
  );
}

/** Skills as a tabbed toolbox: one category at a time, the active tab circled in pencil. */
function Toolbox({
  selectedSkill,
  onSelectSkill,
}: {
  selectedSkill: string | null;
  onSelectSkill?: (skill: string) => void;
}) {
  const [activeId, setActiveId] = useState(skillCategories[0].id);
  const tabsRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const active = skillCategories.find((c) => c.id === activeId) ?? skillCategories[0];

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = skillCategories.findIndex((c) => c.id === activeId);
    const next = skillCategories[(i + (e.key === "ArrowRight" ? 1 : -1) + skillCategories.length) % skillCategories.length];
    setActiveId(next.id);
    tabsRef.current?.querySelector<HTMLButtonElement>(`[data-tab="${next.id}"]`)?.focus();
  };

  return (
    <section aria-labelledby={`${baseId}-heading`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 id={`${baseId}-heading`} className={headingClass}>
          Toolbox
        </h3>
        {onSelectSkill && (
          <p className="font-hand text-sm leading-none text-[var(--theme-accent-ink)]">tap a skill → see where I used it</p>
        )}
      </div>

      <div ref={tabsRef} role="tablist" aria-label="Skill categories" onKeyDown={onKeyDown} className="mt-4 flex flex-wrap gap-x-5 gap-y-3">
        {skillCategories.map((category) => {
          const selected = category.id === activeId;
          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              data-tab={category.id}
              id={`${baseId}-tab-${category.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(category.id)}
              className={`relative px-1 py-0.5 text-sm transition-colors focus:outline-none focus-visible:underline focus-visible:decoration-[var(--theme-accent)] focus-visible:underline-offset-4 ${
                selected ? "font-semibold text-[var(--theme-base)]" : "text-[var(--theme-base-muted)] hover:text-[var(--theme-base)]"
              }`}
            >
              {selected && <PencilCircle key={category.id} />}
              {category.label}
            </button>
          );
        })}
      </div>

      <motion.ul
        key={active.id}
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active.id}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-5 flex min-h-[5.5rem] flex-wrap content-start gap-2"
      >
        {active.items.map((item) => {
          const count = projectsForSkill(item).length;
          if (!onSelectSkill || count === 0) {
            return (
              <li key={item} className="sketch sketch-sm inline-flex items-center px-2.5 py-1 text-sm text-[var(--theme-base-muted)]">
                {item}
              </li>
            );
          }
          const selected = selectedSkill === item;
          return (
            <li key={item}>
              <button
                type="button"
                onClick={() => onSelectSkill(item)}
                aria-pressed={selected}
                aria-label={`${item}, ${count} ${count === 1 ? "project" : "projects"}`}
                title={`${count} project${count === 1 ? "" : "s"} use ${item}`}
                className={`sketch sketch-sm sketch-hover inline-flex items-center gap-1.5 px-2.5 py-1 text-sm text-[var(--theme-base)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)] ${
                  selected ? "font-semibold text-[var(--theme-accent-ink)]" : ""
                }`}
              >
                {item}
                <span className="font-hand text-sm leading-none text-[var(--theme-accent-ink)]" aria-hidden>
                  {count}
                </span>
              </button>
            </li>
          );
        })}
      </motion.ul>
    </section>
  );
}

/**
 * Skills, education and certifications — shared by the scroll layout and the canvas "About me" modal.
 * With `onSelectSkill`, skills that a project demonstrates become toggle buttons that filter the work.
 */
export function AboutDetails({
  className = "",
  selectedSkill = null,
  onSelectSkill,
}: {
  className?: string;
  selectedSkill?: string | null;
  onSelectSkill?: (skill: string) => void;
}) {
  return (
    <div className={`flex flex-col gap-10 ${className}`}>
      <Toolbox selectedSkill={selectedSkill} onSelectSkill={onSelectSkill} />

      <section aria-label="Education and certifications" className="grid items-start gap-4 sm:grid-cols-2">
        <div className="sketch-faint p-4">
          <h3 className={headingClass}>Education</h3>
          <ul className="mt-2.5 flex flex-col gap-2">
            {education.map((item) => (
              <li key={item.school}>
                <p className="text-sm font-semibold text-[var(--theme-base)]">{item.degree}</p>
                <p className="mt-0.5 text-sm text-[var(--theme-base-muted)]">
                  {item.school} · {item.period}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div className="sketch-faint p-4">
          <h3 className={headingClass}>Certification</h3>
          <ul className="mt-2.5 flex flex-col gap-2">
            {certifications.map((item) => (
              <li key={item.name}>
                <p className="text-sm font-semibold text-[var(--theme-base)]">{item.name}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-[var(--theme-base-muted)]">{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
