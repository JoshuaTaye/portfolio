"use client";

import { motion } from "framer-motion";
import { SunnyIcon, NightIcon } from "./ThemeIcons";

type ThemeToggleProps = {
  darkMode: boolean;
  /** Receives the button's center so the theme reveal can grow from it. */
  toggle: (origin: { x: number; y: number }) => void;
  /** "floating" pins it to the top-right corner (canvas view); "inline" sits in a header. */
  variant?: "floating" | "inline";
};

export function ThemeToggle({ darkMode, toggle, variant = "floating" }: ThemeToggleProps) {
  return (
    <button
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        toggle({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      }}
      className={
        variant === "floating"
          ? `fixed right-4 top-4 z-50 h-10 w-10 sketch-round sketch-hover flex shrink-0 items-center justify-center rounded-full backdrop-blur-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
              darkMode
                ? "bg-black text-white focus-visible:ring-white focus-visible:ring-offset-black"
                : "bg-white text-black focus-visible:ring-black focus-visible:ring-offset-white"
            }`
          : // Inline: a borderless icon button, matching the other header actions.
            "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--theme-base-muted)] transition-colors hover:bg-[var(--theme-accent)]/12 hover:text-[var(--theme-base)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)]"
      }
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={darkMode ? "Light mode" : "Dark mode"}
    >
      <div className={`relative overflow-hidden ${variant === "floating" ? "h-6 w-6" : "h-5 w-5"}`}>
        <motion.div
          initial={false}
          animate={{
            y: darkMode ? 30 : 0,
            opacity: darkMode ? 0 : 1,
            rotate: darkMode ? 90 : 0,
          }}
          transition={{ duration: 0.5, ease: "backInOut" }}
          className="absolute inset-0"
        >
          <SunnyIcon className="h-full w-full" />
        </motion.div>
        
        <motion.div
          initial={false}
          animate={{
            y: darkMode ? 0 : -30,
            opacity: darkMode ? 1 : 0,
            rotate: darkMode ? 0 : -90,
          }}
          transition={{ duration: 0.5, ease: "backInOut" }}
          className="absolute inset-0"
        >
          <NightIcon className="h-full w-full" />
        </motion.div>
      </div>
    </button>
  );
}
