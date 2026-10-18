import type { MetadataRoute } from "next";
import { projects } from "@/app/lib/seed-data";
import { siteUrl } from "@/app/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "monthly", priority: 1 },
    ...projects.map((project) => ({
      url: `${siteUrl}/projects/${project.id}`,
      changeFrequency: "monthly" as const,
      priority: project.featured ? 0.8 : 0.5,
    })),
  ];
}
