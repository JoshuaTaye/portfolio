"use client";

import { motion } from "framer-motion";
import { SunnyIcon, NightIcon } from "./ThemeIcons";

type ThemeToggleProps = {
  darkMode: boolean;
  toggle: () => void;
};

export function ThemeToggle({ darkMode, toggle }: ThemeToggleProps) {
  return (
    <button
      onClick={toggle}
      className={`absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border bg-opacity-20 backdrop-blur-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        darkMode
          ? "border-gray-700 bg-black text-white hover:border-white focus:ring-white focus:ring-offset-black"
          : "border-gray-300 bg-white text-black hover:border-black focus:ring-black focus:ring-offset-white"
      }`}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="relative h-6 w-6 overflow-hidden">
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
