import type { Metadata } from "next";
import { Architects_Daughter, Geist } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { CommandPalette } from "@/app/components/CommandPalette";
import { Toaster } from "@/app/components/Toaster";
import { getResumeUrl } from "@/app/lib/resume";
import { siteName, siteUrl } from "@/app/lib/site";
import { hero } from "@/app/lib/seed-data";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
/** Handwritten face (architect's lettering), for titles and annotations to echo the sketch style. */
const handFont = Architects_Daughter({ subsets: ["latin"], weight: "400", variable: "--font-hand-face" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Joshua T. Alemayehu — Full-Stack Engineer",
    template: `%s · ${siteName}`,
  },
  description: hero.headline,
  applicationName: siteName,
  authors: [{ name: siteName, url: siteUrl }],
  keywords: ["Full-stack engineer", "Spring Boot", "Java", "React", "Next.js", "PostgreSQL", "Stripe", "Addis Ababa", "Remote"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName,
    locale: "en_US",
    url: "/",
    title: "Joshua T. Alemayehu — Full-Stack Engineer",
    description: hero.headline,
  },
  twitter: {
    card: "summary_large_image",
    title: "Joshua T. Alemayehu — Full-Stack Engineer",
    description: hero.headline,
  },
};

/**
 * Runs before paint: marks JS as available, applies the saved/system theme, and — on wide
 * screens — hides the scroll page early when the visitor last chose the canvas view.
 */
const prePaintScript = `
(function() {
  var root = document.documentElement;
  root.classList.add('js');
  var stored = null, layout = null;
  try { stored = localStorage.getItem('theme'); layout = localStorage.getItem('layout'); } catch (e) {}
  var dark = stored === 'dark' || (!stored && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (dark) {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.removeAttribute('data-theme');
  }
  if (layout === 'canvas' && window.matchMedia && window.matchMedia('(min-width: 1024px)').matches) {
    root.classList.add('layout-canvas');
  }
})();
`;

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${handFont.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: prePaintScript }} />
      </head>
      <body className="relative font-sans antialiased">
        {children}
        {modal}
        <CommandPalette resumeUrl={getResumeUrl()} />
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
