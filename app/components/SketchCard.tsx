"use client";

import { useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import rough from "roughjs";
import { theme } from "@/app/lib/theme";
import type { GraphNodeData } from "@/app/lib/graph-data";

type SketchCardProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  data: GraphNodeData;
  roughness?: number;
  className?: string;
  pointerEventsNone?: boolean;
  /** When true, floating dampens and card shows bulge (from parent hover). */
  isHovered?: boolean;
  /** When true, card is on the expanded path — accent border + glow. */
  isExpanded?: boolean;
  /** When true, card is visible but outside the current expanded path. */
  isDimmed?: boolean;
  /** When true, card shows soft ambient glow (dark mode only). */
  darkMode?: boolean;
};

const FLOAT_DURATION_Y = 9;
const FLOAT_DURATION_ROTATE = 12;
const FLOAT_AMPLITUDE_Y = 7;
const FLOAT_AMPLITUDE_ROTATE = 0.5;

/**
 * Floating sketch card. Slow drift + gentle rotation; on hover dampens and bulges.
 * Expanded path cards get an accent stroke and soft glow.
 */
export function SketchCard({
  x,
  y,
  width,
  height,
  data,
  roughness = 1.4,
  className = "",
  pointerEventsNone = false,
  isHovered = false,
  isExpanded = false,
  isDimmed = false,
  darkMode = false,
}: SketchCardProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const reducedMotion = useReducedMotion();
  const noFloat = reducedMotion || isHovered || isExpanded || isDimmed;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || width <= 0 || height <= 0) return;
    svg.innerHTML = "";
    const rc = rough.svg(svg);
    const node = rc.rectangle(2, 2, width - 4, height - 4, {
      stroke: isExpanded ? "var(--theme-accent)" : "var(--theme-pencil-light)",
      strokeWidth: isExpanded ? 1.6 : 0.9,
      roughness: isExpanded ? 1.1 : roughness,
      bowing: isExpanded ? 0.4 : 0.6,
    });
    if (node) svg.appendChild(node);
  }, [width, height, roughness, isExpanded]);

  const description = data.description ?? data.project?.description ?? "";
  const tags = data.tags ?? data.project?.tags ?? [];

  const shadowFilter = isExpanded
    ? "var(--theme-card-shadow-expanded)"
    : isHovered
      ? "var(--theme-card-shadow-hover)"
      : "var(--theme-card-shadow)";

  return (
    <motion.g
      className={className}
      style={{
        pointerEvents: pointerEventsNone ? "none" : undefined,
        transformOrigin: `${x + width / 2}px ${y + height / 2}px`,
        filter: isDimmed ? `${shadowFilter} blur(1.25px)` : shadowFilter,
      }}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{
        opacity: isDimmed ? 0.4 : 1,
        scale: isExpanded ? 1.03 : 1,
        y: noFloat ? 0 : [0, FLOAT_AMPLITUDE_Y, 0],
        rotate: noFloat ? 0 : [0, FLOAT_AMPLITUDE_ROTATE, -FLOAT_AMPLITUDE_ROTATE, 0],
        scaleX: isHovered && !isExpanded ? 1 : undefined,
        scaleY: isHovered && !isExpanded ? 1.02 : undefined,
      }}
      transition={
        reducedMotion
          ? { duration: 0.01 }
          : {
              opacity: { duration: theme.timing.focus, ease: theme.easing.calm },
              scale: { duration: theme.timing.focus, ease: theme.easing.calm },
              y: noFloat
                ? { duration: 0.4, ease: theme.easing.calm }
                : { duration: FLOAT_DURATION_Y, repeat: Infinity, ease: "easeInOut" },
              rotate: noFloat
                ? { duration: 0.4, ease: theme.easing.calm }
                : { duration: FLOAT_DURATION_ROTATE, repeat: Infinity, ease: "easeInOut" },
              scaleY: { duration: 0.25, ease: theme.easing.calm },
            }
      }
    >
      <g transform={`translate(${x}, ${y})`}>
        {/* Soft glow halo behind expanded cards */}
        {isExpanded && (
          <rect
            x={-6}
            y={-6}
            width={width + 12}
            height={height + 12}
            rx={4}
            fill="var(--theme-accent)"
            fillOpacity={darkMode ? 0.12 : 0.08}
            style={{ pointerEvents: "none" }}
          />
        )}
        {/* Invisible hit area so pointer events are captured on the full card area */}
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="transparent"
        />
        {/* Full card background so the entire card is opaque (not just the text box) */}
        <rect
          x={2}
          y={2}
          width={width - 4}
          height={height - 4}
          rx={1}
          fill="var(--theme-card-bg)"
          style={{ pointerEvents: "none" }}
        />
        {/* Accent wash when expanded */}
        {isExpanded && (
          <rect
            x={2}
            y={2}
            width={width - 4}
            height={height - 4}
            rx={1}
            fill="var(--theme-card-expanded-fill)"
            style={{ pointerEvents: "none" }}
          />
        )}
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="overflow-visible"
          aria-hidden
        />
        <foreignObject x={12} y={12} width={width - 24} height={height - 24}>
          <div
            className="flex flex-col gap-2 p-2 text-left"
            style={{
              color: "var(--theme-base)",
              fontFamily: "var(--font-sans), system-ui, sans-serif",
              background: "transparent",
            }}
          >
            <h3
              className={`text-sm font-semibold ${
                isExpanded ? "text-[var(--theme-accent)]" : "text-[var(--theme-base)]"
              }`}
            >
              {data.label}
            </h3>
            {description && (
              <p className="text-xs leading-relaxed text-[var(--theme-base-muted)]">{description}</p>
            )}
            {tags.length > 0 && (
              <ul className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <li
                    key={tag}
                    className={`rounded border px-1.5 py-0.5 text-[10px] ${
                      isExpanded
                        ? "border-[var(--theme-accent)]/40 text-[var(--theme-base-muted)]"
                        : "border-[var(--theme-pencil-light)] text-[var(--theme-base-muted)]"
                    }`}
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </foreignObject>
        <motion.rect
          x={4}
          y={4}
          width={width - 8}
          height={height - 8}
          rx={2}
          fill="var(--theme-accent)"
          fillOpacity={0}
          initial={false}
          whileHover={{ fillOpacity: isExpanded ? 0.04 : 0.06 }}
          transition={{ duration: theme.timing.hover, ease: theme.easing.calm }}
          style={{ pointerEvents: "none" }}
        />
      </g>
    </motion.g>
  );
}
