"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import rough from "roughjs";
import { theme } from "@/app/lib/theme";

type SketchEdgeProps = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Slight curve for a softer line. */
  curved?: boolean;
  /** Animate drawing in (stroke-dashoffset). */
  animate?: boolean;
  /** Fade the connection when its destination card is outside the active branch. */
  isDimmed?: boolean;
  className?: string;
};

/**
 * Edge between two points. Rough.js sketch stroke; optional stroke-dashoffset "drawn" effect.
 * Renders inside parent SVG — pass canvas-space coordinates.
 */
export function SketchEdge({
  x1,
  y1,
  x2,
  y2,
  curved = true,
  animate = true,
  isDimmed = false,
  className = "",
}: SketchEdgeProps) {
  const roughRef = useRef<SVGGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const reducedMotion = useReducedMotion();

  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  const pathD = curved
    ? `M ${x1} ${y1} Q ${cx + (y2 - y1) * 0.15} ${cy - (x2 - x1) * 0.15} ${x2} ${y2}`
    : `M ${x1} ${y1} L ${x2} ${y2}`;

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    try {
      setPathLength(path.getTotalLength());
    } catch {
      setPathLength(0);
    }
  }, [pathD]);

  useEffect(() => {
    const g = roughRef.current;
    if (!g) return;
    g.innerHTML = "";
    const rc = rough.svg(g as unknown as SVGSVGElement);
    const opts = {
      stroke: "var(--theme-pencil-light)",
      strokeWidth: 0.6,
      roughness: 1.4,
      bowing: 0.4,
    };
    const node = rc.line(x1, y1, x2, y2, opts);
    if (node) g.appendChild(node);
  }, [x1, y1, x2, y2]);

  const shouldAnimate = animate && !reducedMotion && pathLength > 0;

  return (
    <motion.g
      className={className}
      aria-hidden
      initial={false}
      animate={{ opacity: isDimmed ? 0.12 : 1 }}
      transition={{ duration: theme.timing.focus, ease: theme.easing.calm }}
    >
      <g ref={roughRef} />
      <motion.path
        ref={pathRef}
        d={pathD}
        fill="none"
        stroke="var(--theme-pencil-light)"
        strokeWidth={0.5}
        strokeDasharray={pathLength}
        initial={{ strokeDashoffset: pathLength }}
        animate={{ strokeDashoffset: shouldAnimate ? 0 : pathLength }}
        transition={{
          duration: theme.timing.edgeDraw,
          ease: theme.easing.calm,
        }}
        style={{ pointerEvents: "none", visibility: shouldAnimate ? "visible" : "hidden" }}
      />
    </motion.g>
  );
}
