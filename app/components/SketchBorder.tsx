"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import rough from "roughjs";

type SketchBorderProps = {
  /** Element whose full (unclipped) content size the border should wrap around. */
  targetRef: RefObject<HTMLElement | null>;
  roughness?: number;
  strokeWidth?: number;
  bowing?: number;
  className?: string;
};

/**
 * Hand-drawn rough.js border overlay that wraps the full extent of `targetRef`,
 * not just its visible viewport — so it stays correct inside a scrollable ancestor.
 * Renders as an absolutely positioned sibling of `targetRef`, sized to match it exactly.
 */
export function SketchBorder({
  targetRef,
  roughness = 1.3,
  strokeWidth = 1,
  bowing = 0.5,
  className = "",
}: SketchBorderProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

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
    const node = rc.rectangle(1.5, 1.5, size.width - 3, size.height - 3, {
      stroke: "var(--theme-pencil-light)",
      strokeWidth,
      roughness,
      bowing,
    });
    if (node) svg.appendChild(node);
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
        className="h-full w-full overflow-visible"
      />
    </div>
  );
}
