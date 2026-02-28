"use client";

import { useEffect, useState } from "react";

/**
 * Never-ending vertical marquee of tech logos on the right side of the background.
 * Logos scroll from bottom to top, subtle and slow, in grayscale.
 */

const TECH_LOGOS = [
  { slug: "angular", label: "Angular" },
  { slug: "liquibase", label: "Liquibase" },
  { slug: "hibernate", label: "Hibernate" },
  { slug: "postgresql", label: "PostgreSQL" },
  { slug: "springboot", label: "Spring Boot" },
  { slug: "openjdk", label: "Java" },
  { slug: "nodedotjs", label: "Node.js" },
  { slug: "mongodb", label: "MongoDB" },
  { slug: "express", label: "Express.js" },
  { slug: "jsonwebtokens", label: "JWT" },
  { slug: "javascript", label: "JavaScript" },
  { slug: "python", label: "Python" },
  { slug: "nextdotjs", label: "Next.js" },
  { slug: "react", label: "React" },
  { slug: "typescript", label: "TypeScript" },
  { slug: "cloudinary", label: "Cloudinary" },
  { slug: "tailwindcss", label: "Tailwind CSS" },
  { slug: "flutter", label: "Flutter" },
];

const LOGO_SIZE = 28;
const GAP = 20;
const LOOP_GAP = 32;
const COPY_COUNT = 4;

export function TechMarquee() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => {
      const dark = root.classList.contains("dark") || root.getAttribute("data-theme") === "dark";
      setIsDark(dark);
    };

    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => observer.disconnect();
  }, []);

  const iconColor = isDark ? "d4d4d4" : "6b7280";

  return (
    <div
      className="pointer-events-none fixed right-0 top-0 z-20 hidden h-full w-24 md:block md:w-28"
      style={{ clipPath: "inset(0 0 0 -200px)" }}
      aria-hidden
    >
      <div
        className="tech-marquee-track pointer-events-auto absolute top-0 left-0 right-0 flex flex-col"
        style={{ "--marquee-shift": `${100 / COPY_COUNT}%` } as React.CSSProperties}
      >
        {Array.from({ length: COPY_COUNT }).map((_, copyIndex) => (
          <div
            key={copyIndex}
            className="flex shrink-0 flex-col items-center"
            style={{ gap: GAP, paddingBottom: LOOP_GAP }}
          >
            {TECH_LOGOS.map(({ slug, label }, i) => (
              <div
                key={`${copyIndex}-${slug}-${i}`}
                className="group relative flex shrink-0 items-center justify-center opacity-30 transition-opacity duration-150 hover:opacity-80"
                style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
              >
                <img
                  src={`https://cdn.simpleicons.org/${slug}/${iconColor}`}
                  alt=""
                  width={LOGO_SIZE}
                  height={LOGO_SIZE}
                  className="h-full w-full object-contain"
                  style={{ imageRendering: "auto" }}
                />
                <span className="pointer-events-none absolute right-full mr-2 whitespace-nowrap rounded-md border border-black/10 bg-white/80 px-2 py-1 text-[11px] font-medium text-black opacity-0 shadow-sm backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100 dark:border-white/10 dark:bg-black/75 dark:text-white">
                  {label}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
