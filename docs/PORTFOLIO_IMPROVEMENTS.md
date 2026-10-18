# Portfolio Review & Improvement Guide

## Context

You asked for a thorough review of your portfolio (`~/Personal Projects/portfolio`, Next.js 16 + React 19 + Tailwind 4 + framer-motion + rough.js), judged against what a developer portfolio needs to do, plus a step-by-step improvement document covering content and UI/UX.

**How it was reviewed:** I read every source file and ran the site locally (`next dev`). Then I walked through it with headless Chromium at 1440×900 (desktop), 800×1000 (tablet) and 390×844 (mobile), in light and dark mode, using the mouse and the keyboard. I also checked the server-rendered HTML, the meta tags, the network payload and the expected routes (`/resume.pdf`, `/robots.txt`, `/sitemap.xml`, OG image).

**How to use this document:** work through §2 (P0) first, then follow the roadmap in §6. Tick off §7 after each phase. Reviewed 2026-10-18.

### Progress

**Phase 1 code changes done (2026-10-18):** P0-1, P0-3, P0-5, P0-6, P0-7, P0-8 and P0-9 are fixed. P0-2 and P0-4 are wired up but need your input. Also done: the logo marquee is removed (§4.4), the scroll layout's form has labels and inline errors (§4.5), and scroll reveals no longer hide content without JS (§4.6).

**Still needs you:**
- [x] **CV:** `public/resume.pdf` added (2026-10-18); the Download CV buttons are live.
- [x] **Screenshots:** AEBIS now has a hero image and a 4-image gallery (2026-10-18).
- [ ] **Screenshots:** the Gym Management System and PIMS have no screenshots yet (they're in "More projects", so it's optional).
- [ ] **Email notifications:** set `SENDGRID_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL` (a SendGrid-verified sender) in Vercel. Until then, messages are only saved to MongoDB.
- [ ] Send one real test message after deploying, and confirm it arrives.

**Phase 2 content done (2026-10-18):** new hero copy and availability badge; MedRoute added as the lead case study (anonymous client, review quoted, demo screenshots); projects curated into 5 featured case studies plus "More projects" (ECP merged, Gym and PIMS added); a key technical decision and countable metrics for each featured project; testimonial section; evidence-based skills; a 3-paragraph bio with stats; education and certification; experience rewritten as achievements, with Upwork freelance added; Instagram removed.

**Phase 2 still needs you:**
- [ ] **Headshot:** replace `public/portrait.jpg` (currently a casual mirror selfie, shown only on hover) with a proper headshot.
- [ ] **Name consistency:** the site says "Joshua T. Alemayehu", the CV says "Joshua Taye". Pick one for both.
- [ ] **CV fixes:** Bilal's end date reads "Mar. 20206", and DevScrape has a copied gym bullet ("membership management, class scheduling…").
- [ ] **Concurrent roles:** four roles show "– Present" (HABTech, Go Gerami, ECP, Upwork). If any are part-time or contract, say so in `app/lib/seed-data.ts`.
- [ ] **Optional:** more testimonials (Bilal Community, ECP) and architecture diagrams per project.

**Phase 3 UX done (2026-10-18):**
- The scroll page is the default at every width. "Explore canvas" (≥1024px) is opt-in and remembered, with no flash on reload. The canvas has zoom in/out, recenter (also `+`, `−`, `0`), a "Back to page view" button and a usage hint.
- Every project has a real `/projects/[slug]` page (8 pre-rendered, with per-project titles and descriptions). Clicking a card opens it as a modal over the page (intercepting routes), keeps your scroll position, and has "Next project →". Shared links open the full page.
- A sticky header with section links that highlight as you scroll, a scroll-progress line, search, CV, "Explore canvas" and the theme toggle. Back-to-top button.
- A ⌘K / Ctrl+K command palette (sections, projects, copy email, CV, theme, layout, profiles), plus toast confirmations and a copy-email button.
- Sketch styling: rough.js card borders, handwritten (Caveat) headings with pencil underlines that draw in, a hover "scribble" fill, and a hand-drawn experience timeline.
- Skill chips show how many projects use each skill; clicking one filters Selected work. Skills with no project evidence stay as plain text.
- Geist font; a darker accent for text (WCAG AA); 12px minimum text outside the canvas; the global 0.8s colour transition is removed. All dialogs trap focus and return it to the opener.

**Phase 3 notes for you:**
- [ ] "Angular" is in your bio and skills, but no project on the site mentions it. Add it to AEBIS if you built the ADIN Angular client, or drop it.

**Phase 4 done (2026-10-18):**
- **SEO and sharing:** `metadataBase`, title template, canonical URLs, Open Graph and Twitter tags, generated sketch-style preview images (home plus one per project), `robots.txt`, `sitemap.xml` (9 URLs), and schema.org `Person` JSON-LD.
- **Images:** screenshots converted to WebP at a maximum width of 1920px, so `public/` went from about 7 MB to 1.9 MB (goGerami alone: 3.7 MB → 76 KB). Project images use `next/image` (responsive sizes, lazy loading, AVIF/WebP). Originals were moved to `assets/originals/`, which isn't deployed. The unused create-next-app SVGs and the `howler` dependency were removed.
- **Accessibility:** canvas keyboard focus pans to the focused card; every link has an accessible name; axe reports 0 serious or critical issues on the home page and a project page (desktop and mobile).
- **Repo:** new README with screenshots; a `typecheck` script; a Playwright smoke suite (`pnpm test:e2e`, 20 checks across desktop and mobile, including axe); GitHub Actions CI (lint → typecheck → build → smoke tests); a custom sketch-style 404 page.

**Before you deploy:**
- [ ] Commit the new untracked files, especially `public/resume.pdf` and the `public/*.webp` images, or the live site will be missing them.
- [ ] Set `NEXT_PUBLIC_SITE_URL` in Vercel if you use a custom domain. Otherwise it falls back to the Vercel production URL.
- [ ] Decide whether `assets/originals/` (about 13 MB of source screenshots) should be committed or added to `.gitignore`.
- [ ] Run Lighthouse in Chrome DevTools on the deployed site. It isn't installed locally, so I couldn't run it.
- [ ] After deploying, paste a project link into LinkedIn's Post Inspector to check the preview.
- [ ] Optional: `public/vendor.png`, `night.svg` and `sunny.svg` aren't used anywhere; delete them if you don't need them.

---

## 1. What a developer portfolio has to do (the yardstick)

A recruiter or client spends **30–90 seconds** on the first visit. In that time, the site has to answer:

1. **Who are you, and what do you build?** A one-line value proposition, visible without any interaction.
2. **Can I trust you?** Real shipped work, clear role and scope, honest numbers, testimonials, links.
3. **How good is the work?** 3–5 strong case studies covering the problem, your decisions, the result, screenshots and a link.
4. **What's your stack?** Skills tied to the projects that prove them.
5. **How do I reach you or hire you?** CV download, email, LinkedIn/GitHub, and a working contact form that actually notifies you.
6. **Is the site itself well engineered?** It's your code sample: fast, accessible, SEO-ready, shareable links, clean repo.

### Scorecard (current state)

| Quality | Score | Why |
|---|---|---|
| First impression / value prop | 2/5 | Hero says only "Full-stack developer"; most of the intro card is empty |
| Work showcase | 3/5 | Project modals are good (overview, challenge/solution, highlights), but you need 2 clicks to reach them, AEBIS shows the wrong image, and your strongest project (MedRoute) is missing |
| Credibility / proof | 2/5 | No CV (404), no testimonials, no numbers on projects; the unused metrics block contains unverifiable figures |
| Skills | 1/5 | No skills section is rendered anywhere (`SkillsList` is unused). The only "skills" shown are a decorative logo marquee that includes Flutter/Python, which no project uses |
| Contact | 3/5 | Email, phone and socials are visible (good), but the form is framed as "feedback" and only writes to MongoDB, so nobody is notified |
| Navigation / usability | 2/5 | You have to discover the canvas; the mouse wheel zooms instead of scrolling; there's no recenter or zoom control; cards get clipped at the edges |
| Mobile | 3/5 | The scroll layout is sensible and the modal works well, but the nav dots overlap your name, there's no skills section, and the hero is mostly empty |
| SEO / sharing | 1/5 | **The server HTML is empty**: no OG/Twitter tags, no robots.txt or sitemap, no structured data, and projects have no deep links |
| Accessibility | 2/5 | No landmarks, all 73 images have `alt=""`, modals have no focus trap, lots of 9–11px text |
| Performance | 2/5 | Project images are 2–3.8 MB PNGs served through raw `<img>`; 72 marquee icons load from a third-party CDN |
| Code quality (as a code sample) | 2/5 | `Canvas.tsx` is 1,292 lines with duplicated form and theme logic; dead code; boilerplate README; no CI or tests |

### What's working (keep it)

- **The concept is memorable.** The sketch/pencil canvas with rough.js borders is distinctive and shows real front-end skill.
- **The project modal is the best part of the site.** The hero image, overview, challenge→solution, highlights and links make a good case-study shape. Build on it.
- **Dark mode is well done**, including the circular view-transition reveal, and it respects `prefers-color-scheme` and reduced motion for the transition.
- **The project copy is detailed and concrete** (OTP flows, schema-per-tenant, Chapa subaccounts, and so on).
- **The mobile scroll fallback** has the right structure (hero → work → about → contact).

---

## 2. P0: fix these before you send the link to anyone

These are broken, misleading or invisible right now.

| # | Problem | Where | Fix |
|---|---|---|---|
| P0-1 | **Server-rendered HTML has no content.** `Canvas` returns an empty `<div>` until `mounted` is true, and picks the desktop or mobile layout in JS. Google, LinkedIn/Slack link previews and no-JS visitors see a blank page. The `<h1>` isn't in the HTML. | [Canvas.tsx:151-168](../app/components/Canvas.tsx#L151-L168) | Render the real content on the server. Choose the layout with CSS (`hidden md:block`) instead of `matchMedia` state, and keep `mounted` only for theme-dependent bits. |
| P0-2 | **CV link is a 404 and isn't shown anywhere.** `resumeUrl = "/resume.pdf"`, but the file isn't in `public/` and nothing renders it. | [seed-data.ts:315](../app/lib/seed-data.ts#L315) | Add `public/Joshua-Alemayehu-CV.pdf`, and put a "Download CV" button in the hero and the contact section. |
| P0-3 | **Placeholder copy is live:** "Project Alpha expands into Tech, Demo, Repo — then each can expand further." Those child nodes never appear, because clicking a project opens the modal. | [Canvas.tsx:643](../app/components/Canvas.tsx#L643), dead nodes `p1-tech`…`p6-repo` in [graph-data.ts](../app/lib/graph-data.ts) | Replace it with "6 shipped projects — click one for the case study". Delete the dead child nodes and the unused `skills`/`metrics` roots. |
| P0-4 | **Wrong images.** AEBIS uses `/gogerami.png`, the ECP Bot and ECP Web share `/ecp.png`, and the modal's `DEFAULT_IMAGE` falls back to goGerami. | [seed-data.ts:171](../app/lib/seed-data.ts#L171), [ProjectModal.tsx](../app/components/ProjectModal.tsx) | Give each project its own screenshot. For AEBIS, use an Angular UI screenshot (with anonymized data) or an architecture diagram. Remove the cross-project fallback and show a neutral placeholder instead. |
| P0-5 | **Claims that may not survive an interview.** The bio says "3+ years", but your commercial work starts Feb 2024 (about 2 years 8 months). `metricsOverview` (p95 < 150 ms, 99.8% uptime, 10K+ records) isn't rendered, but it's unmeasured, so don't ship it. | [graph-data.ts:651](../app/lib/graph-data.ts#L651), [seed-data.ts:293-313](../app/lib/seed-data.ts#L293-L313) | Use "4+ years shipping production systems". Replace the metrics with **countable facts** (§3.3). |
| P0-6 | **The contact form goes nowhere useful.** It's labelled "Send feedback" with the placeholder "Your feedback or comment…", it saves to MongoDB with no notification to you, it has no spam protection, and it reports errors with `alert()`. | [Canvas.tsx:441-543](../app/components/Canvas.tsx#L441-L543), [api/inquiry/route.ts](../app/api/inquiry/route.ts) | Rename it "Send me a message". Placeholder: "What are you working on?" In the route, also email yourself (you already use SendGrid in goGerami; Resend also works), add a hidden honeypot field, validate with length limits (zod), and rate-limit per IP. Show errors inline. |
| P0-7 | **Mobile: the section nav dots overlap your name** (390 px wide). | [Canvas.tsx:1087](../app/components/Canvas.tsx#L1087) | Hide the dots below `sm`, or switch to a sticky top bar. |
| P0-8 | **Tablet / small laptop (768–1100 px):** the Contact and Projects cards are clipped by the viewport edges, and the logo marquee sits on top of the Projects card text and the theme toggle. | [TechMarquee.tsx](../app/components/TechMarquee.tsx), `ROOT_CENTERS` in Canvas | Remove the marquee (§4.4), and fit the initial zoom to the viewport (`zoomToElement` or compute the scale from `clientWidth`). |
| P0-9 | **Layout-constant mismatch:** `CONTACT_H = 272` in Canvas, but `ROOT_SIZES.contact.h = 180` in canvas-layout, so the overlap resolver works from the wrong box. | [Canvas.tsx:41](../app/components/Canvas.tsx#L41), [canvas-layout.ts:58](../app/lib/canvas-layout.ts#L58) | Keep the sizes in one exported constant used by both files. |

---

## 3. Content improvements

### 3.1 Hero / intro: say what you do, for whom, and what to do next

The intro card is 580×320 and about 60% empty. Your photo only appears on hover, and it's a casual mirror selfie.

**Suggested hero copy** (edit to taste):

> **Joshua T. Alemayehu**
> Full-stack engineer — I build payment, healthcare and marketplace systems with **Spring Boot, React and PostgreSQL**.
> Shipped for clients in the US, Australia and Ethiopia · Addis Ababa (UTC+3) · Open to remote roles & freelance.
> **[View work]  [Download CV]  [Email me]**

- Put a **real headshot** in the hero (neutral background, good light, looking at the camera), and make it **visible by default** rather than hover-only. Keep the grayscale treatment if you like it.
- Add an **availability pill**, for example "● Available for remote work — Nov 2026". It's one of the highest-converting elements on a portfolio.

### 3.2 Projects: curate, reorder, add your strongest work

**Missing projects worth adding** (from your other repos):

| Project | Why it belongs |
|---|---|
| **MedRoute** (Upwork, US healthcare logistics) | Your strongest single proof: built solo, delivered on time, real-time STOMP map, driver GPS, RBAC, append-only chain-of-custody audit, SLA flags, Docker → Render/Neon, and a **"would hire again" client review**. Check your contract before naming the client; "US healthcare logistics client" is safe. |
| **AEBIS Angular client** | Your front-end-at-scale proof: Angular + Material, 11 feature areas, 300+ components, NgRx Signal Store, 390+ spec files. You could merge it into the AEBIS entry as "frontend + backend". |
| **Fund-ly AI service** | Your only LLM/agent proof: agent orchestrator, tools, RAG retriever, structured JSON output, multi-provider (OpenRouter/Ollama/Gemini), rate limiting. Add a highlight or a separate card. |
| **Gym management system** | A product with **5 paying clients** plus fingerprint hardware integration, which is a great "shipped to real customers" story. |
| PIMS (Rust/Tauri) | Optional "other projects" item; shows range. |

**Recommended order:** MedRoute → goGerami → AEBIS → Fund-ly → Bilal Community → (others: ECP Web, ECP Bot, Gym, PIMS as a compact "More projects" list). Feature 4–5 projects. Merge the two ECP entries into one "Ethio College Prep — website + Telegram registration bot" card.

**Upgrade each case study.** The modal already supports `metrics` and `gallery`, but no project fills them in.

- **Role & scope, precisely.** For example: "Sole backend developer; designed the payment abstraction; 2 frontend devs consumed my API." Recheck Fund-ly ("Backend Developer… I worked on"): if you built more of it, say so. If AEBIS is a team codebase, keep "contributed to" and name your modules.
- **Results / numbers** (`metrics` field), using things you can count:
  - goGerami: 560+ REST endpoints · 72 entities · 10 Prometheus alert rules → Slack · 2 currencies / 3 payment rails
  - AEBIS: 12 notification trigger events · multi-tenant · RabbitMQ outbox with rate limiting
  - ECP Bot: 80+ ambassador codes validated · N registrations processed (check the DB)
  - Gym: 5 client gyms in production
- **Key technical decision** (one paragraph). For example: "Two-phase payment capture so Stripe and Chapa share one order state machine", or "Transactional outbox instead of direct publish to avoid lost notifications." This is what senior reviewers look for.
- **Architecture diagram** (one simple image per major project).
- **2–4 screenshots** in `gallery`, compressed (§5.3).
- **Links:** live site, repo, or for private client code, "Code is private — happy to walk through it on a call."
- Give **"Live app" links** the production domain (gogerami.com rather than `go-zembil-frontend.vercel.app`) if it's live.

### 3.3 Proof and credibility

- **Testimonials section.** Start with the MedRoute Upwork review (short quote + name/title, with permission). Ask Bilal Community and ECP for one or two lines each.
- **Replace `metricsOverview`** with an honest "By the numbers" strip, for example: "5+ production systems · clients in 3 countries · 560+ endpoints shipped · 5 gyms running my software".
- **Certifications:** add the AZ-204 course. Word it accurately ("Completed AZ-204 Azure Developer course") unless you passed the Microsoft exam.
- **Education:** add your degree and university if you have one; recruiters filter on it.

### 3.4 Skills: make them evidence-based

Right now no skills section is visible. The list in `seed-data.ts` also **leaves out Java** (your main language), RabbitMQ, Liquibase, Stripe and Hibernate. Meanwhile it includes GraphQL, Prisma and "Accessibility", which no listed project demonstrates. The marquee shows Flutter and Python logos with no supporting project.

Suggested groups (only list what a project proves):
- **Backend:** Java, Spring Boot, Spring Security/OAuth2, Hibernate/JPA, Node.js/Express, REST, WebSocket/STOMP
- **Data & messaging:** PostgreSQL, Liquibase/Flyway, MongoDB, RabbitMQ (outbox), pgvector
- **Frontend:** React, Next.js, Angular (NgRx Signals), TypeScript, Tailwind
- **Payments & integrations:** Stripe, Chapa, Twilio, SendGrid, Cloudinary, Telegram Bot API
- **DevOps & quality:** Docker, GitHub Actions, Render/Neon, Vercel, Prometheus/Alertmanager, Testcontainers, Playwright, Jasmine/Karma
- **AI:** LLM agents, RAG, OpenAI-compatible APIs (Fund-ly)

Bonus: make each skill chip clickable so it filters or highlights the projects that use it.

### 3.5 About and Experience

- **Rewrite the bio in 3 short paragraphs:** what you do now, what you're good at (payments, multi-tenant systems, reliability), and what you're looking for. Mention the GDSC teaching experience as evidence of communication skills.
- **Add "Freelance — Upwork"** to Experience (MedRoute) so the timeline reflects your client work.
- **Write experience descriptions as achievements**, not duties. For example, "Built the RabbitMQ outbox dispatcher that sends SMS donor recalls to N donors…"
- Check the overlapping dates read sensibly (HABTech Feb 2025–present and Go Gerami Nov 2025–present in parallel). If one is contract or part-time, say so.

### 3.6 Contact and social

- **Remove Instagram** unless it's professional; replace it with a CV link or an Upwork profile.
- **Reconsider showing the phone number publicly** (spam and scraping). A **Calendly / Cal.com "Book a 20-min call"** button works better for international clients.
- Add a footer with: name · email · GitHub · LinkedIn · "Built with Next.js — source on GitHub" (links to the repo, since the site is a code sample).

### 3.7 Optional, high-leverage: technical writing

Two or three short posts on problems you actually solved show depth better than any skill list:
- "One order, two payment rails: Stripe + Chapa with a two-phase capture"
- "Reliable SMS notifications with a transactional outbox and RabbitMQ"
- "Schema-per-tenant PostgreSQL in Spring Boot"

You can host them as `/writing/[slug]` MDX pages.

---

## 4. UI/UX improvements

### 4.1 The core decision: canvas-first vs. content-first

**Problem:** content is hidden behind discovery. To see a single project, a visitor has to understand the canvas, click "Projects", wait for the pan, then click a card. The photo needs a hover. Clicking your name silently collapses everything. Many recruiters won't get that far.

**Recommendation: make content-first the default and offer the canvas as an opt-in mode.**
- The default at **all** widths becomes a polished single-page scroll layout. Upgrade the existing `CanvasScrollFallback` with a two-column desktop grid: hero → featured projects → testimonials → skills → experience → contact.
- Add a clear **"✏️ Explore as canvas"** toggle (top bar) that switches to the current canvas, remembered in `localStorage`. You keep the distinctive idea, and it now reads as a deliberate feature.
- Carry the sketch aesthetic into the scroll layout (rough.js borders on cards, hand-drawn dividers) so the site stays visually yours.

*If you'd rather keep the canvas as the default*, the minimum fixes are:
- Make the **project cards visible on load**. Projects should start expanded, or the intro card should show 3 featured project thumbnails.
- Add **zoom controls** (+ / − / recenter "⌂") and a short hint: "Drag to pan · Scroll to zoom · Click cards to open". Persist "hint dismissed".
- Add **fit-to-viewport** on load and on resize (fixes P0-8).
- **Clamp** `minScale` to about 0.6. At 0.4 the text is unreadable and visitors can pan into empty space and get lost (I reproduced this).
- Add a **persistent top nav** (Projects · About · Contact · CV) that pans to each node.
- Make the **intro card a real hero** (§3.1) instead of a hidden "reset" button. Use the recenter control for reset.
- **Canvas project cards:** add a thumbnail, a one-line tagline and 3 tags. They currently cut off mid-sentence ("checkout in USD or ETB,").

### 4.2 Deep links and navigation

- Give each project its own URL, `/projects/[slug]`, using Next.js **intercepting + parallel routes**. Opening a card shows the modal and updates the URL; a direct visit renders a full page. This gives you shareable links ("look at my MedRoute case study"), working back/forward buttons and per-project SEO.
- Add "Next project →" at the bottom of each case study.

### 4.3 Visual design and typography

- **Use one brand typeface.** Inter or Geist for body text, plus optionally a neat handwritten face (e.g. "Caveat") for section labels only, as your own `guideline.md` suggests. Load fonts with `next/font`. The site currently uses the system font stack.
- **Minimum text size of 12px**, with 14–16px for body copy. There are many `text-[9px]`, `text-[10px]` and `text-[11px]` uses (nav labels, tags, card body).
- **Contrast:** `--theme-pencil-light #9a9a9a` on white (about 2.8:1) is used for placeholders, icons and nav labels and fails WCAG AA. Use it only for lines and borders, and use at least `#6b6b6b` for text.
- **Accent colour:** the sage `#7d9a8a` works, but it's weak as a button colour on white. Use a deeper variant for CTAs, and keep the light one for fills and glows.
- **One consistent theme-toggle position:** it's top-right on desktop and top-left on mobile.
- **Remove the global `* { transition: … 0.8s }`** rule. It makes every hover feel sluggish. Scope theme transitions to `html`/`body`/cards.

### 4.4 Remove or rework the tech-logo marquee

It's decorative and moving, it overlaps content and the toggle, it fetches 72 images from `cdn.simpleicons.org` (a third-party dependency on every page view), and it advertises skills you can't back up. Replace it with the static, evidence-based Skills section (§3.4).

### 4.5 Forms and feedback

- Add a visible `<label>` for each field (the mobile form uses placeholders only), plus inline validation messages and `aria-live` success and error messages.
- Don't auto-close the form 1.8s after success. Show a persistent "Thanks — I'll reply within 24h" state.
- Use `<form onSubmit>` so Enter works and the browser can autofill.

### 4.6 Motion

- Respect `prefers-reduced-motion` for the canvas pans, the card scale-ins and the floating animations. Only the theme toggle and `SkillsList` check it today.
- Mobile `ScrollReveal` starts content at `opacity: 0`. If JS is slow or the IntersectionObserver doesn't fire (in print, in screenshot tools, for some crawlers), the content stays invisible. Start visible and animate only when JS has loaded, or use CSS `@starting-style`.

---

## 5. Technical quality (the site is also your code sample)

### 5.1 SEO and sharing
- Fix the server rendering (P0-1); nothing else matters until that's done.
- Set `metadataBase`, `openGraph` and `twitter` in [layout.tsx](../app/layout.tsx), and add `app/opengraph-image.tsx` (a generated card with your name, title and sketch frame). Today, sharing the link on LinkedIn shows no preview.
- Add `app/robots.ts`, `app/sitemap.ts`, a canonical URL, and JSON-LD `Person` schema (name, jobTitle, sameAs: GitHub/LinkedIn).
- Use a custom domain if you don't already have one.

### 5.2 Accessibility
- Add landmarks: `<header>`, `<nav>`, `<main>`, `<footer>`. There are currently none.
- Add meaningful `alt` text to project images. All 73 images currently have `alt=""`.
- **Modals** (Project, Experience, Bio): move focus into the dialog on open, trap Tab inside it, and restore focus to the triggering card on close. Native `<dialog>` with `showModal()` does all of this for you.
- Make sure keyboard focus pans the canvas to the focused card. Today, Tab can land on cards that are off-screen.
- Run axe DevTools and fix anything it reports.

### 5.3 Performance
- **Images:** `gogerami.png` is 3456×1994 and 3.8 MB; bilal/ecp are about 2.5 MB each. Export WebP/AVIF at about 1600 px wide (target under 200 KB) and use `next/image` with `sizes`, which also lets Next lazy-load and resize them.
- Remove unused dependencies and code: `howler` (never imported), `SkillsList` (unused), `ProjectCard`, `SketchDivider`, `metricsOverview`, the dead graph nodes, and `public/{next,vercel,file,globe,window}.svg` (create-next-app leftovers).
- Use framer-motion's `LazyMotion` + `m` components to cut its bundle.
- Target Lighthouse (mobile) of 90 or more for Performance, Accessibility, Best Practices and SEO, and put the scores in the README.

### 5.4 Code structure
- Split [Canvas.tsx](../app/components/Canvas.tsx) (1,292 lines) into `layouts/ScrollLayout.tsx`, `layouts/CanvasLayout.tsx`, `components/ContactForm.tsx` (the form is currently duplicated twice), `hooks/useTheme.ts`, and `canvas/CanvasControls.tsx`.
- **Theme logic is in three places** (the inline script in layout, the Canvas effect, and the TechMarquee MutationObserver). Replace them with one provider; `next-themes` does exactly this.
- Keep all content in `seed-data.ts` (or MDX per project), and derive the graph from it instead of hand-writing node IDs.
- Validate the API body with zod. Add a honeypot field and a rate limit, and cap field lengths.

### 5.5 Repo hygiene
- **Rewrite the README** (it's still the create-next-app boilerplate). Include a screenshot/GIF, the live URL, the stack, the design idea (the canvas concept from `guideline.md`), how to run it, Lighthouse scores, and the env vars.
- Add a **GitHub Actions** workflow that runs `pnpm lint`, `tsc --noEmit` and `next build` on each PR.
- Add a **Playwright smoke test** (you already use Playwright in Fund-ly). It should check that the home page renders the `h1` server-side, a project modal opens, the contact form submits (with the API mocked), and there's no horizontal scroll at 390 px.
- Pin your strongest repos on your GitHub profile, and add READMEs to them. Most client code is private, so a reviewer who clicks GitHub needs something to see.

---

## 6. Roadmap (suggested order)

| Phase | Effort | Items |
|---|---|---|
| **1 — Stop the bleeding** | ~1 day | P0-1 through P0-9: SSR content, CV, placeholder copy, images, honest claims, a contact form that notifies you, mobile nav overlap, tablet clipping, constant mismatch |
| **2 — Content** | 2–3 days | New hero copy and headshot; add MedRoute and Gym; reorder and curate projects; metrics, decisions, diagrams and galleries per project; testimonials; skills rewrite; Experience with Upwork; drop Instagram |
| **3 — UX structure** | 3–5 days | Content-first scroll layout at all widths, plus an "Explore as canvas" toggle with controls, fit-to-viewport and top nav; `/projects/[slug]` deep links; typography and contrast; remove the marquee |
| **4 — Polish & engineering** | 2–3 days | OG image, robots, sitemap, JSON-LD; a11y (landmarks, alt text, dialog focus); image optimization; dead-code removal; Canvas split; next-themes; README; CI; Playwright smoke test |
| **5 — Ongoing** | — | 2–3 technical posts; refresh projects every quarter; check the analytics you already have (Vercel Analytics) for which projects get opened |

**Critical files:** [app/components/Canvas.tsx](../app/components/Canvas.tsx), [app/lib/seed-data.ts](../app/lib/seed-data.ts), [app/lib/graph-data.ts](../app/lib/graph-data.ts), [app/lib/canvas-layout.ts](../app/lib/canvas-layout.ts), [app/components/ProjectModal.tsx](../app/components/ProjectModal.tsx), [app/components/TechMarquee.tsx](../app/components/TechMarquee.tsx), [app/layout.tsx](../app/layout.tsx), [app/globals.css](../app/globals.css), [app/api/inquiry/route.ts](../app/api/inquiry/route.ts), `public/`.

**Reuse what exists:** `ProjectModal` (already supports `metrics` and `gallery`), the `CanvasScrollFallback` structure as the base of the new default layout, `SketchBorder`/`SketchCard` for the sketch look, `SkillsList` (restyle and render it), and the `getMongoClient` helper in [mongodb.ts](../app/lib/mongodb.ts).

---

## 7. Verification checklist (after each phase)

- [ ] `curl -s https://<site>/ | grep '<h1'` shows your name, and project titles appear in the raw HTML.
- [ ] Paste the URL into LinkedIn's Post Inspector or opengraph.xyz and check that the preview shows your OG image and title.
- [ ] `/resume.pdf` (or the new CV path), `/robots.txt` and `/sitemap.xml` return 200.
- [ ] Submit the contact form and confirm you receive the email; a submission with the honeypot field filled is rejected.
- [ ] Lighthouse mobile scores 90 or more in all four categories, and axe reports 0 critical issues.
- [ ] Keyboard only: you can reach every project, open and close the modal, focus returns to the card, and the form submits.
- [ ] Check 390 px, 768 px, 1024 px and 1440 px in light and dark mode for clipping, overlap and horizontal scroll.
- [ ] Every number on the site is something you can explain and back up in an interview.
- [ ] The Playwright smoke test and CI pass on a PR.
