/**
 * Compute center positions for all visible cards given expanded path.
 * Children extend far into canvas space with arc-based spread; radius scales by depth.
 */

import { getChildrenIds } from "./graph-data";

/** Radial distance for first-level children (from root sections). ~2.5–4× previous. */
const ROOT_CHILD_RADIUS = 520;
/** Second level (e.g. project → tech/demo/repo). */
const LEVEL_2_RADIUS = 400;
/** Third level. */
const LEVEL_3_RADIUS = 320;
/** Fourth level and deeper. */
const LEVEL_4_RADIUS = 260;

/** Arc spread in radians (270° = wide arc into space, not full circle). */
const ARC_SPREAD = (3 / 4) * Math.PI * 2;

const CARD_W = 260;
const CARD_H = 140;

/**
 * Positions along an arc (not full circle) so children spread into available space.
 */
export function radialPositions(
  cx: number,
  cy: number,
  count: number,
  radius: number,
  startAngle = -Math.PI / 2,
  arcAngle = ARC_SPREAD
): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  if (count <= 0) return out;
  const step = count === 1 ? 0 : arcAngle / (count - 1);
  for (let i = 0; i < count; i++) {
    const a = startAngle + i * step;
    out.push({ x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) });
  }
  return out;
}

export type PositionMap = Map<string, { x: number; y: number }>;

function radiusForDepth(depth: number, childCount: number): number {
  if (depth === 0) return Math.max(ROOT_CHILD_RADIUS, 320 + childCount * 24);
  if (depth === 1) return Math.max(LEVEL_2_RADIUS, 280 + childCount * 20);
  if (depth === 2) return Math.max(LEVEL_3_RADIUS, 240 + childCount * 16);
  return Math.max(LEVEL_4_RADIUS, 200 + childCount * 12);
}

/** Padding between cards so they don’t touch when nudged. */
const CARD_PAD = 24;

const ROOT_SIZES: Record<string, { w: number; h: number }> = {
  intro: { w: 580, h: 320 },
  projects: { w: 460, h: 240 },
  about: { w: 440, h: 200 },
  contact: { w: 360, h: 180 },
};

function cardRect(id: string, pos: { x: number; y: number }) {
  const size = ROOT_SIZES[id] || { w: CARD_W, h: CARD_H };
  return {
    left: pos.x - size.w / 2 - CARD_PAD / 2,
    right: pos.x + size.w / 2 + CARD_PAD / 2,
    top: pos.y - size.h / 2 - CARD_PAD / 2,
    bottom: pos.y + size.h / 2 + CARD_PAD / 2,
  };
}

function rectsOverlap(
  a: { left: number; right: number; top: number; bottom: number },
  b: { left: number; right: number; top: number; bottom: number }
) {
  return !(a.right < b.left || b.right < a.left || a.bottom < b.top || b.bottom < a.top);
}

const ROOT_IDS = new Set(["intro", "projects", "about", "contact"]);

/** Nudge positions so no two cards overlap. Push earlier nodes away from later (newly expanded) ones so new nodes stay visible; roots stay fixed. */
function resolveOverlaps(positions: PositionMap, order: string[]): void {
  const maxIter = 80;
  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false;
    for (let i = 0; i < order.length; i++) {
      for (let j = i + 1; j < order.length; j++) {
        const idA = order[i];
        const idB = order[j];
        const posA = positions.get(idA);
        const posB = positions.get(idB);
        if (!posA || !posB) continue;
        const rA = cardRect(idA, posA);
        const rB = cardRect(idB, posB);
        if (!rectsOverlap(rA, rB)) continue;
        const dx = posB.x - posA.x;
        const dy = posB.y - posA.y;
        const len = Math.hypot(dx, dy) || 1;
        
        // Approximate collision radius based on max dimension of each node
        const sizeA = ROOT_SIZES[idA] || { w: CARD_W, h: CARD_H };
        const sizeB = ROOT_SIZES[idB] || { w: CARD_W, h: CARD_H };
        const radiusA = Math.max(sizeA.w, sizeA.h) / 2;
        const radiusB = Math.max(sizeB.w, sizeB.h) / 2;
        
        const minDist = radiusA + radiusB + CARD_PAD;
        const push = (minDist - len) * 1.3;
        
        if (push <= 0) continue;
        
        // Handle exact overlap or close to zero distance to avoid NaNs
        const safeLen = len || 1;
        const safeDx = len === 0 ? 1 : dx;
        const safeDy = dy;
        
        const nx = safeDx / safeLen;
        const ny = safeDy / safeLen;

        /* Prefer moving the later node (idB) to preserve stability of earlier nodes (idA). */
        /* If idB is a root, we can't move it. Then we try moving idA (if idA is not a root). */
        if (ROOT_IDS.has(idB)) {
          if (!ROOT_IDS.has(idA)) {
            positions.set(idA, { x: posA.x - nx * push, y: posA.y - ny * push });
            changed = true;
          }
        } else {
          // Normal case: Move B away from A
          positions.set(idB, { x: posB.x + nx * push, y: posB.y + ny * push });
          changed = true;
        }
      }
    }
    if (!changed) break;
  }
}

export function getCardPositions(
  expandedPath: string[],
  rootCenters: Record<string, { x: number; y: number }>
): PositionMap {
  const positions = new Map<string, { x: number; y: number }>();
  const order: string[] = [];

  for (const [id, pos] of Object.entries(rootCenters)) {
    positions.set(id, pos);
    order.push(id);
  }

  for (let i = 0; i < expandedPath.length; i++) {
    const parentId = expandedPath[i];
    const parentPos = positions.get(parentId) ?? rootCenters[parentId];
    if (!parentPos) continue;
    const childIds = getChildrenIds(parentId);
    if (childIds.length === 0) continue;
    const depth = i;
    const radius = radiusForDepth(depth, childIds.length);

    if (parentId === "contact" && childIds.includes("email")) {
      // Contact layout: email tucked under the contact section; others along arc
      const contactH = ROOT_SIZES.contact.h;
      const emailTuckedY = parentPos.y + contactH / 2 + CARD_H / 2 + CARD_PAD;
      const others = childIds.filter((id) => id !== "email");
      const arcPositions = radialPositions(
        parentPos.x,
        parentPos.y,
        others.length,
        radius,
        -Math.PI / 2,
        ARC_SPREAD
      );
      let arcIndex = 0;
      childIds.forEach((id) => {
        order.push(id);
        if (id === "email") {
          positions.set(id, { x: parentPos.x, y: emailTuckedY });
        } else {
          positions.set(id, arcPositions[arcIndex++]);
        }
      });
    } else {
      const childPositions = radialPositions(
        parentPos.x,
        parentPos.y,
        childIds.length,
        radius,
        -Math.PI / 2,
        ARC_SPREAD
      );
      childIds.forEach((id, j) => {
        positions.set(id, childPositions[j]);
        order.push(id);
      });
    }
  }

  resolveOverlaps(positions, order);
  return positions;
}

export const LAYOUT = { ROOT_CHILD_RADIUS, LEVEL_2_RADIUS, LEVEL_3_RADIUS, LEVEL_4_RADIUS, CARD_W, CARD_H } as const;
