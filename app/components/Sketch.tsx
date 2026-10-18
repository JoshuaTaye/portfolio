"use client";

import React, { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import rough from "roughjs";
import { SketchBorder } from "./SketchBorder";

/**
 * Section title in the handwritten face with a pencil underline that draws itself
 * the first time it scrolls into view.
 */
export function SectionHeading({
  id,
  children,
  as: Tag = "h2",
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  as?: "h2" | "h3";
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <Tag id={id} className={`font-hand text-3xl leading-none text-[var(--theme-base)] sm:text-4xl ${className}`}>
      <span ref={ref} className="relative inline-block pb-3">
        {children}
        <svg
          className={`pencil-underline ${inView ? "is-drawn" : ""}`}
          viewBox="0 0 240 14"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path d="M3 9 C 45 3, 85 13, 125 7 S 200 4, 237 9" pathLength={1} />
        </svg>
      </span>
    </Tag>
  );
}

/**
 * Card wrapper with a hand-drawn rough.js border and an accent "scribble" fill on hover.
 * Pass `as="a"`-like behaviour by nesting a link inside; the frame itself is presentational.
 */
export function SketchFrame({
  children,
  className = "",
  interactive = false,
}: {
  children: React.ReactNode;
  className?: string;
  /** Adds the hover fill; use for cards that open something. */
  interactive?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className={`relative ${interactive ? "sketch-frame" : ""} ${className}`}>
      <div ref={ref} className={`relative h-full bg-[var(--theme-card-bg)] ${interactive ? "scribble-fill" : ""}`}>
        {children}
      </div>
      <SketchBorder targetRef={ref} />
    </div>
  );
}

/**
 * Vertical timeline with a hand-drawn spine and a pencil circle beside each entry.
 * Each child is one entry; node positions follow the entries as they resize.
 */
export function SketchTimeline({ children }: { children: React.ReactNode[] }) {
  const containerRef = useRef<HTMLOListElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [layout, setLayout] = useState<{ height: number; nodes: number[] } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const items = Array.from(container.children) as HTMLElement[];
      setLayout({
        height: container.offsetHeight,
        nodes: items.map((item) => item.offsetTop + 22),
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [children.length]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !layout || layout.height <= 0) return;
    svg.innerHTML = "";
    const rc = rough.svg(svg);
    const spine = rc.line(12, 8, 12, layout.height - 8, {
      stroke: "var(--theme-pencil-light)",
      strokeWidth: 1,
      roughness: 1.2,
      bowing: 1.5,
    });
    svg.appendChild(spine);
    for (const y of layout.nodes) {
      const node = rc.circle(12, y, 14, {
        stroke: "var(--theme-accent)",
        strokeWidth: 1.4,
        fill: "var(--theme-background)",
        fillStyle: "solid",
        roughness: 1.1,
      });
      svg.appendChild(node);
    }
  }, [layout]);

  return (
    <div className="relative">
      {layout && (
        <svg
          ref={svgRef}
          className="pointer-events-none absolute left-0 top-0 overflow-visible"
          width={24}
          height={layout.height}
          aria-hidden
        />
      )}
      <ol ref={containerRef} className="flex flex-col gap-4 pl-9">
        {children}
      </ol>
    </div>
  );
}
