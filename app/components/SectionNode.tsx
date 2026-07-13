"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import rough from "roughjs";
import { theme } from "@/app/lib/theme";
import { cardHover, tapTransition } from "@/app/lib/animations";

type SectionNodeProps = {
  id: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
  width: number;
  height: number;
  accentFill?: boolean;
  /** When true, section is on the expanded path — accent border + glow. */
  isExpanded?: boolean;
  /** When true, section is visible but outside the active root branch. */
  isDimmed?: boolean;
  background?: React.ReactNode;
};

export function SectionNode({
  id,
  title,
  children,
  className = "",
  width,
  height,
  accentFill = true,
  isExpanded = false,
  isDimmed = false,
  background,
}: SectionNodeProps) {
  const borderRef = useRef<SVGSVGElement>(null);
  const reducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const svg = borderRef.current;
    if (!svg || width <= 0 || height <= 0) return;
    svg.innerHTML = "";
    const rc = rough.svg(svg);
    const node = rc.rectangle(2, 2, width - 4, height - 4, {
      stroke: isExpanded ? "var(--theme-accent)" : "var(--theme-pencil-light)",
      strokeWidth: isExpanded ? 1.6 : 0.9,
      roughness: isExpanded ? 1.1 : 1.3,
      bowing: isExpanded ? 0.35 : 0.5,
    });
    if (node) svg.appendChild(node);
  }, [width, height, isExpanded]);

  return (
    <div
      style={{
        width,
        height,
        filter: isExpanded
          ? "var(--theme-card-shadow-expanded)"
          : isDimmed
            ? "blur(1.25px)"
            : undefined,
      }}
    >
      <motion.section
        id={id}
        className={`relative overflow-hidden rounded-sm bg-[var(--theme-card-bg)] ${className}`}
        style={{ width, height }}
        initial="rest"
        whileHover="hover"
        animate={
          reducedMotion
            ? {}
            : {
                opacity: isDimmed ? 0.4 : 1,
                y: hovered || isExpanded || isDimmed ? 0 : [0, 6, 0],
              }
        }
        transition={
          reducedMotion
            ? {}
            : {
                ...tapTransition,
                y:
                  hovered || isExpanded || isDimmed
                    ? { duration: 0.35, ease: theme.easing.calm }
                    : { duration: 8, repeat: Infinity, ease: "easeInOut" },
              }
        }
        variants={reducedMotion ? {} : cardHover}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {accentFill && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-sm"
            style={{ backgroundColor: "var(--theme-accent)" }}
            initial={false}
            animate={{ opacity: isExpanded ? (hovered ? 0.14 : 0.1) : hovered ? 0.08 : 0 }}
            transition={{ duration: theme.timing.fill, ease: theme.easing.calm }}
          />
        )}
        {background && <div className="absolute inset-0 z-0">{background}</div>}
        <svg
          ref={borderRef}
          className="pointer-events-none absolute inset-0 z-[5]"
          width={width}
          height={height}
          aria-hidden
        />
        <div className="relative z-10 p-6">
          {title && (
            <h2
              className={`mb-4 text-sm font-semibold uppercase tracking-wider ${
                isExpanded ? "text-[var(--theme-accent)]" : "text-[var(--theme-base-muted)]"
              }`}
            >
              {title}
            </h2>
          )}
          {children}
        </div>
      </motion.section>
    </div>
  );
}
