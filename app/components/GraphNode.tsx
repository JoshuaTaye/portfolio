"use client";

import { useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import rough from "roughjs";
import { theme } from "@/app/lib/theme";
import { tapTransition } from "@/app/lib/animations";

type GraphNodeProps = {
  id: string;
  label: string;
  x: number;
  y: number;
  radius?: number;
  onClick?: () => void;
  /** Slight scale + fill on hover. */
  hoverable?: boolean;
  /** Currently expanded (active state). */
  active?: boolean;
};

/**
 * Circular or softly rounded node with pencil outline.
 * Sketch border via Rough.js; color fill + scale on hover/active.
 */
export function GraphNode({
  id,
  label,
  x,
  y,
  radius = 28,
  onClick,
  hoverable = true,
  active = false,
}: GraphNodeProps) {
  const circleRef = useRef<SVGGElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const g = circleRef.current;
    if (!g) return;
    g.innerHTML = "";
    const rc = rough.svg(g);
    const node = rc.circle(0, 0, radius * 2, {
      stroke: "var(--theme-pencil-light)",
      strokeWidth: 0.8,
      roughness: 1.2,
      bowing: 0.3,
    });
    if (node) g.appendChild(node);
  }, [radius]);

  return (
    <g
      transform={`translate(${x}, ${y})`}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <g ref={circleRef} />
      <motion.g
        initial={false}
        animate={{
          scale: active ? 1.05 : 1,
        }}
        transition={reducedMotion ? { duration: 0.01 } : tapTransition}
        style={{ transformOrigin: "center" }}
      >
        <motion.circle
          r={radius}
          fill="transparent"
          initial={false}
          animate={{
            fill: active ? "var(--theme-accent)" : "transparent",
            fillOpacity: active ? 0.12 : 0,
          }}
          transition={{ duration: theme.timing.fill, ease: theme.easing.calm }}
          style={{ transformOrigin: "center" }}
        />
      </motion.g>
      {hoverable && (
        <motion.circle
          r={radius}
          fill="var(--theme-accent)"
          fillOpacity={0}
          initial={false}
          whileHover={{ fillOpacity: 0.08 }}
          transition={{ duration: theme.timing.hover, ease: theme.easing.calm }}
          style={{ cursor: onClick ? "pointer" : "default" }}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onClick?.();
            }
          }}
          role={onClick ? "button" : undefined}
          tabIndex={onClick ? 0 : undefined}
          aria-label={onClick ? `Expand ${label}` : label}
        />
      )}
      <text
        x={0}
        y={radius + 14}
        textAnchor="middle"
        className="fill-[var(--theme-base-muted)] text-xs font-medium"
        style={{ pointerEvents: "none" }}
      >
        {label.length > 12 ? label.slice(0, 11) + "…" : label}
      </text>
    </g>
  );
}
