"use client";

import React, { useRef, useEffect, useState, useCallback, useId } from "react";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
  useTransformContext,
} from "react-zoom-pan-pinch";
import rough from "roughjs";
import { motion, AnimatePresence } from "framer-motion";
import { SectionNode } from "./SectionNode";
import { SketchEdge } from "./SketchEdge";
import { SketchCard } from "./SketchCard";
import { SketchFieldNode } from "./SketchFieldNode";
import { SketchButtonNode } from "./SketchButtonNode";
import { SocialIcon, isSocialIcon, EmailIcon, PhoneIcon, SendIcon } from "./SocialIcons";
import { projects, featuredProjects, aboutText, contact, experiences, hero, type Experience, type Project } from "@/app/lib/seed-data";
import { getChildrenIds, getNode, getPathToNode } from "@/app/lib/graph-data";
import { getCardPositions, LAYOUT, ROOT_SIZES } from "@/app/lib/canvas-layout";
import { INQUIRY_LIMITS } from "@/app/lib/inquiry";
import { useInquiryForm } from "@/app/lib/use-inquiry-form";
import { theme } from "@/app/lib/theme";

/** Very large canvas so panning feels infinite and outermost cards are never cut. */
const CANVAS_SIZE = 12000;
const CANVAS_WIDTH = CANVAS_SIZE;
const CANVAS_HEIGHT = CANVAS_SIZE;

const CX = CANVAS_WIDTH / 2;
const CY = CANVAS_HEIGHT / 2;

const { w: INTRO_W, h: INTRO_H } = ROOT_SIZES.intro;
const { w: PROJECTS_W, h: PROJECTS_H } = ROOT_SIZES.projects;
const { w: ABOUT_W, h: ABOUT_H } = ROOT_SIZES.about;
const { w: CONTACT_W, h: CONTACT_H } = ROOT_SIZES.contact;

const ROOT_CENTERS: Record<string, { x: number; y: number }> = {
  intro: { x: CX, y: CY - 80 + INTRO_H / 2 },
  projects: { x: CX + INTRO_W / 2 + 80 + PROJECTS_W / 2, y: CY - 40 },
  about: { x: CX, y: CY + INTRO_H + 60 + ABOUT_H / 2 },
  contact: { x: CX - INTRO_W / 2 - 80 - CONTACT_W / 2, y: CY - 20 + CONTACT_H / 2 },
};

/** Top-left positions for root section divs (for absolute positioning). */
const INTRO_LEFT = CX - INTRO_W / 2;
const INTRO_TOP = CY - 80 - INTRO_H / 2;
const PROJECTS_LEFT = CX + INTRO_W / 2 + 80;
const PROJECTS_TOP = CY - 40 - PROJECTS_H / 2;
const ABOUT_LEFT = CX - ABOUT_W / 2;
const ABOUT_TOP = CY + INTRO_H + 60;
const CONTACT_LEFT = CX - INTRO_W / 2 - CONTACT_W - 80;
const CONTACT_TOP = CY - 20 - CONTACT_H / 2;

/** Bounding box of the four root cards — what the initial view has to show in full. */
const ROOT_BOUNDS = {
  left: CONTACT_LEFT,
  right: PROJECTS_LEFT + PROJECTS_W,
  top: Math.min(INTRO_TOP, PROJECTS_TOP, CONTACT_TOP),
  bottom: ABOUT_TOP + ABOUT_H,
};

const MIN_SCALE = 0.5;
const MAX_SCALE = 1.8;
const DEFAULT_SCALE = 0.85;
const FIT_PADDING = 48;

/** Scale and offset that center all root cards in a viewport of the given size. */
function fitRootsToViewport(width: number, height: number) {
  const boundsW = ROOT_BOUNDS.right - ROOT_BOUNDS.left;
  const boundsH = ROOT_BOUNDS.bottom - ROOT_BOUNDS.top;
  const fit = Math.min((width - FIT_PADDING * 2) / boundsW, (height - FIT_PADDING * 2) / boundsH);
  const scale = Math.min(DEFAULT_SCALE, Math.max(MIN_SCALE, fit));
  const centerX = (ROOT_BOUNDS.left + ROOT_BOUNDS.right) / 2;
  const centerY = (ROOT_BOUNDS.top + ROOT_BOUNDS.bottom) / 2;
  return { scale, x: width / 2 - centerX * scale, y: height / 2 - centerY * scale };
}

const { CARD_W, CARD_H } = LAYOUT;

/** Camera pans are instant for visitors who prefer reduced motion. */
function panDuration() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 500;
}

/**
 * On-screen canvas controls: back to the page, zoom in/out, recenter, and a short usage hint.
 * Keyboard: + / − to zoom, 0 to recenter (ignored while typing in the contact form).
 */
function CanvasControls({
  containerRef,
  onReset,
  onExit,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  onReset: () => void;
  onExit: () => void;
}) {
  const { zoomIn, zoomOut, setTransform } = useControls();
  const transformContext = useTransformContext();

  // Keyboard users: when Tab lands on a card outside the visible area, pan the canvas to it.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || target.closest("[data-canvas-chrome]")) return;
      // The browser may natively scroll the clipped wrapper to reveal focus; undo that first.
      const wrapper = container.querySelector(".react-transform-wrapper");
      if (wrapper) {
        wrapper.scrollTop = 0;
        wrapper.scrollLeft = 0;
      }
      const rect = target.getBoundingClientRect();
      const box = container.getBoundingClientRect();
      const margin = 80;
      const inView =
        rect.left >= box.left + margin &&
        rect.right <= box.right - margin &&
        rect.top >= box.top + margin &&
        rect.bottom <= box.bottom - margin;
      if (inView) return;
      const { positionX, positionY, scale } = transformContext.transformState;
      const dx = box.left + box.width / 2 - (rect.left + rect.width / 2);
      const dy = box.top + box.height / 2 - (rect.top + rect.height / 2);
      setTransform(positionX + dx, positionY + dy, scale, panDuration(), "easeOutCubic");
    };
    container.addEventListener("focusin", onFocusIn);
    return () => container.removeEventListener("focusin", onFocusIn);
  }, [containerRef, setTransform, transformContext]);

  const recenter = useCallback(() => {
    onReset();
    const container = containerRef.current;
    if (!container) return;
    const fit = fitRootsToViewport(container.clientWidth, container.clientHeight);
    setTransform(fit.x, fit.y, fit.scale, panDuration(), "easeOutCubic");
  }, [containerRef, onReset, setTransform]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.metaKey || event.ctrlKey || target?.closest("input, textarea, [contenteditable]")) return;
      if (event.key === "+" || event.key === "=") zoomIn(0.3);
      else if (event.key === "-" || event.key === "_") zoomOut(0.3);
      else if (event.key === "0") recenter();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [zoomIn, zoomOut, recenter]);

  const buttonClass =
    "flex h-10 w-10 items-center justify-center text-[var(--theme-base)] transition-colors hover:bg-[var(--theme-accent)]/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--theme-accent)]";

  return (
    <>
      <button
        type="button"
        onClick={onExit}
        data-canvas-chrome
        className="fixed left-4 top-4 z-50 inline-flex h-10 items-center gap-2 border border-[var(--theme-pencil-light)] bg-[var(--theme-card-bg)] px-3 text-sm font-medium text-[var(--theme-base)] shadow-sm transition-colors hover:border-[var(--theme-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)]"
      >
        <span aria-hidden>←</span> Back to page view
      </button>
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col border border-[var(--theme-pencil-light)] bg-[var(--theme-card-bg)] shadow-sm"
        role="group"
        aria-label="Canvas zoom"
        data-canvas-chrome
      >
        <button type="button" onClick={() => zoomIn(0.3)} className={buttonClass} aria-label="Zoom in" aria-keyshortcuts="+">
          <span aria-hidden className="text-lg leading-none">+</span>
        </button>
        <button type="button" onClick={() => zoomOut(0.3)} className={`${buttonClass} border-y border-[var(--theme-pencil-light)]/50`} aria-label="Zoom out" aria-keyshortcuts="-">
          <span aria-hidden className="text-lg leading-none">−</span>
        </button>
        <button type="button" onClick={recenter} className={buttonClass} aria-label="Recenter and collapse" aria-keyshortcuts="0">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="3" strokeWidth={2} />
            <path strokeLinecap="round" strokeWidth={2} d="M12 2v4m0 12v4M2 12h4m12 0h4" />
          </svg>
        </button>
      </div>
      <p className="pointer-events-none fixed bottom-6 left-1/2 z-40 -translate-x-1/2 border border-[var(--theme-pencil-light)]/60 bg-[var(--theme-card-bg)]/90 px-3 py-1.5 text-xs text-[var(--theme-base-muted)] backdrop-blur-sm">
        Drag to pan · Scroll to zoom · Click a card to open it
      </p>
    </>
  );
}

/** Ignores keys bubbling up from links and buttons nested inside a clickable card. */
function isOwnKey(event: React.KeyboardEvent) {
  return event.target === event.currentTarget && (event.key === "Enter" || event.key === " ");
}

/** Opt-in "explore as canvas" view: the portfolio as a pannable, zoomable sketch map (≥1024px). */
export function CanvasView({
  darkMode,
  resumeUrl,
  onSelectProject,
  onSelectExperience,
  onOpenBio,
  onExit,
}: {
  darkMode: boolean;
  resumeUrl: string | null;
  onSelectProject: (project: Project) => void;
  onSelectExperience: (experience: Experience) => void;
  onOpenBio: () => void;
  /** Return to the scroll page. */
  onExit: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevPathKeyRef = useRef("");
  const [initialView] = useState(() => fitRootsToViewport(window.innerWidth, window.innerHeight));
  const [expandedPath, setExpandedPath] = useState<string[]>([]);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [introHovered, setIntroHovered] = useState(false);
  const [inquiryFormOpen, setInquiryFormOpen] = useState(false);
  const inquiry = useInquiryForm();
  const resetInquiry = inquiry.reset;

  const toggleRoot = useCallback((rootId: string) => {
    setInquiryFormOpen(false);
    setExpandedPath((prev) => {
      if (prev[0] !== rootId) return [rootId];
      // Return to the root card from a nested card. This keeps the root
      // expanded, collapses its descendants, and triggers re-centering.
      if (prev.length > 1) return [rootId];
      return [];
    });
  }, []);

  const expandToCard = useCallback((nodeId: string) => {
    const nodePath = getPathToNode(nodeId);
    setInquiryFormOpen(false);
    setExpandedPath((prev) => {
      const isAlreadyExpanded =
        prev.length === nodePath.length && prev.every((id, index) => id === nodePath[index]);
      return isAlreadyExpanded ? nodePath.slice(0, -1) : nodePath;
    });
  }, []);

  /** Collapses everything back to the overview. */
  const resetCanvas = useCallback(() => {
    setInquiryFormOpen(false);
    setExpandedPath([]);
  }, []);

  const openInquiryForm = useCallback(() => {
    resetInquiry();
    setExpandedPath(["contact"]);
    setInquiryFormOpen(true);
  }, [resetInquiry]);

  const positions = getCardPositions(expandedPath, ROOT_CENTERS);
  const activeRootId = expandedPath[0];
  const isUnrelatedRoot = (nodeId: string) =>
    Boolean(activeRootId && nodeId !== "intro" && !expandedPath.includes(nodeId));
  const activeCardId = expandedPath.at(-1);
  const isDimmedCard = (nodeId: string) =>
    expandedPath.length > 1 &&
    !expandedPath.includes(nodeId) &&
    !(activeCardId && getChildrenIds(activeCardId).includes(nodeId));

  const contentStyle = {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    position: "relative" as const,
    // We remove the background here because the outer div handles the global background color
    // and the "ripple" effect handles the transition.
  };

  const introButtonClass = `inline-flex items-center gap-2 border px-4 py-2 text-sm font-semibold transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)] ${
    introHovered
      ? "border-white text-white hover:bg-white hover:text-black"
      : "border-[var(--theme-pencil-light)] text-[var(--theme-base)] hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent-ink)]"
  }`;

  return (
    <main ref={containerRef} className="relative h-screen w-full overflow-hidden bg-[var(--theme-background)]">
      <TransformWrapper
        initialScale={initialView.scale}
        initialPositionX={initialView.x}
        initialPositionY={initialView.y}
        minScale={MIN_SCALE}
        maxScale={MAX_SCALE}
        limitToBounds={false}
        panning={{ velocityDisabled: true }}
        doubleClick={{ disabled: true }}
      >
        <PanToExpandedNode
          expandedPath={expandedPath}
          positions={positions}
          containerRef={containerRef}
          prevPathKeyRef={prevPathKeyRef}
          inquiryFormOpen={inquiryFormOpen}
        />
        <CanvasControls containerRef={containerRef} onReset={resetCanvas} onExit={onExit} />
        <TransformComponent wrapperStyle={{ width: "100%", height: "100%", cursor: "grab" }} contentStyle={contentStyle}>
          <div className="relative canvas-grab" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
            {/* Grid texture — fainter overall, more visible near nodes, fades to background away */}
            <CanvasTexture darkMode={darkMode} positions={positions} />
            {/* Edges: parent → children for each node in expanded path */}
            <svg
              className="absolute inset-0"
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              aria-hidden
            >
              <defs>
                <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.06" />
                </filter>
                <filter id="cardShadowHover" x="-25%" y="-25%" width="150%" height="150%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.1" />
                </filter>
                <filter id="cardFilterDark" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="28" result="glowBlur" />
                  <feFlood floodColor="#8faa9b" floodOpacity="0.07" result="glowColor" />
                  <feComposite in="glowColor" in2="glowBlur" operator="in" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="cardFilterDarkHover" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="32" result="glowBlur" />
                  <feFlood floodColor="#8faa9b" floodOpacity="0.09" result="glowColor" />
                  <feComposite in="glowColor" in2="glowBlur" operator="in" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <g style={{ pointerEvents: "none" }} aria-hidden>
                {(() => {
                  const introPos = positions.get("intro");
                  const aboutPos = positions.get("about");
                  if (!introPos || !aboutPos) return null;
                  return (
                    <SketchEdge
                      key="edge-intro-about"
                      x1={introPos.x}
                      y1={introPos.y}
                      x2={aboutPos.x}
                      y2={aboutPos.y}
                      animate
                      isDimmed={isUnrelatedRoot("about")}
                    />
                  );
                })()}
              </g>
              <g style={{ pointerEvents: "none" }} aria-hidden>
                {expandedPath.map((parentId) => {
                  const parentPos = positions.get(parentId);
                  if (!parentPos) return null;
                  const childIds = getChildrenIds(parentId);
                  return childIds.map((childId) => {
                    const childPos = positions.get(childId);
                    if (!childPos) return null;
                    return (
                      <SketchEdge
                        key={`edge-${parentId}-${childId}`}
                        x1={parentPos.x}
                        y1={parentPos.y}
                        x2={childPos.x}
                        y2={childPos.y}
                        animate
                        isDimmed={isDimmedCard(childId)}
                      />
                    );
                  });
                })}
              </g>

              {/* Child cards: all children of nodes in expandedPath */}
              {expandedPath.flatMap((parentId) => {
                const childIds = getChildrenIds(parentId);
                return childIds.map((childId, i) => {
                  const node = getNode(childId);
                  const pos = positions.get(childId);
                  if (!node || !pos) return null;
                  const isInquiryCard = parentId === "contact" && childId === "inquiry";
                  if (isInquiryCard && inquiryFormOpen) return null;
                  const cardX = pos.x - CARD_W / 2;
                  const cardY = pos.y - CARD_H / 2;
                  const hasChildren = (getChildrenIds(childId).length ?? 0) > 0;
                  const isInquiryTrigger = isInquiryCard && !inquiryFormOpen;
                  const experience = experiences.find((item) => item.id === childId);
                  const isExperienceCard = Boolean(experience);
                  const isBioCard = childId === "bio";
                  const isDimmed = isDimmedCard(childId);
                  return (
                    <motion.g
                      key={childId}
                      initial={{ opacity: 0, scale: 0.82 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.55,
                        ease: [0.25, 0.1, 0.25, 1],
                        delay: i * 0.06,
                      }}
                      style={{
                        cursor: hasChildren || isInquiryTrigger || node.project || isExperienceCard || isBioCard ? "pointer" : "default",
                        pointerEvents: "auto",
                      }}
                      onMouseEnter={() => setHoveredCardId(childId)}
                      onMouseLeave={() => setHoveredCardId(null)}
                      onPointerDown={(e) => {
                        if (hasChildren || isInquiryTrigger || isExperienceCard || isBioCard) e.stopPropagation();
                      }}
                      onClick={(e) => {
                        if (isInquiryTrigger) {
                          e.stopPropagation();
                          openInquiryForm();
                          return;
                        }
                        if (node.project) {
                          e.stopPropagation();
                          onSelectProject(node.project);
                          return;
                        }
                        if (experience) {
                          e.stopPropagation();
                          onSelectExperience(experience);
                          return;
                        }
                        if (isBioCard) {
                          e.stopPropagation();
                          onOpenBio();
                          return;
                        }
                        if (hasChildren) {
                          e.stopPropagation();
                          expandToCard(childId);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (isInquiryTrigger && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          openInquiryForm();
                          return;
                        }
                        if (node.project && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          onSelectProject(node.project);
                          return;
                        }
                        if (experience && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          onSelectExperience(experience);
                          return;
                        }
                        if (isBioCard && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          onOpenBio();
                          return;
                        }
                        if (hasChildren && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          expandToCard(childId);
                        }
                      }}
                      role={hasChildren || isInquiryTrigger || node.project || isExperienceCard || isBioCard ? "button" : undefined}
                      tabIndex={hasChildren || isInquiryTrigger || node.project || isExperienceCard || isBioCard ? 0 : undefined}
                      aria-label={
                        isInquiryTrigger
                          ? "Open contact form"
                          : node.project
                            ? `View ${node.label}`
                            : isExperienceCard
                              ? `View ${node.label}`
                              : isBioCard
                                ? "View biography"
                            : hasChildren
                              ? `Expand ${node.label}`
                              : node.label
                      }
                    >
                      <SketchCard
                        x={cardX}
                        y={cardY}
                        width={CARD_W}
                        height={CARD_H}
                        pointerEventsNone={false}
                        isHovered={hoveredCardId === childId}
                        isExpanded={expandedPath.includes(childId)}
                        isDimmed={isDimmed}
                        darkMode={darkMode}
                        data={{
                          ...node,
                          description: node.project?.description ?? node.description,
                          tags: node.project?.tags ?? node.tags,
                        }}
                      />
                    </motion.g>
                  );
                });
              })}
              {/* Exploded contact form: name, email, message, submit (sketch nodes) */}
              {expandedPath[0] === "contact" && inquiryFormOpen && (() => {
                const inquiryPos = positions.get("inquiry");
                if (!inquiryPos) return null;
                const cx = inquiryPos.x;
                const cy = inquiryPos.y;
                const fw = 260;
                const fh = 44;
                const dw = 260;
                const dh = 80;
                const bw = 120;
                const bh = 40;
                const gap = 12;
                const totalH = fh + gap + fh + gap + dh + gap + bh;
                const nameY = cy - totalH / 2;
                const emailY = nameY + fh + gap;
                const descY = emailY + fh + gap;
                const btnY = descY + dh + gap;
                const left = cx - fw / 2;
                const btnLeft = cx - bw / 2;
                const submitting = inquiry.status === "submitting";
                const statusMessage =
                  inquiry.status === "error"
                    ? inquiry.error
                    : inquiry.status === "success"
                      ? "Thanks — your message is on its way. I'll get back to you soon."
                      : null;
                return (
                  <g style={{ pointerEvents: "auto" }}>
                    <SketchFieldNode
                      x={left}
                      y={nameY}
                      width={fw}
                      height={fh}
                      label="Name"
                      autoComplete="name"
                      maxLength={INQUIRY_LIMITS.name}
                      value={inquiry.values.name}
                      onChange={(value) => inquiry.setField("name", value)}
                      index={0}
                      darkMode={darkMode}
                    />
                    <SketchFieldNode
                      x={left}
                      y={emailY}
                      width={fw}
                      height={fh}
                      label="Email"
                      type="email"
                      autoComplete="email"
                      maxLength={INQUIRY_LIMITS.email}
                      value={inquiry.values.email}
                      onChange={(value) => inquiry.setField("email", value)}
                      index={1}
                      darkMode={darkMode}
                    />
                    <SketchFieldNode
                      x={left}
                      y={descY}
                      width={dw}
                      height={dh}
                      label="Message"
                      maxLength={INQUIRY_LIMITS.message}
                      value={inquiry.values.message}
                      onChange={(value) => inquiry.setField("message", value)}
                      multiline
                      placeholder="What are you working on?"
                      index={2}
                      darkMode={darkMode}
                    />
                    <SketchButtonNode
                      x={btnLeft}
                      y={btnY}
                      width={bw}
                      height={bh}
                      label={inquiry.status === "success" ? "Sent ✓" : submitting ? "Sending…" : "Send"}
                      onClick={inquiry.submit}
                      disabled={submitting}
                      index={3}
                    />
                    <foreignObject x={left} y={btnY + bh + 8} width={fw} height={56}>
                      <p
                        aria-live="polite"
                        className="text-center text-xs leading-snug"
                        style={{
                          fontFamily: "var(--font-sans), system-ui, sans-serif",
                          color: inquiry.status === "error" ? "var(--theme-error)" : "var(--theme-accent)",
                        }}
                      >
                        {statusMessage && (
                          // Background keeps the text readable where the connector line passes behind it.
                          <span className="bg-[var(--theme-background)] px-1">{statusMessage}</span>
                        )}
                      </p>
                    </foreignObject>
                  </g>
                );
              })()}
            </svg>

            {/* Intro — hero card; clicking its background resets the canvas */}
            <div
              role="button"
              tabIndex={0}
              className="absolute"
              style={{ left: INTRO_LEFT, top: INTRO_TOP }}
              onClick={resetCanvas}
              onKeyDown={(event) => {
                if (isOwnKey(event)) {
                  event.preventDefault();
                  resetCanvas();
                }
              }}
              onMouseEnter={() => setIntroHovered(true)}
              onMouseLeave={() => setIntroHovered(false)}
              aria-label="Return to the center and collapse all cards"
            >
              <SectionNode
                id="intro"
                width={INTRO_W}
                height={INTRO_H}
                accentFill
                background={
                  <AnimatePresence>
                    {introHovered && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="h-full w-full bg-black/50"
                      >
                        <img
                          src="/portrait.jpg"
                          alt=""
                          className="h-full w-full object-cover opacity-60 grayscale"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                }
              >
                <div className="flex h-full flex-col justify-center">
                  <div className="flex items-center gap-3">
                    <img src="/logo.svg" alt="" className="h-9 w-9 shrink-0" />
                    <h1
                      className={`text-4xl font-bold tracking-tight transition-colors duration-500 ${
                        introHovered ? "text-white drop-shadow-md" : "text-[var(--theme-base)]"
                      }`}
                    >
                      Joshua T. Alemayehu
                    </h1>
                  </div>
                  <p
                    className={`mt-3 text-base leading-snug transition-colors duration-500 ${
                      introHovered ? "text-white/90 drop-shadow-md" : "text-[var(--theme-base)]"
                    }`}
                  >
                    {hero.headline}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInquiryFormOpen(false);
                        setExpandedPath(["projects"]);
                      }}
                      className={introButtonClass}
                    >
                      View projects
                    </button>
                    {resumeUrl && (
                      <a href={resumeUrl} download onClick={(e) => e.stopPropagation()} className={introButtonClass}>
                        Download CV
                      </a>
                    )}
                    <a href={`mailto:${contact.email}`} onClick={(e) => e.stopPropagation()} className={introButtonClass}>
                      Email me
                    </a>
                  </div>
                </div>
              </SectionNode>
            </div>

            {/* Projects — click to expand (card) */}
            <div
              className="absolute"
              style={{ left: PROJECTS_LEFT, top: PROJECTS_TOP }}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleRoot("projects")}
                onKeyDown={(e) => {
                  if (isOwnKey(e)) {
                    e.preventDefault();
                    toggleRoot("projects");
                  }
                }}
                aria-expanded={expandedPath[0] === "projects"}
                aria-label="Expand projects"
                className="cursor-pointer"
              >
                <SectionNode
                  id="projects"
                  title="Projects"
                  width={PROJECTS_W}
                  height={PROJECTS_H}
                  accentFill
                  isExpanded={activeRootId === "projects"}
                  isDimmed={isUnrelatedRoot("projects")}
                >
                  {expandedPath[0] !== "projects" && (
                    <p className="text-sm text-[var(--theme-base-muted)]">
                      {featuredProjects.length} featured case studies plus {projects.length - featuredProjects.length} more
                      — payments, healthcare and marketplaces. Click to see them, then pick one for the full story.
                    </p>
                  )}
                  {expandedPath[0] === "projects" && expandedPath.length === 1 && (
                    <p className="text-sm text-[var(--theme-base-muted)]">
                      Click a project for the full case study. Click this card again to collapse.
                    </p>
                  )}
                </SectionNode>
              </div>
            </div>

            {/* About — click to expand */}
            <div
              className="absolute"
              style={{ left: ABOUT_LEFT, top: ABOUT_TOP }}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleRoot("about")}
                onKeyDown={(e) => {
                  if (isOwnKey(e)) {
                    e.preventDefault();
                    toggleRoot("about");
                  }
                }}
                aria-expanded={expandedPath[0] === "about"}
                aria-label="Expand about"
                className="cursor-pointer"
              >
                <SectionNode
                  id="about"
                  title="About"
                  width={ABOUT_W}
                  height={ABOUT_H}
                  accentFill
                  isExpanded={activeRootId === "about"}
                  isDimmed={isUnrelatedRoot("about")}
                >
                  {expandedPath[0] !== "about" && (
                    <p className="text-sm leading-relaxed text-[var(--theme-base-muted)]">{aboutText}</p>
                  )}
                  {expandedPath[0] === "about" && expandedPath.length === 1 && (
                    <p className="text-sm text-[var(--theme-base-muted)]">Click a card to explore.</p>
                  )}
                </SectionNode>
              </div>
            </div>

            {/* Contact — click to expand */}
            <div
              className="absolute"
              style={{ left: CONTACT_LEFT, top: CONTACT_TOP }}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleRoot("contact")}
                onKeyDown={(e) => {
                  if (isOwnKey(e)) {
                    e.preventDefault();
                    toggleRoot("contact");
                  }
                }}
                aria-expanded={expandedPath[0] === "contact"}
                aria-label="Expand contact"
                className="cursor-pointer"
              >
                <SectionNode
                  id="contact"
                  title="Contact"
                  width={CONTACT_W}
                  height={CONTACT_H}
                  accentFill
                  isExpanded={activeRootId === "contact"}
                  isDimmed={isUnrelatedRoot("contact")}
                >
                  {expandedPath[0] !== "contact" && (
                    <div className="flex flex-col gap-3">
                      <a
                        href={`mailto:${contact.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2.5 text-sm font-medium text-[var(--theme-base)] transition-colors duration-200 hover:text-[var(--theme-accent-ink)]"
                      >
                        <EmailIcon className="h-4 w-4 shrink-0 text-[var(--theme-accent-ink)]" />
                        <span className="underline decoration-[var(--theme-pencil-light)] underline-offset-2">
                          {contact.email}
                        </span>
                      </a>
                      <a
                        href={`tel:${contact.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2.5 text-sm font-medium text-[var(--theme-base)] transition-colors duration-200 hover:text-[var(--theme-accent-ink)]"
                      >
                        <PhoneIcon className="h-4 w-4 shrink-0 text-[var(--theme-accent-ink)]" />
                        <span className="underline decoration-[var(--theme-pencil-light)] underline-offset-2">
                          {contact.phone}
                        </span>
                      </a>
                      <ul className="mt-1 flex flex-wrap gap-2.5" aria-label="Social links">
                        {contact.links.map(({ label, href }) => (
                          <li key={label}>
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              aria-label={label}
                              className="flex h-8 w-8 items-center justify-center rounded-none border border-[var(--theme-pencil-light)] text-[var(--theme-base-muted)] transition-colors duration-200 hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent-ink)]"
                            >
                              {isSocialIcon(label) ? <SocialIcon label={label} className="h-4 w-4" /> : label}
                            </a>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openInquiryForm();
                          }}
                          className="inline-flex w-fit items-center gap-2 rounded-none border border-[var(--theme-accent)] px-3.5 py-1.5 text-xs font-semibold text-[var(--theme-accent-ink)] transition-colors duration-200 hover:bg-[var(--theme-accent)] hover:text-white"
                        >
                          <SendIcon className="h-3.5 w-3.5 shrink-0" />
                          Send a message
                        </button>
                        {resumeUrl && (
                          <a
                            href={resumeUrl}
                            download
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex w-fit items-center rounded-none border border-[var(--theme-pencil-light)] px-3.5 py-1.5 text-xs font-semibold text-[var(--theme-base)] transition-colors duration-200 hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent-ink)]"
                          >
                            Download CV
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  {expandedPath[0] === "contact" && expandedPath.length === 1 && (
                    <p className="text-sm text-[var(--theme-base-muted)]">Click a card to explore.</p>
                  )}
                </SectionNode>
              </div>
            </div>

            <CanvasSketchLines darkMode={darkMode} />
          </div>
        </TransformComponent>
      </TransformWrapper>
    </main>
  );
}

/**
 * Pans the viewport to the active (expanded) node whenever the user taps a section or expands a card.
 * With nothing expanded it frames all root cards, and keeps them framed when the window resizes.
 */
function PanToExpandedNode({
  expandedPath,
  positions,
  containerRef,
  prevPathKeyRef,
  inquiryFormOpen,
}: {
  expandedPath: string[];
  positions: Map<string, { x: number; y: number }>;
  containerRef: React.RefObject<HTMLElement | null>;
  prevPathKeyRef: React.MutableRefObject<string>;
  inquiryFormOpen: boolean;
}) {
  const ctx = useTransformContext();
  // Derive a stable key so inquiry open/close re-pans without changing dep array shape mid-session.
  const pathKey = `${expandedPath.join(",")}|inquiry:${inquiryFormOpen ? "1" : "0"}`;
  const isCollapsed = expandedPath.length === 0;

  useEffect(() => {
    if (pathKey === prevPathKeyRef.current) return;
    prevPathKeyRef.current = pathKey;

    const container = containerRef.current;
    const ref = ctx?.getContext?.();
    if (!container || !ref?.setTransform) return;

    const pathIds = pathKey.split("|")[0];
    if (!pathIds) {
      const fit = fitRootsToViewport(container.clientWidth, container.clientHeight);
      ref.setTransform(fit.x, fit.y, fit.scale, panDuration(), "easeOutCubic");
      return;
    }

    const formOpen = pathKey.endsWith("|inquiry:1");
    const activeId = pathIds.split(",").at(-1) || "intro";
    let targetPos = positions.get(activeId);

    // Contact + Send a message: frame both so the message card isn't clipped at the top.
    if (pathIds === "contact" && !formOpen) {
      const contactPos = positions.get("contact");
      const inquiryPos = positions.get("inquiry");
      if (contactPos && inquiryPos) {
        targetPos = {
          x: (contactPos.x + inquiryPos.x) / 2,
          y: (contactPos.y + inquiryPos.y) / 2,
        };
      }
    }

    // Contact form open: center on the name / email / message stack.
    if (pathIds.startsWith("contact") && formOpen) {
      const inquiryPos = positions.get("inquiry");
      if (inquiryPos) targetPos = inquiryPos;
    }

    if (!targetPos) return;
    const scale = ctx.transformState?.scale ?? DEFAULT_SCALE;
    const w = container.clientWidth;
    const h = container.clientHeight;
    const newX = w / 2 - targetPos.x * scale;
    const newY = h / 2 - targetPos.y * scale;
    ref.setTransform(newX, newY, scale, panDuration(), "easeOutCubic");
  }, [pathKey, positions, containerRef, prevPathKeyRef]);

  useEffect(() => {
    if (!isCollapsed) return;
    const onResize = () => {
      const container = containerRef.current;
      const ref = ctx?.getContext?.();
      if (!container || !ref?.setTransform) return;
      const fit = fitRootsToViewport(container.clientWidth, container.clientHeight);
      ref.setTransform(fit.x, fit.y, fit.scale, 0);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isCollapsed, containerRef, ctx]);

  return null;
}

/** Grid only. Very faint; a bit more visible near nodes, gradually fades to background away. */
function CanvasTexture({
  darkMode,
  positions,
}: {
  darkMode: boolean;
  positions: Map<string, { x: number; y: number }>;
}) {
  const uid = useId().replace(/:/g, "");
  const stroke = darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.04)";
  const size = 80;
  const step = 12;
  const fadeRadius = 340;
  const positionArray = Array.from(positions.values());

  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      aria-hidden
    >
      <defs>
        <pattern id={`canvasGrid-${uid}`} patternUnits="userSpaceOnUse" width={size} height={size}>
          {Array.from({ length: Math.floor(size / step) + 1 }, (_, i) => (
            <line key={`v-${i}`} x1={i * step} y1={0} x2={i * step} y2={size} stroke={stroke} strokeWidth={0.65} />
          ))}
          {Array.from({ length: Math.floor(size / step) + 1 }, (_, i) => (
            <line key={`h-${i}`} x1={0} y1={i * step} x2={size} y2={i * step} stroke={stroke} strokeWidth={0.65} />
          ))}
        </pattern>
        {/* Mask: grid visible near nodes, fades to background (transparent) away */}
        <mask id={`gridFadeMask-${uid}`}>
          <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="black" />
          <g style={{ mixBlendMode: "lighten" }}>
            {positionArray.map((pos, i) => (
              <radialGradient
                key={i}
                id={`gridFadeGrad-${uid}-${i}`}
                cx="50%"
                cy="50%"
                r="50%"
                fx="50%"
                fy="50%"
              >
                <stop offset="0%" stopColor="white" stopOpacity="1" />
                <stop offset="55%" stopColor="white" stopOpacity="0.85" />
                <stop offset="85%" stopColor="white" stopOpacity="0.2" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
            ))}
            {positionArray.map((pos, i) => (
              <circle
                key={i}
                cx={pos.x}
                cy={pos.y}
                r={fadeRadius}
                fill={`url(#gridFadeGrad-${uid}-${i})`}
              />
            ))}
          </g>
        </mask>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill={`url(#canvasGrid-${uid})`}
        mask={`url(#gridFadeMask-${uid})`}
      />
    </svg>
  );
}

function CanvasSketchLines({ darkMode }: { darkMode: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const strokeColor = darkMode ? theme.dark.pencilLight : theme.colors.pencilLight;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.innerHTML = "";
    const rc = rough.svg(svg);
    const opts = { stroke: strokeColor, strokeWidth: 0.5, roughness: 1.5, bowing: 0.3 };
    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2;
    const left = cx - INTRO_W / 2 - 90;
    const right = cx + INTRO_W / 2 + 90;
    const n1 = rc.line(cx - INTRO_W / 2 - 20, cy - 40, left, cy - 20, opts);
    const n2 = rc.line(cx + INTRO_W / 2 + 20, cy - 40, right, cy - 20, opts);
    if (n1) svg.appendChild(n1);
    if (n2) svg.appendChild(n2);
  }, [strokeColor, darkMode]);

  return (
    <svg ref={svgRef} className="pointer-events-none absolute inset-0" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} aria-hidden />
  );
}
