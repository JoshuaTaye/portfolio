"use client";

import { useEffect, useRef, useState } from "react";
import {
  MotionConfig,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import rough from "roughjs";
import type { Options } from "roughjs/bin/core";
import { useMediaQuery, usePrefersReducedMotion } from "@/app/lib/client-hooks";

/*
 * Hero illustration: "the full stack" as a hand-drawn isometric stack of four slabs.
 * The slabs drop in and assemble on load; scrolling pulls them apart into an exploded view,
 * with a label for each layer and a dimension line that stretches with the stack.
 * Rough.js paths use fixed seeds, so the drawing is identical on the server and the client.
 */

const VB_W = 600;
const VB_H = 580;
/** x of the slabs' centre line, half-diagonals of the top face, and slab thickness. */
const CX = 230;
const HW = 148;
const HH = 74;
const T = 24;
const SPACING_ASSEMBLED = 30;
const SPACING_EXPLODED = 122;

type Layer = { name: string; tech: string; glyph: "window" | "braces" | "table" | "grid" };

/** Top to bottom. */
const LAYERS: Layer[] = [
  { name: "Interface", tech: "React · Next.js · Angular", glyph: "window" },
  { name: "API", tech: "Spring Boot · Java 21", glyph: "braces" },
  { name: "Data", tech: "PostgreSQL · Liquibase", glyph: "table" },
  { name: "Infra", tech: "Docker · CI/CD · Prometheus", glyph: "grid" },
];

const gen = rough.generator();
const pathsOf = (drawable: ReturnType<typeof gen.polygon>) => gen.toPaths(drawable).map((p) => p.d);

const pencil: Options = { roughness: 1.1, bowing: 0.8, strokeWidth: 1.4, stroke: "#000" };

type Pt = [number, number];
const TOP: Pt[] = [
  [CX, 0],
  [CX + HW, HH],
  [CX, 2 * HH],
  [CX - HW, HH],
];
const LEFT: Pt[] = [
  [CX - HW, HH],
  [CX, 2 * HH],
  [CX, 2 * HH + T],
  [CX - HW, HH + T],
];
const RIGHT: Pt[] = [
  [CX + HW, HH],
  [CX, 2 * HH],
  [CX, 2 * HH + T],
  [CX + HW, HH + T],
];
const pts = (p: Pt[]) => p.map((q) => q.join(",")).join(" ");

/** Glyphs are drawn on a flat 100×100 square, then projected onto the slab's top face. */
const TOP_FACE_MATRIX = `matrix(${HW / 100} ${HH / 100} ${-HW / 100} ${HH / 100} ${CX} 0)`;

function glyphPaths(glyph: Layer["glyph"], seed: number): string[] {
  const o: Options = { ...pencil, seed, strokeWidth: 1.6, roughness: 0.9 };
  switch (glyph) {
    case "window":
      return [
        gen.rectangle(22, 24, 56, 52, o),
        gen.line(22, 36, 78, 36, o),
        gen.line(30, 48, 64, 48, o),
        gen.line(30, 58, 54, 58, o),
        gen.line(30, 67, 60, 67, o),
      ].flatMap(pathsOf);
    case "braces":
      return [
        gen.path("M42 24 C30 24 38 48 28 50 C38 52 30 76 42 76", o),
        gen.path("M58 24 C70 24 62 48 72 50 C62 52 70 76 58 76", o),
      ].flatMap(pathsOf);
    case "table":
      return [
        gen.rectangle(22, 26, 56, 48, o),
        gen.line(22, 38, 78, 38, o),
        gen.line(22, 50, 78, 50, o),
        gen.line(22, 62, 78, 62, o),
        gen.line(40, 26, 40, 74, o),
      ].flatMap(pathsOf);
    case "grid":
      return [0, 1, 2].flatMap((r) =>
        [0, 1, 2].flatMap((c) => pathsOf(gen.rectangle(24 + c * 19, 24 + r * 19, 14, 14, { ...o, seed: seed + r * 3 + c })))
      );
  }
}

/** Precomputed once at module load: everything except the colours, which come from CSS. */
const SLABS = LAYERS.map((layer, i) => {
  const seed = 11 + i * 7;
  return {
    ...layer,
    outline: [gen.polygon(TOP, { ...pencil, seed }), gen.polygon(LEFT, { ...pencil, seed: seed + 1 }), gen.polygon(RIGHT, { ...pencil, seed: seed + 2 })].flatMap(pathsOf),
    hachure: pathsOf(
      gen.polygon(TOP, { seed, stroke: "none", fill: "#000", fillStyle: "hachure", hachureGap: 7, fillWeight: 1.2, roughness: 1 })
    ),
    glyph: glyphPaths(layer.glyph, seed + 3),
  };
});

/** Vertical offset of slab `i` for a given gap between slabs, keeping the stack centred. */
const slabY = (i: number, spacing: number) => VB_H / 2 - (2 * HH + T) / 2 + (i - (LAYERS.length - 1) / 2) * spacing;

/**
 * Scroll progress for the explosion: 0 until the drawing's top reaches 60% of the viewport,
 * then 0→1 over the next third of a viewport. On load it is usually already in place, so
 * the first scroll starts taking it apart.
 */
function useExplodeProgress(ref: React.RefObject<HTMLElement | null>) {
  const { scrollY } = useScroll();
  const range = useRef({ start: 0, length: 400 });
  useEffect(() => {
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      range.current = { start: Math.max(0, top - window.innerHeight * 0.6), length: window.innerHeight * 0.32 };
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [ref]);
  const raw = useTransform(scrollY, (y) => Math.min(1, Math.max(0, (y - range.current.start) / range.current.length)));
  return useSpring(raw, { stiffness: 140, damping: 26, mass: 0.6 });
}

function Slab({
  index,
  progress,
  active,
  onActive,
  reduced,
}: {
  index: number;
  progress: MotionValue<number>;
  active: boolean;
  onActive: (i: number | null) => void;
  reduced: boolean;
}) {
  const slab = SLABS[index];
  const y = useTransform(progress, (p) => slabY(index, SPACING_ASSEMBLED + (SPACING_EXPLODED - SPACING_ASSEMBLED) * p));
  // Labels fade in one after another as the stack opens up.
  const labelOpacity = useTransform(progress, [0.25 + index * 0.1, 0.55 + index * 0.1], [0, 1]);
  const leader = useTransform(progress, [0.2 + index * 0.1, 0.5 + index * 0.1], [0, 1]);

  return (
    <motion.g style={{ y }}>
      <motion.g
        initial={reduced ? false : { opacity: 0, y: -90 }}
        animate={{ opacity: 1, y: 0 }}
        // Bottom slab lands first, so the stack builds up.
        transition={{ type: "spring", stiffness: 170, damping: 17, delay: 0.25 + (LAYERS.length - 1 - index) * 0.16 }}
      >
        <motion.g
          animate={{ y: active ? -10 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          onPointerEnter={() => onActive(index)}
          onPointerLeave={() => onActive(null)}
        >
          {/* Solid faces hide the slabs behind; the side faces are shaded a little darker. */}
          <polygon points={pts(TOP)} fill="var(--theme-card-bg)" />
          <polygon points={pts(LEFT)} fill="var(--theme-card-bg)" />
          <polygon points={pts(LEFT)} fill="var(--theme-pencil-light)" opacity={0.18} />
          <polygon points={pts(RIGHT)} fill="var(--theme-card-bg)" />
          <polygon points={pts(RIGHT)} fill="var(--theme-pencil-light)" opacity={0.34} />
          <g
            fill="none"
            stroke="var(--theme-accent)"
            strokeWidth={1.2}
            style={{ opacity: active ? 0.55 : 0.18, transition: "opacity 0.3s" }}
          >
            {slab.hachure.map((d, k) => (
              <path key={k} d={d} />
            ))}
          </g>
          <g transform={TOP_FACE_MATRIX} fill="none" stroke={active ? "var(--theme-accent-ink)" : "var(--theme-base-muted)"} strokeWidth={1.6} strokeLinecap="round">
            {slab.glyph.map((d, k) => (
              <path key={k} d={d} vectorEffect="non-scaling-stroke" />
            ))}
          </g>
          <g fill="none" stroke="var(--theme-pencil)" strokeWidth={1.4} strokeLinecap="round">
            {slab.outline.map((d, k) => (
              <path key={k} d={d} />
            ))}
          </g>
        </motion.g>
      </motion.g>

      {/* Leader line from the slab's right corner, then the label. */}
      <g onPointerEnter={() => onActive(index)} onPointerLeave={() => onActive(null)}>
        <motion.path
          d={`M ${CX + HW + 4} ${HH} L ${CX + HW + 40} ${HH}`}
          stroke="var(--theme-pencil-light)"
          strokeWidth={1.3}
          fill="none"
          style={{ pathLength: leader }}
        />
        <motion.g style={{ opacity: labelOpacity }}>
          <circle cx={CX + HW + 4} cy={HH} r={2.6} fill="var(--theme-accent)" />
          <text
            x={CX + HW + 48}
            y={HH + 2}
            className="font-hand"
            fontSize={24}
            fill={active ? "var(--theme-accent-ink)" : "var(--theme-base)"}
            style={{ transition: "fill 0.3s" }}
          >
            {slab.name}
          </text>
          <text
            x={CX + HW + 49}
            y={HH + 24}
            className="max-sm:hidden"
            fontSize={14}
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fill="var(--theme-base-muted)"
          >
            {slab.tech}
          </text>
        </motion.g>
      </g>
    </motion.g>
  );
}

/** Dimension line down the left side, measuring the whole stack: "the full stack". */
function Dimension({ progress }: { progress: MotionValue<number> }) {
  const spacing = useTransform(progress, (p) => SPACING_ASSEMBLED + (SPACING_EXPLODED - SPACING_ASSEMBLED) * p);
  const y1 = useTransform(spacing, (s) => slabY(0, s) + HH);
  const y2 = useTransform(spacing, (s) => slabY(LAYERS.length - 1, s) + HH + T);
  const mid = useTransform([y1, y2], ([a, b]: number[]) => (a + b) / 2);
  const x = CX - HW - 34;

  return (
    <g stroke="var(--theme-pencil-light)" strokeWidth={1.2} fill="none">
      <motion.line x1={x} x2={x} y1={y1} y2={y2} />
      <motion.line x1={x - 7} x2={x + 7} y1={y1} y2={y1} />
      <motion.line x1={x - 7} x2={x + 7} y1={y2} y2={y2} />
      <motion.line x1={x + 10} x2={CX - HW - 6} y1={y1} y2={y1} strokeDasharray="3 4" />
      <motion.line x1={x + 10} x2={CX - HW - 6} y1={y2} y2={y2} strokeDasharray="3 4" />
      <motion.g style={{ y: mid }}>
        <text
          transform={`translate(${x - 12} 0) rotate(-90)`}
          textAnchor="middle"
          className="font-hand"
          fontSize={17}
          stroke="none"
          fill="var(--theme-accent-ink)"
        >
          the full stack
        </text>
      </motion.g>
    </g>
  );
}

export function ExplodedStack({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const scrollProgress = useExplodeProgress(ref);
  // With reduced motion the stack is shown fully open, with every label, and nothing moves.
  const staticProgress = useMotionValue(1);
  const progress = reduced ? staticProgress : scrollProgress;
  const [active, setActive] = useState<number | null>(null);
  const hintOpacity = useTransform(progress, [0, 0.12], [1, 0]);
  // On wide screens the drawing lags behind the scroll so it stays in view while it opens,
  // then fades out before it reaches the next section.
  const isWide = useMediaQuery("(min-width: 1024px)");
  // Phones hide the tech lines, so the frame is cropped to the stack and its names.
  const isPhone = useMediaQuery("(max-width: 639px)");
  const { scrollY } = useScroll();
  const drift = useTransform(scrollY, (y) => (isWide && !reduced ? Math.min(y, 900) * 0.62 : 0));
  const fade = useTransform(scrollY, (y) => {
    if (!isWide || reduced) return 1;
    const vh = window.innerHeight;
    return 1 - Math.min(1, Math.max(0, (y - vh * 0.45) / (vh * 0.35)));
  });

  return (
    <MotionConfig reducedMotion="user">
      <div ref={ref} className={className}>
        <motion.div style={{ y: drift, opacity: fade }} className="relative">
          <svg
            viewBox={isPhone ? `20 0 500 ${VB_H}` : `0 0 ${VB_W} ${VB_H}`}
            className="h-auto w-full overflow-visible"
            role="img"
            aria-label="Hand-drawn stack of four layers: Interface (React, Next.js, Angular), API (Spring Boot, Java 21), Data (PostgreSQL, Liquibase) and Infra (Docker, CI/CD, Prometheus)."
          >
            <Dimension progress={progress} />
            {/* Painted bottom-up so upper slabs sit in front of lower ones. */}
            {LAYERS.map((_, i) => LAYERS.length - 1 - i).map((i) => (
              <Slab key={i} index={i} progress={progress} active={active === i} onActive={setActive} reduced={reduced} />
            ))}
          </svg>
          {!reduced && (
            <motion.p
              style={{ opacity: hintOpacity, paddingRight: isPhone ? "16%" : "24%" }}
              className="font-hand pointer-events-none absolute inset-x-0 top-[77%] text-center text-base text-[var(--theme-base-muted)]"
              aria-hidden
            >
              scroll to take it apart ↓
            </motion.p>
          )}
        </motion.div>
      </div>
    </MotionConfig>
  );
}
