import { hero } from "@/app/lib/seed-data";
import { ogCard, ogSize } from "@/app/lib/og-card";

export const alt = "Joshua T. Alemayehu — Full-stack engineer";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return ogCard({
    eyebrow: "Full-stack engineer · Portfolio",
    title: "Joshua T. Alemayehu",
    subtitle: hero.headline,
    tags: ["Java", "Spring Boot", "React", "Next.js", "PostgreSQL", "Stripe"],
    footer: "Full-stack engineer · Addis Ababa, Ethiopia",
  });
}
