"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import rough from "roughjs";
import { theme } from "@/app/lib/theme";

type SketchButtonNodeProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  /** For explosion animation order */
  index?: number;
};

const roughness = 1.4;

export function SketchButtonNode({
  x,
  y,
  width,
  height,
  label,
  onClick,
  disabled = false,
  index = 0,
}: SketchButtonNodeProps) {
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

  return (
    <motion.g
      style={{
        transformOrigin: `${x + width / 2}px ${y + height / 2}px`,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.45,
        ease: theme.easing.calm,
        delay: index * 0.08,
      }}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
    >
      <g transform={`translate(${x}, ${y})`}>
        <rect x={0} y={0} width={width} height={height} fill="transparent" />
        <rect
          x={2}
          y={2}
          width={width - 4}
          height={height - 4}
          rx={1}
          fill="var(--theme-background)"
          style={{ pointerEvents: "none" }}
        />
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="overflow-visible"
          aria-hidden
        />
        <foreignObject x={4} y={4} width={width - 8} height={height - 8}>
          <div
            className="flex h-full w-full items-center justify-center bg-transparent"
            style={{
              fontFamily: "var(--font-sans), system-ui, sans-serif",
              color: "var(--theme-base)",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {label}
          </div>
        </foreignObject>
        {!disabled && (
          <motion.rect
            x={4}
            y={4}
            width={width - 8}
            height={height - 8}
            rx={2}
            fill="var(--theme-accent)"
            fillOpacity={0}
            initial={false}
            whileHover={{ fillOpacity: 0.1 }}
            transition={{ duration: theme.timing.hover, ease: theme.easing.calm }}
            style={{ pointerEvents: "none" }}
          />
        )}
      </g>
    </motion.g>
  );
}
