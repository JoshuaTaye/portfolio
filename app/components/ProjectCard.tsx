"use client";

import { useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import rough from "roughjs";
import type { Project } from "@/app/lib/seed-data";
import { theme } from "@/app/lib/theme";
import { cardHover, tapTransition } from "@/app/lib/animations";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const borderRef = useRef<SVGSVGElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const link = linkRef.current;
    const svg = borderRef.current;
    if (!link || !svg) return;
    const { width, height } = link.getBoundingClientRect();
    if (width <= 0 || height <= 0) return;
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(height));
    svg.innerHTML = "";
    const rc = rough.svg(svg);
    const node = rc.rectangle(2, 2, width - 4, height - 4, {
      stroke: "var(--theme-pencil-light)",
      strokeWidth: 0.8,
      roughness: 1.2,
      bowing: 0.4,
    });
    if (node) svg.appendChild(node);
  }, [project.id]);

  return (
    <motion.div
      variants={reducedMotion ? {} : cardHover}
      initial="rest"
      whileHover="hover"
      transition={tapTransition}
      className="relative"
    >
      <Link
        ref={linkRef}
        href={project.href}
        className="block relative min-h-[120px] rounded-sm bg-[var(--theme-background)] p-4 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)] focus:ring-offset-2 focus:ring-offset-[var(--theme-background)]"
      >
        <svg
          ref={borderRef}
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden
        />
        <motion.span
          className="absolute inset-0 rounded-sm opacity-0"
          style={{ backgroundColor: "var(--theme-accent)" }}
          variants={{ rest: { opacity: 0 }, hover: { opacity: 0.06 } }}
          transition={{ duration: theme.timing.fill, ease: theme.easing.calm }}
        />
        <span className="relative z-10">
          <h3 className="font-semibold text-[var(--theme-base)]">{project.title}</h3>
          <p className="mt-1 text-sm text-[var(--theme-base-muted)]">{project.description}</p>
          <ul className="mt-2 flex flex-wrap gap-2" aria-label="Technologies">
            {project.tags.map((tag) => (
              <li
                key={tag}
                className="rounded border border-[var(--theme-pencil-light)] px-2 py-0.5 text-xs text-[var(--theme-base-muted)]"
              >
                {tag}
              </li>
            ))}
          </ul>
        </span>
      </Link>
    </motion.div>
  );
}
