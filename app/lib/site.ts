/**
 * Absolute site URL for metadata, the sitemap and preview images. Set NEXT_PUBLIC_SITE_URL once
 * you have a custom domain; on Vercel it otherwise falls back to the production deployment URL.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const siteName = "Joshua T. Alemayehu";
