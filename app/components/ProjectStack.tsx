"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import type { Project } from "@/app/lib/seed-data";
import { useMediaQuery, usePrefersReducedMotion } from "@/app/lib/client-hooks";
import { SketchFrame } from "./Sketch";

/*
 * Featured case studies as a pile of sketchbook pages. On wide screens each card sticks near the
 * top and the next one slides over it; the ones underneath shrink back a little and keep their top
 * edge showing. Screenshots are "taped in" at a slight angle and straighten on hover.
 */

/** Where the first sheet sticks (below the 56px header), and how much of each sheet stays visible. */
const STICK_TOP = 84;
const PEEK = 14;

const pad = (n: number) => String(n).padStart(2, "0");

function HandArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 34 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 9c8-2.5 16 1.5 29-1" />
      <path d="M25 3.5l6 4.6-6.4 4.4" />
    </svg>
  );
}

/** Screenshot "taped" into the page: tilted, with two strips of tape across the top corners. */
function TapedShot({ project, flip }: { project: Project; flip: boolean }) {
  return (
    <div className={`relative mb-7 h-52 sm:h-64 lg:mb-0 lg:h-full lg:min-h-80 ${flip ? "lg:order-2" : ""}`}>
      <div
        className={`relative h-full w-full transition-[rotate,translate] duration-500 ease-out group-hover:-translate-y-1 group-hover:rotate-0 ${
          flip ? "rotate-[1.3deg]" : "-rotate-[1.3deg]"
        }`}
      >
        <div className="relative h-full w-full overflow-hidden bg-[var(--theme-card-bg)] shadow-[0_14px_30px_-16px_rgba(0,0,0,0.45)] ring-1 ring-[var(--theme-pencil-light)]/30">
          {project.image ? (
            <Image
              src={project.image}
              alt={`${project.title} screenshot`}
              fill
              sizes="(min-width: 1024px) 640px, 100vw"
              className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[var(--theme-accent)]/10">
              <span className="font-hand text-4xl text-[var(--theme-accent-ink)] opacity-60" aria-hidden>
                {project.title}
              </span>
            </div>
          )}
        </div>
        <span className="tape -left-5 -top-2.5 -rotate-[34deg]" aria-hidden />
        <span className="tape -right-5 -top-2.5 rotate-[34deg]" aria-hidden />
      </div>
    </div>
  );
}

function StackedCard({
  project,
  index,
  total,
  progress,
  stacking,
  dimmed,
  matched,
}: {
  project: Project;
  index: number;
  total: number;
  progress: MotionValue<number>;
  stacking: boolean;
  dimmed: boolean;
  matched: boolean;
}) {
  const flip = index % 2 === 1;
  // Each sheet starts shrinking once the pile reaches it; lower sheets end up a little smaller.
  const targetScale = 1 - (total - 1 - index) * 0.035;
  const scale = useTransform(progress, [index / total, 1], [1, stacking ? targetScale : 1]);

  return (
    <div className="lg:sticky" style={{ top: STICK_TOP + index * PEEK }}>
      <motion.div
        style={{ scale, rotate: stacking ? (flip ? 0.5 : -0.5) : 0, transformOrigin: "top center" }}
        className="lg:shadow-[0_-14px_32px_-22px_rgba(0,0,0,0.35)]"
      >
        <SketchFrame
          interactive
          className={`transition-opacity duration-300 ${dimmed ? "opacity-35" : "opacity-100"} ${
            matched ? "outline-2 outline-offset-4 outline-[var(--theme-accent)]" : ""
          }`}
        >
          <Link
            href={`/projects/${project.id}`}
            scroll={false}
            className={`group flex flex-col p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)] sm:p-6 lg:grid lg:gap-10 lg:p-7 ${
              flip ? "lg:grid-cols-[1fr_1.25fr]" : "lg:grid-cols-[1.25fr_1fr]"
            }`}
          >
            <TapedShot project={project} flip={flip} />

            <div className="flex flex-col lg:justify-center">
              <p className="font-hand flex items-baseline gap-1.5 leading-none text-[var(--theme-accent-ink)]" aria-hidden>
                <span className="text-3xl">{pad(index + 1)}</span>
                <span className="text-base text-[var(--theme-base-muted)]">/ {pad(total)}</span>
              </p>
              <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 className="text-2xl font-semibold tracking-tight text-[var(--theme-base)] sm:text-3xl">{project.title}</h3>
                {project.period && <span className="text-xs text-[var(--theme-base-muted)]">{project.period}</span>}
              </div>
              {project.role && <p className="mt-1 text-xs font-medium text-[var(--theme-accent-ink)]">{project.role}</p>}
              <p className="mt-3 text-sm leading-relaxed text-[var(--theme-base-muted)]">{project.description}</p>

              {project.metrics && (
                <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3">
                  {project.metrics.slice(0, 4).map((metric) => (
                    <div key={metric.label} className="border-l-2 border-[var(--theme-accent)]/60 pl-3">
                      <dt className="sr-only">{metric.label}</dt>
                      <dd className="font-hand text-2xl leading-none text-[var(--theme-base)]">{metric.value}</dd>
                      <dd className="mt-1 text-xs text-[var(--theme-base-muted)]">{metric.label}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Technologies">
                {project.tags.slice(0, 8).map((tag) => (
                  <li key={tag} className="sketch sketch-sm px-2 py-0.5 text-xs text-[var(--theme-base-muted)]">
                    {tag}
                  </li>
                ))}
              </ul>

              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--theme-accent-ink)]">
                Read the case study
                <HandArrow className="h-4 w-8 transition-transform duration-300 group-hover:translate-x-1.5" />
              </span>
            </div>
          </Link>
        </SketchFrame>
      </motion.div>
    </div>
  );
}

export function ProjectStack({
  projects,
  matchingIds,
}: {
  projects: Project[];
  /** Ids matching the active skill filter, or null when no filter is set. */
  matchingIds: Set<string> | null;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const isWide = useMediaQuery("(min-width: 1024px)");
  const reducedMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start start", "end end"] });

  return (
    <div ref={listRef} className="mt-10 flex flex-col gap-10 lg:gap-24">
      {projects.map((project, i) => (
        <StackedCard
          key={project.id}
          project={project}
          index={i}
          total={projects.length}
          progress={scrollYProgress}
          stacking={isWide && !reducedMotion}
          dimmed={Boolean(matchingIds && !matchingIds.has(project.id))}
          matched={Boolean(matchingIds?.has(project.id))}
        />
      ))}
    </div>
  );
}
