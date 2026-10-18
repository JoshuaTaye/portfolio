import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("server-rendered content", () => {
  test("home page HTML contains the name, sections and project links", async ({ request }) => {
    const html = await (await request.get("/")).text();
    expect(html).toMatch(/<h1[^>]*>(?:<[^>]+>)*[^<]*Joshua T\. Alemayehu/);
    for (const id of ["m-projects", "m-about", "m-experience", "m-contact"]) expect(html).toContain(`id="${id}"`);
    expect(html).toContain('href="/projects/medroute"');
    expect(html).toContain('"@type":"Person"');
  });

  test("SEO files and preview images are served", async ({ request }) => {
    expect((await request.get("/robots.txt")).ok()).toBe(true);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/projects/aebis");
    const og = await request.get("/opengraph-image");
    expect(og.headers()["content-type"]).toContain("image/png");
    expect((await request.get("/projects/medroute/opengraph-image")).ok()).toBe(true);
  });

  test("unknown project returns 404", async ({ request }) => {
    expect((await request.get("/projects/does-not-exist")).status()).toBe(404);
  });
});

test.describe("home page", () => {
  test("no horizontal scroll", async ({ page }) => {
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("project card opens the case study as a modal and Escape closes it", async ({ page }) => {
    await page.goto("/");
    await page.locator('a[href="/projects/medroute"]').first().click();
    await expect(page).toHaveURL(/\/projects\/medroute$/);
    await expect(page.getByRole("dialog").locator("#project-modal-title")).toHaveText("MedRoute");
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("project page renders on a direct visit", async ({ page }) => {
    await page.goto("/projects/aebis");
    await expect(page.locator("#project-page-title")).toHaveText("AEBIS");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("command palette jumps to a project", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Search and quick actions" }).click();
    await page.getByRole("combobox").fill("fund");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/projects\/fundly$/);
  });

  test("contact form validates and submits", async ({ page }) => {
    // Never hit the real API (it writes to MongoDB and sends email).
    await page.route("**/api/inquiry", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) })
    );
    await page.goto("/#m-contact");
    const form = page.locator("#m-contact form");
    await form.getByRole("button", { name: "Send message" }).click();
    await expect(form.getByText("Please fill in your name, email, and message.")).toBeVisible();
    await form.getByLabel("Name").fill("Test Visitor");
    await form.getByLabel("Email").fill("visitor@example.com");
    await form.getByLabel("Message").fill("Hello from the smoke test.");
    await form.getByRole("button", { name: "Send message" }).click();
    await expect(form.getByText(/your message is on its way/)).toBeVisible();
  });
});

test.describe("accessibility", () => {
  // Reduced motion makes reveal/fade transitions instant, so axe measures final colours.
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  for (const path of ["/", "/projects/medroute"]) {
    test(`no serious axe violations on ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await page.evaluate(() => document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible")));
      await page.waitForTimeout(300);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious.map((v) => `${v.id}: ${v.nodes.length} node(s) — ${v.help}`)).toEqual([]);
    });
  }
});
