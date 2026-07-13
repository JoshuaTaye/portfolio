import type { Metadata } from "next";
import "./globals.css";
import { TechMarquee } from "@/app/components/TechMarquee";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Joshua T. Alemayehu — Full-Stack Developer",
  description:
    "Full-stack developer portfolio — Next.js, TypeScript, Spring Boot, PostgreSQL.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  var stored = localStorage.getItem('theme');
  var dark = stored === 'dark' || (!stored && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (dark) {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');
  }
})();
`,
          }}
        />
      </head>
      <body className="relative font-sans antialiased">
        <TechMarquee />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
