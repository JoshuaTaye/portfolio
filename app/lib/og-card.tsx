import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

/** Slightly wobbly rectangle, so the preview card echoes the site's hand-drawn borders. */
const SKETCH_FRAME =
  "M42 40 C 380 36, 820 44, 1160 38 C 1163 220, 1157 420, 1161 592 C 820 596, 380 588, 40 594 C 37 420, 43 220, 42 40 Z";

/** Link-preview image (Open Graph / Twitter) in the portfolio's sketch style. */
export function ogCard({
  eyebrow,
  title,
  subtitle,
  tags,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  tags: string[];
  footer: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#fbfbf9",
          color: "#1a1a1a",
          fontFamily: "sans-serif",
        }}
      >
        <svg width="1200" height="630" style={{ position: "absolute", left: 0, top: 0 }}>
          <path d={SKETCH_FRAME} fill="none" stroke="#9a9a9a" strokeWidth="3" />
          <path d="M96 560 C 300 552, 520 566, 720 556" fill="none" stroke="#7d9a8a" strokeWidth="6" strokeLinecap="round" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column", padding: "86px 96px", width: "100%" }}>
          <div style={{ display: "flex", fontSize: 26, letterSpacing: 4, textTransform: "uppercase", color: "#4f6e5e" }}>
            {eyebrow}
          </div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 76, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05 }}>
            {title}
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 32, lineHeight: 1.35, color: "#3d3d3d", maxWidth: 960 }}>
            {subtitle}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 34 }}>
            {tags.slice(0, 6).map((tag) => (
              <div
                key={tag}
                style={{ display: "flex", border: "2px solid #9a9a9a", padding: "6px 16px", fontSize: 24, color: "#3d3d3d" }}
              >
                {tag}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", marginTop: "auto", fontSize: 24, color: "#6b6b6b" }}>{footer}</div>
        </div>
      </div>
    ),
    ogSize
  );
}
