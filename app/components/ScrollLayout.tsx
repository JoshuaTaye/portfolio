"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useInView } from "framer-motion";
import { SocialIcon, isSocialIcon, EmailIcon, PhoneIcon } from "./SocialIcons";
import {
  featuredProjects,
  moreProjects,
  aboutParagraphs,
  contact,
  experiences,
  hero,
  testimonials,
  type Experience,
} from "@/app/lib/seed-data";
import { INQUIRY_LIMITS } from "@/app/lib/inquiry";
import { useInquiryForm } from "@/app/lib/use-inquiry-form";
import { projectsForSkill } from "@/app/lib/skills";
import { sections, type SectionId } from "@/app/lib/sections";
import { copyToClipboard } from "@/app/lib/ui-store";
import { AboutBio, AboutDetails } from "./AboutDetails";
import { SectionHeading, SketchFrame, SketchTimeline } from "./Sketch";
import { BackToTop, SiteHeader } from "./SiteHeader";
import { ExplodedStack } from "./ExplodedStack";
import { ProjectStack } from "./ProjectStack";

/**
 * Fades content in as it scrolls into view. The hidden starting state only applies
 * once JS is running (`.js` on <html>), so server HTML and no-JS visitors see everything.
 */
function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <div
      ref={ref}
      className={`reveal ${isInView ? "is-visible" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}

/** Tracks which section is crossing the middle of the viewport, for the header highlight. */
function useActiveSection(): SectionId {
  const [active, setActive] = useState<SectionId>("hero");
  useEffect(() => {
    const ids: SectionId[] = ["hero", ...sections.map((s) => s.id)];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id as SectionId);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);
  return active;
}

const primaryButtonClass =
  "sketch-fill sketch-hover inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-[var(--theme-background)] transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)] focus-visible:ring-offset-2";
const secondaryButtonClass =
  "sketch sketch-hover inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-[var(--theme-base)] transition duration-200 hover:-translate-y-0.5 hover:text-[var(--theme-accent-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)] focus-visible:ring-offset-2";
const fieldClass =
  "sketch sketch-focus w-full bg-transparent px-3 py-2 text-sm text-[var(--theme-base)] placeholder:text-[var(--theme-base-muted)] focus:outline-none";

function CopyIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <rect x="9" y="9" width="11" height="11" rx="1.5" strokeWidth={1.8} />
      <path strokeWidth={1.8} d="M5 15V5a1 1 0 0 1 1-1h10" />
    </svg>
  );
}

function ContactForm() {
  const form = useInquiryForm();
  const submitting = form.status === "submitting";

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        form.submit();
      }}
      className="relative p-5 sm:p-6"
    >
      <h3 className="font-hand mb-4 text-2xl text-[var(--theme-base)]">Send a message</h3>
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-[var(--theme-base-muted)]">Name</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            required
            maxLength={INQUIRY_LIMITS.name}
            value={form.values.name}
            onChange={(e) => form.setField("name", e.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-[var(--theme-base-muted)]">Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            maxLength={INQUIRY_LIMITS.email}
            value={form.values.email}
            onChange={(e) => form.setField("email", e.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-[var(--theme-base-muted)]">Message</span>
          <textarea
            name="message"
            rows={5}
            required
            maxLength={INQUIRY_LIMITS.message}
            value={form.values.message}
            onChange={(e) => form.setField("message", e.target.value)}
            placeholder="What are you working on?"
            className={`${fieldClass} resize-none`}
          />
        </label>
        {/* Honeypot: off-screen and skipped by keyboard and screen readers, so only bots fill it in. */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Company
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              value={form.values.company}
              onChange={(e) => form.setField("company", e.target.value)}
            />
          </label>
        </div>
        <div aria-live="polite" className="text-sm">
          {form.status === "error" && form.error && <p className="text-[var(--theme-error)]">{form.error}</p>}
          {form.status === "success" && (
            <p className="text-[var(--theme-accent-ink)]">Thanks — your message is on its way. I&apos;ll get back to you soon.</p>
          )}
        </div>
        <button type="submit" disabled={submitting} className={`${primaryButtonClass} mt-1 w-full disabled:opacity-50`}>
          {submitting ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}

/** Scroll page: the default view at every width, always server-rendered. */
export function ScrollLayout({
  className = "",
  resumeUrl,
  onSelectExperience,
}: {
  className?: string;
  resumeUrl: string | null;
  onSelectExperience: (experience: Experience) => void;
}) {
  const activeSection = useActiveSection();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const matchingIds = useMemo(
    () => (selectedSkill ? new Set(projectsForSkill(selectedSkill).map((p) => p.id)) : null),
    [selectedSkill]
  );

  const selectSkill = (skill: string) => {
    const next = selectedSkill === skill ? null : skill;
    setSelectedSkill(next);
    if (next) document.getElementById("m-projects")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className={`relative min-h-screen w-full overflow-x-clip bg-[var(--theme-background)] ${className}`}>
      <SiteHeader variant="home" activeSection={activeSection} resumeUrl={resumeUrl} />

      <main>
        <section id="hero" className="relative overflow-clip">
          <div className="mx-auto grid max-w-6xl items-center gap-6 px-6 py-14 sm:px-8 lg:min-h-[calc(100svh-3.5rem)] lg:grid-cols-[1.05fr_1fr] lg:gap-4 lg:py-16">
            <ScrollReveal className="flex flex-col items-start text-left">
              <h1 className="mt-6 text-4xl font-bold leading-[1.02] tracking-tight text-[var(--theme-base)] sm:text-6xl lg:text-7xl">Joshua T. Alemayehu</h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--theme-base)] sm:text-xl">{hero.headline}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a href="#m-projects" className={primaryButtonClass}>
                  View projects
                </a>
                {resumeUrl && (
                  <a href={resumeUrl} download className={secondaryButtonClass}>
                    Download CV
                  </a>
                )}
                <a href={`mailto:${contact.email}`} className={secondaryButtonClass}>
                  Email me
                </a>
              </div>

              <div className="mt-8 flex items-center gap-5">
                {contact.links.map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--theme-base-muted)] transition-colors duration-200 hover:text-[var(--theme-accent-ink)] [&_svg]:h-5 [&_svg]:w-5"
                    aria-label={label}
                  >
                    {isSocialIcon(label) ? <SocialIcon label={label} /> : label}
                  </a>
                ))}
                <span className="hidden text-xs text-[var(--theme-base-muted)] sm:inline">
                  · press <kbd className="sketch sketch-sm px-1.5">⌘K</kbd> to jump anywhere
                </span>
              </div>
            </ScrollReveal>

            <ExplodedStack className="mx-auto w-full max-w-md lg:max-w-none" />
          </div>
        </section>

        <section id="m-projects" className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <SectionHeading>Selected work</SectionHeading>

          {selectedSkill && matchingIds && (
            <div className="sketch sketch-accent mt-6 flex flex-wrap items-center gap-3 px-4 py-2 text-sm text-[var(--theme-base)]" role="status">
              <span>
                Showing projects that use <strong>{selectedSkill}</strong> ({matchingIds.size})
              </span>
              <button
                type="button"
                onClick={() => setSelectedSkill(null)}
                className="ml-auto text-sm font-semibold text-[var(--theme-accent-ink)] underline underline-offset-4"
              >
                Clear filter
              </button>
            </div>
          )}

          <ProjectStack projects={featuredProjects} matchingIds={matchingIds} />

          <ScrollReveal>
            <h3 className="font-hand mt-14 text-2xl text-[var(--theme-base)]">More projects</h3>
          </ScrollReveal>
          <ul className="mt-4 grid gap-4 md:grid-cols-3">
            {moreProjects.map((project) => {
              const dimmed = Boolean(matchingIds && !matchingIds.has(project.id));
              return (
                <li
                  key={project.id}
                  className={`sketch sketch-hover transition-opacity duration-300 ${
                    dimmed ? "opacity-35" : ""
                  }`}
                >
                  <Link
                    href={`/projects/${project.id}`}
                    scroll={false}
                    className="scribble-fill group flex h-full w-full flex-col gap-1 p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)]"
                  >
                    <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <span className="font-semibold text-[var(--theme-base)] group-hover:text-[var(--theme-accent-ink)]">{project.title}</span>
                      {project.period && <span className="text-xs text-[var(--theme-base-muted)]">{project.period}</span>}
                    </span>
                    <span className="text-sm leading-relaxed text-[var(--theme-base-muted)]">{project.description}</span>
                    <span className="mt-1 text-xs text-[var(--theme-base-muted)]">{project.tags.join(" · ")}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {testimonials.length > 0 && (
          <section id="m-testimonials" className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
            <SectionHeading>What clients say</SectionHeading>
            {testimonials.map((testimonial) => (
              <ScrollReveal key={testimonial.quote} delay={0.1}>
                <SketchFrame className="mt-8">
                  <figure className="relative px-7 pb-8 pt-14 sm:px-12 sm:pb-11 sm:pt-16">
                    <span className="font-hand pointer-events-none absolute left-6 top-3 text-6xl leading-none sm:left-10 sm:top-4 text-[var(--theme-accent-ink)]/50" aria-hidden>
                      “
                    </span>
                    <blockquote className="relative text-base italic leading-relaxed text-[var(--theme-base)] sm:text-lg">
                      {testimonial.quote}
                    </blockquote>
                    <figcaption className="mt-6 text-sm text-[var(--theme-base-muted)]">
                      — {testimonial.author}, {testimonial.context}
                    </figcaption>
                  </figure>
                </SketchFrame>
              </ScrollReveal>
            ))}
          </section>
        )}

        <section id="m-about" className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <SectionHeading>About</SectionHeading>
          <div className="mt-12 grid gap-16 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
            <ScrollReveal>
              <AboutBio paragraphs={aboutParagraphs} />
            </ScrollReveal>
            <ScrollReveal delay={0.1} className="lg:pt-2">
              <AboutDetails selectedSkill={selectedSkill} onSelectSkill={selectSkill} />
            </ScrollReveal>
          </div>
        </section>

        <section id="m-experience" className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
          <SectionHeading>Experience</SectionHeading>
          <div className="mt-8">
            <SketchTimeline>
              {experiences.map((exp) => (
                <li key={exp.id}>
                  <button
                    type="button"
                    onClick={() => onSelectExperience(exp)}
                    className="scribble-fill group w-full p-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)]"
                    aria-label={`View ${exp.role} at ${exp.company}`}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <h3 className="text-base font-semibold text-[var(--theme-base)]">{exp.role}</h3>
                      <span className="text-xs tracking-wide text-[var(--theme-base-muted)]">{exp.period}</span>
                    </div>
                    <p className="mt-0.5 text-sm font-medium text-[var(--theme-accent-ink)]">{exp.company}</p>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--theme-base-muted)]">{exp.description}</p>
                    <ul className="mt-2.5 flex flex-wrap gap-1.5" aria-label="Technologies">
                      {exp.technologies.map((tech) => (
                        <li
                          key={tech}
                          className="sketch sketch-sm px-2 py-0.5 text-xs text-[var(--theme-base-muted)]"
                        >
                          {tech}
                        </li>
                      ))}
                    </ul>
                    {exp.highlights && (
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--theme-accent-ink)]">
                        What I did <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </SketchTimeline>
          </div>
        </section>

        <section id="m-contact" className="mx-auto max-w-6xl px-5 py-16 pb-24 sm:px-8">
          <SectionHeading>Get in touch</SectionHeading>
          <div className="mt-8 grid gap-10 lg:grid-cols-2">
            <ScrollReveal>
              <p className="max-w-md text-base leading-relaxed text-[var(--theme-base-muted)]">
                The fastest way to reach me is email — I usually reply within a day.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`mailto:${contact.email}`}
                    className="inline-flex items-center gap-2.5 text-base font-medium text-[var(--theme-base)] underline decoration-[var(--theme-pencil-light)] underline-offset-4 transition-colors hover:decoration-[var(--theme-accent)]"
                  >
                    <EmailIcon className="h-4 w-4 shrink-0 text-[var(--theme-accent-ink)]" />
                    {contact.email}
                  </a>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(contact.email, "Email copied to clipboard")}
                    className="sketch sketch-hover inline-flex h-8 items-center gap-1.5 px-2 text-xs font-medium text-[var(--theme-base-muted)] transition-colors hover:text-[var(--theme-base)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)]"
                    aria-label="Copy email address"
                  >
                    <CopyIcon className="h-3.5 w-3.5" /> Copy
                  </button>
                </div>
                <a
                  href={`tel:${contact.phone}`}
                  className="inline-flex w-fit items-center gap-2.5 text-base font-medium text-[var(--theme-base)] underline decoration-[var(--theme-pencil-light)] underline-offset-4 transition-colors hover:decoration-[var(--theme-accent)]"
                >
                  <PhoneIcon className="h-4 w-4 shrink-0 text-[var(--theme-accent-ink)]" />
                  {contact.phone}
                </a>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  {contact.links.map(({ label, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="sketch-round sketch-hover flex h-10 w-10 items-center justify-center text-[var(--theme-base-muted)] transition-colors duration-200 hover:text-[var(--theme-accent-ink)]"
                    >
                      {isSocialIcon(label) ? <SocialIcon label={label} className="h-4 w-4" /> : label}
                    </a>
                  ))}
                  {resumeUrl && (
                    <a href={resumeUrl} download className={`${secondaryButtonClass} h-10 py-0`}>
                      Download CV
                    </a>
                  )}
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <SketchFrame>
                <ContactForm />
              </SketchFrame>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--theme-pencil-light)]/30">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-[var(--theme-base-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} Joshua T. Alemayehu · Addis Ababa</p>
          <p>Built with Next.js, rough.js and Framer Motion · Press ⌘K to search</p>
        </div>
      </footer>

      <BackToTop />
    </div>
  );
}
