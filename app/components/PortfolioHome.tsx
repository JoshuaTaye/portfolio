"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { Experience, Project } from "@/app/lib/seed-data";
import { toggleTheme, useDarkMode, useIsMounted, useMediaQuery } from "@/app/lib/client-hooks";
import { setLayout, useUiState } from "@/app/lib/ui-store";
import { ScrollLayout } from "./ScrollLayout";
import { CanvasView } from "./Canvas";
import { ThemeToggle } from "./ThemeToggle";
import { ExperienceModal } from "./ExperienceModal";
import { BioModal } from "./BioModal";

/** The canvas is offered from this width up; smaller screens always get the scroll page. */
const CANVAS_MEDIA_QUERY = "(min-width: 1024px)";

/**
 * Home page shell. The scroll page is the default and is always server-rendered; visitors on
 * wide screens can switch to the canvas, and that choice is remembered.
 */
export function PortfolioHome({ resumeUrl }: { resumeUrl: string | null }) {
  const router = useRouter();
  const mounted = useIsMounted();
  const isWide = useMediaQuery(CANVAS_MEDIA_QUERY);
  const layout = useUiState((s) => s.layout);
  const darkMode = useDarkMode();
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [bioOpen, setBioOpen] = useState(false);

  const openProject = useCallback(
    (project: Project) => router.push(`/projects/${project.id}`, { scroll: false }),
    [router]
  );
  const closeExperience = useCallback(() => setSelectedExperience(null), []);
  const closeBio = useCallback(() => setBioOpen(false), []);

  const showCanvas = mounted && isWide && layout === "canvas";

  return (
    <>
      <ExperienceModal experience={selectedExperience} onClose={closeExperience} />
      <BioModal open={bioOpen} onClose={closeBio} />

      {showCanvas ? (
        <>
          <ThemeToggle darkMode={darkMode} toggle={toggleTheme} variant="floating" />
          <CanvasView
            darkMode={darkMode}
            resumeUrl={resumeUrl}
            onSelectProject={openProject}
            onSelectExperience={setSelectedExperience}
            onOpenBio={() => setBioOpen(true)}
            onExit={() => setLayout("page")}
          />
        </>
      ) : (
        // `scroll-layout-ssr` lets the pre-paint script hide this on wide screens for canvas fans.
        <ScrollLayout className="scroll-layout-ssr" resumeUrl={resumeUrl} onSelectExperience={setSelectedExperience} />
      )}
    </>
  );
}
