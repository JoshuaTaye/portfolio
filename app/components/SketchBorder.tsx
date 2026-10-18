"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useInView } from "framer-motion";
import rough from "roughjs";

type SketchBorderProps = {
  /** Element whose full (unclipped) content size the border should wrap around. */
  targetRef: RefObject<HTMLElement | null>;
  roughness?: number;
  strokeWidth?: number;
  bowing?: number;
  className?: string;
};

/** Wobble points along each edge are ~160px apart; rough.js alone flattens long lines. */
const SEGMENT = 160;

/** Deterministic jitter in [-1, 1], so the outline doesn't change shape between renders. */
const jitter = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
};

/**
 * The four edges as separate wobbly lines, each running a few px past its corners,
 * the way a box is drawn by hand.
 */
function wobblyEdges(w: number, h: number, inset: number): [number, number][][] {
  const corners: [number, number][] = [
    [inset, inset],
    [w - inset, inset],
    [w - inset, h - inset],
    [inset, h - inset],
  ];
  let k = 0;
  return corners.map(([x1, y1], c) => {
    const [x2, y2] = corners[(c + 1) % 4];
    const len = Math.hypot(x2 - x1, y2 - y1);
    const ux = (x2 - x1) / len;
    const uy = (y2 - y1) / len;
    const steps = Math.max(2, Math.round(len / SEGMENT));
    const overshoot = 3 + jitter(k++) * 1.5;
    const points: [number, number][] = [];
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const along = s === 0 ? -overshoot : s === steps ? overshoot : 0;
      const off = jitter(k++) * (s === 0 || s === steps ? 0.6 : 1.6);
      points.push([x1 + (x2 - x1) * t + ux * along - uy * off, y1 + (y2 - y1) * t + uy * along + ux * off]);
    }
    return points;
  });
}

/**
 * Hand-drawn rough.js border overlay that wraps the full extent of `targetRef`,
 * not just its visible viewport — so it stays correct inside a scrollable ancestor.
 * Renders as an absolutely positioned sibling of `targetRef`, sized to match it exactly.
 * The outline draws itself in the first time it scrolls into view; inside a `.sketch-frame`
 * it turns accent on hover.
 */
export function SketchBorder({
  targetRef,
  roughness = 0.9,
  strokeWidth = 1.2,
  bowing = 1,
  className = "",
}: SketchBorderProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const inView = useInView(targetRef, { once: true, margin: "-40px" });

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const measure = () => {
      setSize({ width: target.offsetWidth, height: target.offsetHeight });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(target);
    return () => ro.disconnect();
  }, [targetRef]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !size || size.width <= 0 || size.height <= 0) return;
    svg.innerHTML = "";
    const rc = rough.svg(svg);
    wobblyEdges(size.width, size.height, 2.5).forEach((points, i) => {
      const node = rc.curve(points, {
        stroke: "var(--theme-pencil-light)",
        strokeWidth,
        roughness,
        bowing,
        seed: 7 + i,
      });
      node.querySelectorAll("path").forEach((path) => path.setAttribute("pathLength", "1"));
      svg.appendChild(node);
    });
  }, [size, roughness, strokeWidth, bowing]);

  if (!size) return null;

  return (
    <div
      className={`pointer-events-none absolute left-0 top-0 z-30 w-full ${className}`}
      style={{ height: size.height }}
      aria-hidden
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${size.width} ${size.height}`}
        className={`sketch-draw h-full w-full overflow-visible ${inView ? "is-drawn" : ""}`}
      />
    </div>
  );
}
