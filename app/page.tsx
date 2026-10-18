import { PortfolioHome } from "@/app/components/PortfolioHome";
import { getResumeUrl } from "@/app/lib/resume";
import { contact, education, hero, skillCategories } from "@/app/lib/seed-data";
import { siteUrl } from "@/app/lib/site";

/** schema.org Person data so search engines can show a proper profile result. */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Joshua T. Alemayehu",
  jobTitle: "Full-Stack Engineer",
  description: hero.headline,
  url: siteUrl,
  email: `mailto:${contact.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Addis Ababa", addressCountry: "ET" },
  alumniOf: education.map((item) => ({ "@type": "CollegeOrUniversity", name: item.school })),
  knowsAbout: skillCategories.flatMap((category) => category.items).slice(0, 20),
  sameAs: contact.links.map((link) => link.href),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // JSON.stringify output is safe here: it's our own static data, with "<" escaped below.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
      />
      <PortfolioHome resumeUrl={getResumeUrl()} />
    </>
  );
}
