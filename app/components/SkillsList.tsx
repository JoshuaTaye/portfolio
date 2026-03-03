"use client";

import { useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import rough from "roughjs";
import { skillCategories } from "@/app/lib/seed-data";
import { theme } from "@/app/lib/theme";

type SkillsListProps = {
  x: number;
  y: number;
  width?: number;
  darkMode?: boolean;
};

const LIST_W = 300;
const FLOAT_DURATION_Y = 9;
const FLOAT_DURATION_ROTATE = 12;
const FLOAT_AMPLITUDE_Y = 7;
const FLOAT_AMPLITUDE_ROTATE = 0.5;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: theme.easing.calm },
  },
};

export function SkillsList({ x, y, width = LIST_W}: SkillsListProps) {
  const borderRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const height = useRef(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = containerRef.current;
    const svg = borderRef.current;
    if (!el || !svg) return;

    const h = el.offsetHeight;
    height.current = h;
    svg.setAttribute("height", String(h));
    svg.innerHTML = "";
    const rc = rough.svg(svg);
    const node = rc.rectangle(2, 2, width - 4, h - 4, {
      stroke: "var(--theme-pencil-light)",
      strokeWidth: 0.9,
      roughness: 1.4,
      bowing: 0.6,
    });
    if (node) svg.appendChild(node);
  });

  return (
    <motion.div
      className="absolute"
      style={{
        left: x,
        top: y,
        width,
        filter: "var(--theme-card-shadow)",
      }}
      initial={{ opacity: 0, scale: 0.82 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: reducedMotion ? 0 : [0, FLOAT_AMPLITUDE_Y, 0],
        rotate: reducedMotion ? 0 : [0, FLOAT_AMPLITUDE_ROTATE, -FLOAT_AMPLITUDE_ROTATE, 0],
      }}
      exit={{ opacity: 0, scale: 0.82 }}
      transition={
        reducedMotion
          ? { duration: 0.01 }
          : {
              opacity: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] },
              scale: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] },
              y: { duration: FLOAT_DURATION_Y, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: FLOAT_DURATION_ROTATE, repeat: Infinity, ease: "easeInOut" },
            }
      }
    >
      <div
        ref={containerRef}
        className="relative overflow-hidden bg-[var(--theme-card-bg)]"
        style={{ width }}
      >
        <motion.div
          className="flex flex-col gap-5 p-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {skillCategories.map((cat) => (
            <motion.div key={cat.id} variants={itemVariants}>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--theme-accent)]">
                {cat.label}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {cat.items.map((item) => (
                  <span
                    key={item}
                    className="rounded border border-[var(--theme-pencil-light)] px-1.5 py-0.5 text-[10px] text-[var(--theme-base-muted)] transition-colors duration-200 hover:border-[var(--theme-accent)] hover:text-[var(--theme-base)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <svg
        ref={borderRef}
        className="pointer-events-none absolute inset-0"
        width={width}
        height={0}
        aria-hidden
      />
    </motion.div>
  );
}
