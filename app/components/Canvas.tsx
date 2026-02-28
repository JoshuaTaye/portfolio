"use client";

import { useRef, useEffect, useState, useCallback, useId } from "react";
import dynamic from "next/dynamic";
import { useTransformContext } from "react-zoom-pan-pinch";
import rough from "roughjs";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { SectionNode } from "./SectionNode";
import { SketchEdge } from "./SketchEdge";
import { SketchCard } from "./SketchCard";
import { SketchFieldNode } from "./SketchFieldNode";
import { SketchButtonNode } from "./SketchButtonNode";
import { ThemeToggle } from "./ThemeToggle";
import { SocialIcon, isSocialIcon } from "./SocialIcons";
import { ProjectModal } from "./ProjectModal";
import {
  projects,
  aboutText,
  contact,
  skillCategories,
  experiences,
  metricsOverview,
  resumeUrl,
  type Project,
} from "@/app/lib/seed-data";
import { getChildrenIds, getNode, getPathToNode } from "@/app/lib/graph-data";
import { getCardPositions, LAYOUT } from "@/app/lib/canvas-layout";
import { theme } from "@/app/lib/theme";

type TransformWrapperProps = {
  children: React.ReactNode;
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  centerOnInit?: boolean;
  limitToBounds?: boolean;
  panning?: { velocityDisabled?: boolean };
  doubleClick?: { mode?: "reset" | "zoomIn" | "zoomOut" | "toggle"; disabled?: boolean };
};

type TransformComponentProps = {
  children: React.ReactNode;
  wrapperStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
};

const TransformWrapper = dynamic<TransformWrapperProps>(
  () => import("react-zoom-pan-pinch").then((m) => m.TransformWrapper),
  { ssr: false }
) as React.ComponentType<TransformWrapperProps>;

const TransformComponent = dynamic<TransformComponentProps>(
  () => import("react-zoom-pan-pinch").then((m) => m.TransformComponent),
  { ssr: false }
) as React.ComponentType<TransformComponentProps>;

/** Very large canvas so panning feels infinite and outermost cards are never cut. */
const CANVAS_SIZE = 12000;
const CANVAS_WIDTH = CANVAS_SIZE;
const CANVAS_HEIGHT = CANVAS_SIZE;

const CX = CANVAS_WIDTH / 2;
const CY = CANVAS_HEIGHT / 2;

const INTRO_W = 580;
const INTRO_H = 320;
const PROJECTS_W = 460;
const PROJECTS_H = 240;
const ABOUT_W = 440;
const ABOUT_H = 200;
const CONTACT_W = 360;
const CONTACT_H = 180;
const SKILLS_W = 420;
const SKILLS_H = 200;
const METRICS_W = 420;
const METRICS_H = 240;

const ROOT_CENTERS: Record<string, { x: number; y: number }> = {
  intro: { x: CX, y: CY - 80 + INTRO_H / 2 },
  projects: { x: CX + INTRO_W / 2 + 80 + PROJECTS_W / 2, y: CY - 40 },
  about: { x: CX, y: CY + INTRO_H + 60 + ABOUT_H / 2 },
  contact: { x: CX - INTRO_W / 2 - 80 - CONTACT_W / 2, y: CY - 20 + CONTACT_H / 2 },
  skills: { x: CX + INTRO_W / 2 + 80 + SKILLS_W / 2, y: CY + INTRO_H + 60 + SKILLS_H / 2 },
  metrics: { x: CX - INTRO_W / 2 - 80 - METRICS_W / 2, y: CY + INTRO_H + 60 + METRICS_H / 2 },
};

/** Top-left positions for root section divs (for absolute positioning). */
const INTRO_TOP = CY - 80;
const PROJECTS_LEFT = CX + INTRO_W / 2 + 80;
const PROJECTS_TOP = CY - 40 - PROJECTS_H / 2;
const ABOUT_LEFT = CX - ABOUT_W / 2;
const ABOUT_TOP = CY + INTRO_H + 60;
const CONTACT_LEFT = CX - INTRO_W / 2 - CONTACT_W - 80;
const CONTACT_TOP = CY - 20 - CONTACT_H / 2;
const SKILLS_LEFT = CX + INTRO_W / 2 + 80;
const SKILLS_TOP = CY + INTRO_H + 60;
const METRICS_LEFT = CX - INTRO_W / 2 - 80 - METRICS_W;
const METRICS_TOP = CY + INTRO_H + 60;

const { CARD_W, CARD_H } = LAYOUT;

export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevPathKeyRef = useRef("");
  const [isDesktop, setIsDesktop] = useState(true);
  const [expandedPath, setExpandedPath] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [introHovered, setIntroHovered] = useState(false);
  const [inquiryFormOpen, setInquiryFormOpen] = useState(false);
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryDescription, setInquiryDescription] = useState("");
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = () => setIsDesktop(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      setDarkMode(true);
    } else if (stored === "light") {
      setDarkMode(false);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDarkMode(true);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      root.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode, mounted]);

  const toggleRoot = useCallback((rootId: string) => {
    setExpandedPath((prev) => (prev[0] === rootId ? [] : [rootId]));
  }, []);

  const expandToCard = useCallback((nodeId: string) => {
    setExpandedPath(getPathToNode(nodeId));
  }, []);

  /** When clicking a card that has children: if it's already the current leaf, collapse one level; otherwise expand to it. */
  const toggleCardExpand = useCallback(
    (childId: string) => {
      const hasChildren = (getChildrenIds(childId).length ?? 0) > 0;
      if (!hasChildren) return;
      setExpandedPath((prev) => {
        const isCurrentlyLeaf = prev[prev.length - 1] === childId;
        if (isCurrentlyLeaf && prev.length > 1) {
          return prev.slice(0, -1);
        }
        return getPathToNode(childId);
      });
    },
    []
  );

  useEffect(() => {
    if (expandedPath[0] !== "contact") {
      setInquiryFormOpen(false);
      setInquirySuccess(false);
    }
  }, [expandedPath]);

  const positions = getCardPositions(expandedPath, ROOT_CENTERS);


  if (!isDesktop) {
    return (
      <CanvasScrollFallback
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        selectedProject={selectedProject}
        onCloseProject={() => setSelectedProject(null)}
        onSelectProject={setSelectedProject}
      />
    );
  }


  const contentStyle = {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    position: "relative" as const,
    // We remove the background here because the outer div handles the global background color
    // and the "ripple" effect handles the transition.
  };

  const toggleTheme = async () => {
    if (
      !document.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDarkMode(!darkMode);
      return;
    }

    // Coordinates of the theme toggle button (top-right)
    // Approx center: right-4 (1rem=16px) + half button (20px) = 36px from right logic
    const x = window.innerWidth - 36;
    const y = 36;
    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const transition = document.startViewTransition(() => {
      setDarkMode(!darkMode);
    });

    await transition.ready;

    // Animate the clip-path of the NEW view
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 800,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  };

  return (
    <div ref={containerRef} className="relative z-10 h-screen w-full overflow-hidden bg-transparent">
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      <ThemeToggle darkMode={darkMode} toggle={toggleTheme} />

      <TransformWrapper
        initialScale={0.85}
        minScale={0.4}
        maxScale={1.8}
        centerOnInit
        limitToBounds={false}
        panning={{ velocityDisabled: true }}
        doubleClick={{ disabled: true }}
      >
        <PanToExpandedNode
          expandedPath={expandedPath}
          positions={positions}
          containerRef={containerRef}
          prevPathKeyRef={prevPathKeyRef}
        />
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
                  const skillsPos = positions.get("skills");
                  return (
                    <>
                      {introPos && aboutPos && (
                        <SketchEdge
                          key="edge-intro-about"
                          x1={introPos.x}
                          y1={introPos.y}
                          x2={aboutPos.x}
                          y2={aboutPos.y}
                          animate
                        />
                      )}
                      {introPos && skillsPos && (
                        <SketchEdge
                          key="edge-intro-skills"
                          x1={introPos.x}
                          y1={introPos.y}
                          x2={skillsPos.x}
                          y2={skillsPos.y}
                          animate
                        />
                      )}
                      {(() => {
                        const metricsPos = positions.get("metrics");
                        return introPos && metricsPos ? (
                          <SketchEdge
                            key="edge-intro-metrics"
                            x1={introPos.x}
                            y1={introPos.y}
                            x2={metricsPos.x}
                            y2={metricsPos.y}
                            animate
                          />
                        ) : null;
                      })()}
                    </>
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
                        cursor: hasChildren || isInquiryTrigger || node.project ? "pointer" : "default",
                        pointerEvents: "auto",
                      }}
                      onMouseEnter={() => setHoveredCardId(childId)}
                      onMouseLeave={() => setHoveredCardId(null)}
                      onPointerDown={(e) => {
                        if (hasChildren || isInquiryTrigger) e.stopPropagation();
                      }}
                      onClick={(e) => {
                        if (isInquiryTrigger) {
                          e.stopPropagation();
                          setInquiryFormOpen(true);
                          return;
                        }
                        if (node.project) {
                          e.stopPropagation();
                          setSelectedProject(node.project);
                          return;
                        }
                        if (hasChildren) {
                          e.stopPropagation();
                          toggleCardExpand(childId);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (isInquiryTrigger && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          setInquiryFormOpen(true);
                          return;
                        }
                        if (node.project && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          setSelectedProject(node.project);
                          return;
                        }
                        if (hasChildren && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          toggleCardExpand(childId);
                        }
                      }}
                      role={hasChildren || isInquiryTrigger || node.project ? "button" : undefined}
                      tabIndex={hasChildren || isInquiryTrigger || node.project ? 0 : undefined}
                      aria-label={
                        isInquiryTrigger
                          ? "Open feedback form"
                          : node.project
                            ? `View ${node.label}`
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
              {/* Exploded inquiry form: name, email, description, submit (sketch nodes) */}
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
                const nameY = cy - 140;
                const emailY = cy - 140 + fh + gap;
                const descY = cy - 140 + (fh + gap) * 2;
                const btnY = cy - 140 + (fh + gap) * 2 + dh + gap;
                const left = cx - fw / 2;
                const btnLeft = cx - bw / 2;
                const submitInquiry = async () => {
                  if (!inquiryName.trim() || !inquiryEmail.trim() || !inquiryDescription.trim()) return;
                  setInquirySubmitting(true);
                  try {
                    const res = await fetch("/api/inquiry", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name: inquiryName.trim(),
                        email: inquiryEmail.trim(),
                        description: inquiryDescription.trim(),
                      }),
                    });
                    const data = await res.json().catch(() => ({}));
                    if (res.ok) {
                      setInquirySuccess(true);
                      setInquiryName("");
                      setInquiryEmail("");
                      setInquiryDescription("");
                      setTimeout(() => {
                        setInquiryFormOpen(false);
                        setInquirySuccess(false);
                      }, 1800);
                    } else {
                      alert(data.error ?? "Something went wrong.");
                    }
                  } catch {
                    alert("Failed to send. Please try again.");
                  } finally {
                    setInquirySubmitting(false);
                  }
                };
                return (
                  <g style={{ pointerEvents: "auto" }}>
                    <SketchFieldNode
                      x={left}
                      y={nameY}
                      width={fw}
                      height={fh}
                      label="Name"
                      value={inquiryName}
                      onChange={setInquiryName}
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
                      value={inquiryEmail}
                      onChange={setInquiryEmail}
                      index={1}
                      darkMode={darkMode}
                    />
                    <SketchFieldNode
                      x={left}
                      y={descY}
                      width={dw}
                      height={dh}
                      label="Message"
                      value={inquiryDescription}
                      onChange={setInquiryDescription}
                      multiline
                      placeholder="Your feedback or comment…"
                      index={2}
                      darkMode={darkMode}
                    />
                    <SketchButtonNode
                      x={btnLeft}
                      y={btnY}
                      width={bw}
                      height={bh}
                      label={inquirySuccess ? "Sent ✓" : inquirySubmitting ? "Sending…" : "Submit"}
                      onClick={submitInquiry}
                      disabled={inquirySubmitting || inquirySuccess}
                      index={3}
                    />
                  </g>
                );
              })()}
            </svg>

            {/* Intro — center (no expand) */}
            <div
              className="absolute"
              style={{
                left: CX - INTRO_W / 2,
                top: CY - 80 - INTRO_H / 2,
              }}
              onMouseEnter={() => setIntroHovered(true)}
              onMouseLeave={() => setIntroHovered(false)}
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
                  <h1
                    className={`text-4xl font-bold tracking-tight transition-colors duration-500 ${
                      introHovered ? "text-white drop-shadow-md" : "text-[var(--theme-base)]"
                    }`}
                  >
                    Joshua T. Alemayehu
                  </h1>
                  <p
                    className={`mt-4 text-lg transition-colors duration-500 ${
                      introHovered ? "text-white/90 drop-shadow-md" : "text-[var(--theme-base-muted)]"
                    }`}
                  >
                    Full-stack developer — production systems, type-safe APIs, and performant interfaces.
                  </p>
                  <a
                    href={resumeUrl}
                    download
                    className={`mt-5 inline-flex w-fit items-center gap-2 border px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                      introHovered
                        ? "border-white/40 text-white hover:border-white hover:bg-white/10"
                        : "border-[var(--theme-pencil-light)] text-[var(--theme-base)] hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)]"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Resume
                  </a>
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
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleRoot("projects");
                  }
                }}
                aria-expanded={expandedPath[0] === "projects"}
                aria-label="Expand projects"
                className="cursor-pointer"
              >
                <SectionNode id="projects" title="Projects" width={PROJECTS_W} height={PROJECTS_H} accentFill>
                  {expandedPath[0] !== "projects" && (
                    <p className="text-sm text-[var(--theme-base-muted)]">
                      Click to expand and explore project nodes. Project Alpha expands into Tech, Demo, Repo — then each can expand further.
                    </p>
                  )}
                  {expandedPath[0] === "projects" && (
                    <p className="text-sm text-[var(--theme-base-muted)]">
                      Click a card to expand. Click again on section to collapse.
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
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleRoot("about");
                  }
                }}
                aria-expanded={expandedPath[0] === "about"}
                aria-label="Expand about"
                className="cursor-pointer"
              >
                <SectionNode id="about" title="About" width={ABOUT_W} height={ABOUT_H} accentFill>
                  {expandedPath[0] !== "about" && (
                    <p className="line-clamp-4 text-sm leading-relaxed text-[var(--theme-base-muted)]">{aboutText}</p>
                  )}
                  {expandedPath[0] === "about" && (
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
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleRoot("contact");
                  }
                }}
                aria-expanded={expandedPath[0] === "contact"}
                aria-label="Expand contact"
                className="cursor-pointer"
              >
                <SectionNode id="contact" title="Contact" width={CONTACT_W} height={CONTACT_H} accentFill>
                  {expandedPath[0] !== "contact" && (
                    <>
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-sm font-medium text-[var(--theme-base)] underline decoration-[var(--theme-pencil-light)] underline-offset-2 hover:decoration-[var(--theme-accent)]"
                      >
                        {contact.email}
                      </a>
                      <ul className="mt-3 flex flex-wrap items-center gap-3" aria-label="Links">
                        {contact.links.map(({ label, href }) => (
                          <li key={label}>
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-[var(--theme-base-muted)] hover:text-[var(--theme-base)] [&_svg]:text-[var(--theme-base-muted)] [&:hover_svg]:text-[var(--theme-base)]"
                              aria-label={label}
                            >
                              {isSocialIcon(label) ? <SocialIcon label={label} /> : label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {expandedPath[0] === "contact" && (
                    <p className="text-sm text-[var(--theme-base-muted)]">Click a card to explore.</p>
                  )}
                </SectionNode>
              </div>
            </div>

            {/* Skills — click to expand */}
            <div
              className="absolute"
              style={{ left: SKILLS_LEFT, top: SKILLS_TOP }}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleRoot("skills")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleRoot("skills");
                  }
                }}
                aria-expanded={expandedPath[0] === "skills"}
                aria-label="Expand skills"
                className="cursor-pointer"
              >
                <SectionNode id="skills" title="Skills" width={SKILLS_W} height={SKILLS_H} accentFill>
                  <p className="text-sm leading-relaxed text-[var(--theme-base-muted)]">
                    Frontend, backend, DevOps, and design — explore what I work with.
                  </p>
                </SectionNode>
              </div>

            </div>

            {/* Metrics — display only, no expand */}
            <div
              className="absolute"
              style={{ left: METRICS_LEFT, top: METRICS_TOP }}
            >
              <SectionNode id="metrics" title="Metrics & Results" width={METRICS_W} height={METRICS_H}>
                <div className="grid grid-cols-2 gap-3">
                  {metricsOverview.map((m) => (
                    <div key={m.label} className="flex flex-col">
                      <span className="text-xl font-bold text-[var(--theme-accent)]">
                        {m.value}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--theme-base-muted)]">
                        {m.label}
                      </span>
                      <span className="mt-0.5 text-[10px] leading-snug text-[var(--theme-pencil-light)]">
                        {m.description}
                      </span>
                    </div>
                  ))}
                </div>
              </SectionNode>
            </div>

            <CanvasSketchLines darkMode={darkMode} />
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}

/** Pans viewport to the active (expanded) node whenever the user taps a section or expands/collapses a card. */
function PanToExpandedNode({
  expandedPath,
  positions,
  containerRef,
  prevPathKeyRef,
}: {
  expandedPath: string[];
  positions: Map<string, { x: number; y: number }>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  prevPathKeyRef: React.MutableRefObject<string>;
}) {
  const ctx = useTransformContext();
  const prevPathRef = useRef<string[]>([]);

  useEffect(() => {
    const pathKey = expandedPath.join(",");
    if (pathKey === prevPathKeyRef.current) return;
    const prevPath = prevPathRef.current;
    const prevLength = prevPath.length;
    prevPathKeyRef.current = pathKey;
    prevPathRef.current = expandedPath;

    const isCollapse = expandedPath.length < prevLength;
    const isRootExpand = expandedPath.length === 1 && prevLength <= 1;

    if (!isCollapse && !isRootExpand) return;

    // When fully collapsed, pan to the root that was just closed
    const activeId =
      expandedPath.length > 0
        ? expandedPath[expandedPath.length - 1]
        : prevPath[0];
    if (!activeId) return;

    const targetPos = positions.get(activeId);
    const container = containerRef.current;
    const ref = ctx?.getContext?.();
    if (!targetPos || !container || !ref?.setTransform) return;
    const scale = ctx.transformState?.scale ?? 0.85;
    const w = container.clientWidth;
    const h = container.clientHeight;
    const newX = w / 2 - targetPos.x * scale;
    const newY = h / 2 - targetPos.y * scale;
    ref.setTransform(newX, newY, scale, 500, "easeOutCubic");
  }, [expandedPath, positions, containerRef, prevPathKeyRef]);
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

/** Scroll-reveal wrapper: fades + slides children in when they enter the viewport. */
function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Mobile nav dot — scrolls to a section and lights up when active. */
function NavDot({
  targetId,
  label,
  active,
}: {
  targetId: string;
  label: string;
  active: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" })}
      className="group flex flex-col items-center gap-1"
      aria-label={`Go to ${label}`}
    >
      <span
        className={`block h-2 w-2 rounded-full border transition-all duration-300 ${
          active
            ? "scale-125 border-[var(--theme-accent)] bg-[var(--theme-accent)]"
            : "border-[var(--theme-pencil-light)] bg-transparent group-hover:border-[var(--theme-accent)]"
        }`}
      />
      <span
        className={`text-[9px] font-medium uppercase tracking-widest transition-colors duration-300 ${
          active ? "text-[var(--theme-accent)]" : "text-[var(--theme-pencil-light)]"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

function CanvasScrollFallback({
  darkMode,
  setDarkMode,
  selectedProject,
  onCloseProject,
  onSelectProject,
}: {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  selectedProject: Project | null;
  onCloseProject: () => void;
  onSelectProject: (project: Project) => void;
}) {
  const [activeSection, setActiveSection] = useState("hero");
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const projectsRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const refs = [
      { id: "hero", ref: heroRef },
      { id: "m-projects", ref: projectsRef },
      { id: "m-about", ref: aboutRef },
      { id: "m-contact", ref: contactRef },
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { threshold: 0.4 }
    );
    for (const { ref } of refs) {
      if (ref.current) observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => setDarkMode((d: boolean) => !d);

  const submitInquiry = async () => {
    if (!inquiryName.trim() || !inquiryEmail.trim() || !inquiryMessage.trim()) return;
    setInquirySubmitting(true);
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inquiryName.trim(),
          email: inquiryEmail.trim(),
          description: inquiryMessage.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setInquirySuccess(true);
        setInquiryName("");
        setInquiryEmail("");
        setInquiryMessage("");
        setTimeout(() => setInquirySuccess(false), 2400);
      } else {
        alert(data.error ?? "Something went wrong.");
      }
    } catch {
      alert("Failed to send. Please try again.");
    } finally {
      setInquirySubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[var(--theme-background)]">
      <ProjectModal project={selectedProject} onClose={onCloseProject} />

      {/* Fixed side nav dots */}
      <nav
        className="fixed right-3 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-4"
        aria-label="Section navigation"
      >
        <NavDot targetId="hero" label="Top" active={activeSection === "hero"} />
        <NavDot targetId="m-projects" label="Work" active={activeSection === "m-projects"} />
        <NavDot targetId="m-about" label="About" active={activeSection === "m-about"} />
        <NavDot targetId="m-contact" label="Say hi" active={activeSection === "m-contact"} />
      </nav>

      {/* Theme toggle */}
      <ThemeToggle darkMode={darkMode} toggle={toggleTheme} />

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        id="hero"
        className="relative flex min-h-[100svh] flex-col items-center justify-center px-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col items-center text-center"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="mb-6 h-px w-16 origin-left bg-[var(--theme-pencil-light)]"
          />
          <h1 className="text-3xl font-bold tracking-tight text-[var(--theme-base)] sm:text-4xl">
            Joshua T. Alemayehu
          </h1>
          <p className="mt-3 max-w-xs text-base leading-relaxed text-[var(--theme-base-muted)]">
            Full-stack developer — production systems, type-safe APIs, and performant interfaces.
          </p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="mt-6 h-px w-16 origin-right bg-[var(--theme-pencil-light)]"
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-10 flex items-center gap-5"
          >
            {contact.links.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--theme-pencil-light)] transition-colors duration-200 hover:text-[var(--theme-accent)] [&_svg]:h-5 [&_svg]:w-5"
                aria-label={label}
              >
                {isSocialIcon(label) ? <SocialIcon label={label} /> : label}
              </a>
            ))}
          </motion.div>

          <motion.a
            href={resumeUrl}
            download
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="mt-6 inline-flex items-center gap-2 border border-[var(--theme-pencil-light)] px-5 py-2.5 text-sm font-medium text-[var(--theme-base)] transition-colors duration-200 hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Resume
          </motion.a>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--theme-pencil-light)]">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg
              className="h-4 w-4 text-[var(--theme-pencil-light)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Projects ── */}
      <section ref={projectsRef} id="m-projects" className="px-5 py-16 sm:px-8">
        <ScrollReveal>
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--theme-accent)]">
            Selected Work
          </h2>
          <div className="mt-1 h-px w-8 bg-[var(--theme-accent)] opacity-40" />
        </ScrollReveal>

        <div className="mt-8 flex flex-col gap-5">
          {projects.map((p, i) => (
            <ScrollReveal key={p.id} delay={i * 0.08}>
              <button
                type="button"
                onClick={() => onSelectProject(p)}
                className="group relative w-full overflow-hidden border border-[var(--theme-pencil-light)] bg-[var(--theme-card-bg)] p-5 text-left transition-colors duration-300 active:scale-[0.98]"
              >
                {/* Accent fill on press */}
                <div className="pointer-events-none absolute inset-0 bg-[var(--theme-accent)] opacity-0 transition-opacity duration-300 group-active:opacity-[0.06]" />

                {p.image && (
                  <div className="mb-4 h-40 w-full overflow-hidden border border-[var(--theme-pencil-light)]/30">
                    <img
                      src={p.image}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-active:scale-105"
                    />
                  </div>
                )}

                <h3 className="text-lg font-semibold text-[var(--theme-base)]">
                  {p.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--theme-base-muted)]">
                  {p.description}
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Technologies">
                  {p.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded border border-[var(--theme-pencil-light)] px-2 py-0.5 text-[11px] text-[var(--theme-base-muted)]"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>

                <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[var(--theme-accent)]">
                  View details
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── About ── */}
      <section ref={aboutRef} id="m-about" className="px-5 py-16 sm:px-8">
        <ScrollReveal>
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--theme-accent)]">
            About
          </h2>
          <div className="mt-1 h-px w-8 bg-[var(--theme-accent)] opacity-40" />
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <p className="mt-6 text-sm leading-[1.8] text-[var(--theme-base-muted)]">{aboutText}</p>
        </ScrollReveal>

      </section>

      {/* ── Experience ── */}
      <section id="m-experience" className="px-5 py-16 sm:px-8">
        <ScrollReveal>
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--theme-accent)]">
            Experience
          </h2>
          <div className="mt-1 h-px w-8 bg-[var(--theme-accent)] opacity-40" />
        </ScrollReveal>

        <div className="mt-8 flex flex-col gap-6">
          {experiences.map((exp, i) => (
            <ScrollReveal key={exp.id} delay={i * 0.08}>
              <div className="relative border-l-2 border-[var(--theme-pencil-light)] pl-5">
                <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-[var(--theme-accent)]" />
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                  <h3 className="text-base font-semibold text-[var(--theme-base)]">
                    {exp.role}
                  </h3>
                  <span className="text-xs text-[var(--theme-accent)]">{exp.company}</span>
                </div>
                <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--theme-pencil-light)]">
                  {exp.period}
                </span>
                <p className="mt-2 text-sm leading-relaxed text-[var(--theme-base-muted)]">
                  {exp.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {exp.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded border border-[var(--theme-pencil-light)] px-2 py-0.5 text-[11px] text-[var(--theme-base-muted)]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── Skills ── */}
      <section id="m-skills" className="px-5 py-16 sm:px-8">
        <ScrollReveal>
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--theme-accent)]">
            Skills
          </h2>
          <div className="mt-1 h-px w-8 bg-[var(--theme-accent)] opacity-40" />
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mt-8 grid grid-cols-1 gap-4">
            {skillCategories.map((cat) => (
              <div
                key={cat.id}
                className="border border-[var(--theme-pencil-light)] bg-[var(--theme-card-bg)] p-4"
              >
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--theme-base)]">
                  {cat.label}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {cat.items.map((item) => (
                    <span
                      key={item}
                      className="rounded border border-[var(--theme-pencil-light)] px-2 py-0.5 text-[11px] text-[var(--theme-base-muted)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* ── Metrics & Results ── */}
      <section id="m-metrics" className="px-5 py-16 sm:px-8">
        <ScrollReveal>
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--theme-accent)]">
            Metrics & Results
          </h2>
          <div className="mt-1 h-px w-8 bg-[var(--theme-accent)] opacity-40" />
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {metricsOverview.map((m) => (
              <div
                key={m.label}
                className="border border-[var(--theme-pencil-light)] bg-[var(--theme-card-bg)] p-4"
              >
                <div className="text-2xl font-bold text-[var(--theme-accent)]">
                  {m.value}
                </div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--theme-base)]">
                  {m.label}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-[var(--theme-base-muted)]">
                  {m.description}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* ── Contact ── */}
      <section ref={contactRef} id="m-contact" className="px-5 py-16 pb-24 sm:px-8">
        <ScrollReveal>
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--theme-accent)]">
            Get in Touch
          </h2>
          <div className="mt-1 h-px w-8 bg-[var(--theme-accent)] opacity-40" />
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <a
            href={`mailto:${contact.email}`}
            className="mt-6 inline-block text-sm font-medium text-[var(--theme-base)] underline decoration-[var(--theme-pencil-light)] underline-offset-4 transition-colors hover:decoration-[var(--theme-accent)]"
          >
            {contact.email}
          </a>
          <div className="mt-4 flex items-center gap-4">
            {contact.links.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--theme-base-muted)] transition-colors duration-200 hover:text-[var(--theme-accent)] [&_svg]:h-5 [&_svg]:w-5"
                aria-label={label}
              >
                {isSocialIcon(label) ? <SocialIcon label={label} /> : label}
              </a>
            ))}
          </div>
          <a
            href={resumeUrl}
            download
            className="mt-4 inline-flex items-center gap-2 border border-[var(--theme-pencil-light)] px-4 py-2 text-sm font-medium text-[var(--theme-base)] transition-colors duration-200 hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Resume
          </a>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="mt-8 border border-[var(--theme-pencil-light)] bg-[var(--theme-card-bg)] p-5">
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--theme-base-muted)]">
              Send a message
            </h3>
            <div className="flex flex-col gap-3">
              <div>
                <label
                  htmlFor="m-name"
                  className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-[var(--theme-base-muted)]"
                >
                  Name
                </label>
                <input
                  id="m-name"
                  type="text"
                  value={inquiryName}
                  onChange={(e) => setInquiryName(e.target.value)}
                  className="w-full border border-[var(--theme-pencil-light)] bg-transparent px-3 py-2 text-sm text-[var(--theme-base)] placeholder:text-[var(--theme-pencil-light)] focus:border-[var(--theme-accent)] focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="m-email"
                  className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-[var(--theme-base-muted)]"
                >
                  Email
                </label>
                <input
                  id="m-email"
                  type="email"
                  value={inquiryEmail}
                  onChange={(e) => setInquiryEmail(e.target.value)}
                  className="w-full border border-[var(--theme-pencil-light)] bg-transparent px-3 py-2 text-sm text-[var(--theme-base)] placeholder:text-[var(--theme-pencil-light)] focus:border-[var(--theme-accent)] focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="m-message"
                  className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-[var(--theme-base-muted)]"
                >
                  Message
                </label>
                <textarea
                  id="m-message"
                  rows={4}
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  placeholder="Your feedback or comment…"
                  className="w-full resize-none border border-[var(--theme-pencil-light)] bg-transparent px-3 py-2 text-sm text-[var(--theme-base)] placeholder:text-[var(--theme-pencil-light)] focus:border-[var(--theme-accent)] focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={submitInquiry}
                disabled={inquirySubmitting || inquirySuccess}
                className="mt-1 w-full border border-[var(--theme-pencil-light)] bg-transparent py-2.5 text-sm font-semibold text-[var(--theme-base)] transition-all duration-200 hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)] disabled:opacity-50"
              >
                {inquirySuccess ? "Sent \u2713" : inquirySubmitting ? "Sending\u2026" : "Submit"}
              </button>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Bottom line accent */}
      <div className="flex justify-center pb-8">
        <div className="h-px w-12 bg-[var(--theme-pencil-light)] opacity-40" />
      </div>
    </div>
  );
}
