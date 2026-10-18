"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny global UI store: layout mode (scroll page or canvas), the command palette, and toasts.
 * Shared by the home page, project pages and the root layout without a context provider.
 */

export type LayoutMode = "page" | "canvas";
export type Toast = { id: number; message: string };

type UiState = {
  layout: LayoutMode;
  paletteOpen: boolean;
  toasts: Toast[];
};

const SERVER_STATE: UiState = { layout: "page", paletteOpen: false, toasts: [] };
const LAYOUT_KEY = "layout";

let state: UiState = SERVER_STATE;
let initialized = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function update(patch: Partial<UiState>) {
  state = { ...state, ...patch };
  emit();
}

function subscribe(listener: () => void) {
  if (!initialized) {
    initialized = true;
    try {
      if (localStorage.getItem(LAYOUT_KEY) === "canvas") state = { ...state, layout: "canvas" };
    } catch {
      // Storage unavailable (private mode): keep the default page layout.
    }
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useUiState<T>(select: (s: UiState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => select(state),
    () => select(SERVER_STATE)
  );
}

export function setLayout(layout: LayoutMode) {
  try {
    localStorage.setItem(LAYOUT_KEY, layout);
  } catch {}
  // Mirrors the pre-paint class set in layout.tsx so a reload doesn't flash the other layout.
  document.documentElement.classList.toggle("layout-canvas", layout === "canvas");
  update({ layout });
}

export function openPalette() {
  update({ paletteOpen: true });
}

export function closePalette() {
  update({ paletteOpen: false });
}

export function togglePalette() {
  update({ paletteOpen: !state.paletteOpen });
}

let toastId = 0;

export function showToast(message: string) {
  const toast = { id: ++toastId, message };
  update({ toasts: [...state.toasts, toast] });
  window.setTimeout(() => {
    update({ toasts: state.toasts.filter((t) => t.id !== toast.id) });
  }, 2600);
}

export async function copyToClipboard(text: string, successMessage: string) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMessage);
  } catch {
    showToast("Couldn't copy — please copy it manually.");
  }
}
