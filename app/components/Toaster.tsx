"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useUiState } from "@/app/lib/ui-store";

/** Short confirmation messages ("Email copied"), announced politely to screen readers. */
export function Toaster() {
  const toasts = useUiState((s) => s.toasts);
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[140] flex flex-col items-center gap-2 px-4"
      aria-live="polite"
      role="status"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="sketch-fill px-4 py-2 text-sm font-medium text-[var(--theme-background)] shadow-lg"
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
