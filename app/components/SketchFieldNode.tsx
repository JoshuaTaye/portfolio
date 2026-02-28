"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import rough from "roughjs";
import { theme } from "@/app/lib/theme";

type SketchFieldNodeProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
  type?: "text" | "email";
  /** For explosion animation order */
  index?: number;
  darkMode?: boolean;
};

const roughness = 1.4;

export function SketchFieldNode({
  x,
  y,
  width,
  height,
  label,
  value,
  onChange,
  multiline = false,
  placeholder = "",
  type = "text",
  index = 0,
  darkMode = false,
}: SketchFieldNodeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || width <= 0 || height <= 0) return;
    svg.innerHTML = "";
    const rc = rough.svg(svg);
    const node = rc.rectangle(2, 2, width - 4, height - 4, {
      stroke: "var(--theme-pencil-light)",
      strokeWidth: 0.9,
      roughness,
      bowing: 0.6,
    });
    if (node) svg.appendChild(node);
  }, [width, height]);

  const inputId = `inquiry-${label.replace(/\s/g, "-").toLowerCase()}`;

  return (
    <motion.g
      style={{ transformOrigin: `${x + width / 2}px ${y + height / 2}px` }}
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.45,
        ease: theme.easing.calm,
        delay: index * 0.08,
      }}
    >
      <g transform={`translate(${x}, ${y})`}>
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="transparent"
          style={{ pointerEvents: "none" }}
        />
        <rect
          x={2}
          y={2}
          width={width - 4}
          height={height - 4}
          rx={1}
          fill="var(--theme-card-bg)"
          style={{ pointerEvents: "none" }}
        />
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="overflow-visible"
          aria-hidden
          style={{ pointerEvents: "none" }}
        />
        <foreignObject x={8} y={6} width={width - 16} height={height - 12}>
          <div
            className="flex h-full w-full flex-col gap-0.5 bg-[var(--theme-card-bg)]"
            style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
          >
            <label
              htmlFor={inputId}
              className="text-[10px] font-medium uppercase tracking-wider text-[var(--theme-base-muted)]"
            >
              {label}
            </label>
            {multiline ? (
              <textarea
                id={inputId}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="min-h-0 w-full resize-none rounded border-0 bg-transparent p-0 text-sm leading-snug text-[var(--theme-base)] placeholder:text-[var(--theme-base-muted)] focus:outline-none focus:ring-0"
                style={{ color: "var(--theme-base)", minHeight: height - 28 }}
              />
            ) : (
              <input
                id={inputId}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full border-0 bg-transparent p-0 text-sm text-[var(--theme-base)] placeholder:text-[var(--theme-base-muted)] focus:outline-none focus:ring-0"
                style={{ color: "var(--theme-base)" }}
              />
            )}
          </div>
        </foreignObject>
      </g>
    </motion.g>
  );
}
