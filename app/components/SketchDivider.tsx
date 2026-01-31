"use client";

import { useEffect, useRef } from "react";
import rough from "roughjs";

type SketchDividerProps = {
  width: number;
  height: number;
  className?: string;
  /** Optional: slight jitter on hover — pencil redraw feel */
  animated?: boolean;
};

export function SketchDivider({ width, height, className = "", animated = false }: SketchDividerProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || width <= 0 || height <= 0) return;
    svg.innerHTML = "";
    const rc = rough.svg(svg);
    const node = rc.rectangle(0, 0, width, height, {
      stroke: "var(--theme-pencil)",
      strokeWidth: 0.8,
      roughness: 1.2,
      bowing: 0.5,
    });
    if (node) svg.appendChild(node);
  }, [width, height, animated]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className={className}
      aria-hidden
    />
  );
}

/** Thin horizontal or vertical pencil line (no fill). */
export function SketchLine({
  direction = "horizontal",
  length,
  className = "",
}: {
  direction?: "horizontal" | "vertical";
  length: number;
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const w = direction === "horizontal" ? length : 2;
  const h = direction === "vertical" ? length : 2;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || length <= 0) return;
    svg.innerHTML = "";
    const rc = rough.svg(svg);
    const opts = { stroke: "var(--theme-pencil-light)", strokeWidth: 0.6, roughness: 1.5 };
    const node =
      direction === "horizontal"
        ? rc.line(0, 1, length, 1, opts)
        : rc.line(1, 0, 1, length, opts);
    if (node) svg.appendChild(node);
  }, [direction, length]);

  return (
    <svg
      ref={svgRef}
      width={w}
      height={h}
      className={className}
      aria-hidden
    />
  );
}
