import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const config = JSON.parse(await readFile("site.config.json", "utf8"));
const base = config.siteUrl;
const results = [];
const failures = [];
await mkdir("qa-report", { recursive: true });

async function check(name, action) {
  try {
    await action();
    results.push({ name, passed: true });
    console.log("PASS " + name);
  } catch (error) {
    const message = String(error?.stack || error);
    failures.push({ name, message });
    results.push({ name, passed: false, message });
    console.error("FAIL " + name + "\n" + message);
  }
}
async function noOverflow(page) {
  const size = await page.evaluate(() => ({
    viewport: innerWidth,
    document: document.documentElement.scrollWidth,
    offenders: [...document.querySelectorAll("main *")].filter(el => {
      const r = el.getBoundingClientRect();
      const css = getComputedStyle(el);
      return r.width && css.position !== "absolute" && r.right > innerWidth + 1 &&
        !el.closest(".process-control");
    }).slice(0, 8).map(el => el.tagName + "." + el.className)
  }));
  expect(size.document, JSON.stringify(size)).toBeLessThanOrEqual(size.viewport + 1);
}
async function accessibility(page) {
  const report = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  const issues = report.violations.map(v => ({
    id: v.id, impact: v.impact,
    nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary }))
  }));
  expect(issues, JSON.stringify(issues, null, 2)).toEqual([]);
}
async function interactions(page, mobile) {
  if (mobile) {
    const toggle = page.getByRole("button", { name: "Открыть меню" });
    await toggle.click();
    const menu = page.locator("#mobile-navigation");
    await expect(menu).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await check("mobile dialog accessibility", () => accessibility(page));
    await page.keyboard.press("Escape");
    await expect(menu).not.toBeVisible();
    await expect(toggle).toBeFocused();
    await toggle.click();
    await menu.getByRole("link", { name: /Практики/ }).click();
    await expect(menu).not.toBeVisible();
    await expect(page).toHaveURL(/#practices$/);
    await expect(page.locator("#practices")).toBeFocused();
  } else {
    await page.keyboard.press("Tab");
    await expect(page.locator(".skip-link")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
    await page.locator(".desktop-nav").getByRole("link", { name: "Практики" }).click();
    await expect(page).toHaveURL(/#practices$/);
  }
  const row = page.locator(".practice-row").first();
  const title = await row.locator(".practice-name").textContent();
  await row.click();
  const modal = page.locator(".modal[open]");
  await expect(modal.getByRole("heading", { level: 2 })).toHaveText(title);
  await check("practice dialog accessibility", () => accessibility(page));
  await page.keyboard.press("Escape");
  await expect(page.locator(".modal[open]")).toHaveCount(0);
  await expect(row).toBeFocused();
  await row.click();
  await modal.getByRole("button", { name: "Обсудить эту задачу" }).click();
  await expect(page.locator(".modal[open]")).toHaveCount(0);
  await expect(page.locator('input[name="name"]')).toBeFocused();
  expect(await page.locator('select[name="service"] option:checked').textContent()).toBe(title);

  const tabs = page.getByRole("tab");
  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(page.locator("#step-panel-1")).toBeVisible();
  await page.keyboard.press("End");
  await expect(tabs.last()).toBeFocused();
  await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Home");
  await expect(tabs.first()).toBeFocused();

  const summaries = page.locator(".faq summary");
  await summaries.first().click();
  await expect(page.locator(".faq details").first()).toHaveAttribute("open", "");
  await summaries.nth(1).click();
  await expect(page.locator(".faq details").nth(1)).toHaveAttribute("open", "");
  await expect(page.locator(".faq details").first()).not.toHaveAttribute("open", "");
  await summaries.nth(1).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".faq details").nth(1)).not.toHaveAttribute("open", "");

  const form = page.getByRole("form", { name: "Форма обращения" });
  const submit = form.getByRole("button", { name: "Проверить обращение" });
  await submit.click();
  await expect(form.locator('input[name="name"]')).toHaveAttribute("aria-invalid", "true");
  await expect(form.locator('input[name="email"]')).toHaveAttribute("aria-invalid", "true");
  await expect(form.locator('textarea')).toHaveAttribute("aria-invalid", "true");
  await expect(form.locator('input[name="consent"]')).toHaveAttribute("aria-invalid", "true");
  await form.locator('input[name="name"]').fill("Тестовый посетитель");
  await form.locator('input[name="email"]').fill("demo@example.com");
  await form.locator('textarea').fill("Тест интерфейса: обсуждение условий демонстрационного договора.");
  await form.locator('input[name="consent"]').check();
  await form.getByRole("radio", { name: "По телефону" }).check();
  await submit.click();
  await expect(form.locator('input[name="phone"]')).toHaveAttribute("aria-invalid", "true");
  await form.getByRole("radio", { name: "По email" }).check();
  await submit.click();
  await expect(submit).toBeDisabled();
  await expect(form.locator(".form-status")).toContainText("Демо-проверка завершена.");
  await expect(form.locator(".form-status")).toContainText("Данные никуда не отправлены");
  await expect(submit).toBeEnabled();
  await expect(form.locator(".form-status")).toBeFocused();

  await page.getByRole("button", { name: "Забронировать консультацию" }).click();
  await expect(page.locator(".modal[open]")).toContainText("Бронирование пока не активно.");
  await expect(page.locator(".modal[open] a[href*='stripe.com']")).toHaveCount(0);
  await page.locator(".modal[open]").getByRole("button", { name: "Перейти к форме обращения" }).click();
  await expect(page.locator('input[name="name"]')).toBeFocused();
  await noOverflow(page);
}

const layouts = [
  { name: "desktop-1440", engine: chromium, viewport: { width: 1440, height: 960 }, interact: true },
  { name: "wide-1920", engine: chromium, viewport: { width: 1920, height: 1080 } },
  { name: "tablet-768", engine: chromium, viewport: { width: 768, height: 1024 } },
  { name: "android-390", engine: chromium, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, interact: true },
  { name: "small-320", engine: chromium, viewport: { width: 320, height: 780 }, isMobile: true, hasTouch: true },
  { name: "iphone-webkit", engine: webkit, ...devices["iPhone 13"], interact: true }
];

for (const layout of layouts) {
  const browser = await layout.engine.launch();
  const { name, engine, interact, defaultBrowserType, ...options } = layout;
  const context = await browser.newContext({ ...options, locale: "ru-RU", reducedMotion: "reduce" });
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  const errors = [];
  const posts = [];
  page.on("pageerror", error => errors.push(String(error)));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  page.on("request", request => { if (request.method() === "POST") posts.push(request.url()); });
  page.on("response", response => {
    if (response.status() >= 400) errors.push(response.status() + " " + response.url());
  });

  await check(name + " render, images, reflow, reduced motion", async () => {
    const response = await page.goto(base, { waitUntil: "networkidle", timeout: 30000 });
    expect(response.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Право на");
    await page.evaluate(() => document.fonts.ready);
    for (const selector of ["#about", "#approach", "#consultation", ".footer"]) {
      await page.locator(selector).scrollIntoViewIfNeeded();
    }
    await page.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth > 0));
    await noOverflow(page);
    const motion = await page.evaluate(() => ({
      scroll: getComputedStyle(document.documentElement).scrollBehavior,
      animation: getComputedStyle(document.querySelector("h1 em")).animationName
    }));
    expect(motion).toEqual({ scroll: "auto", animation: "none" });
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: "qa-report/" + name + ".png", fullPage: true, scale: "css" });
    if (["desktop-1440", "android-390"].includes(name)) {
      const preview = (await page.screenshot({ type: "jpeg", quality: 65, scale: "css" })).toString("base64");
      for (let offset = 0; offset < preview.length; offset += 16000) {
        console.log("QA_PREVIEW:" + name + ":" + preview.slice(offset, offset + 16000));
      }
    }
    await check(name + " WCAG A/AA automatic audit", () => accessibility(page));
  });
  if (interact) {
    await check(name + " navigation, dialogs, tabs, FAQ, form, checkout", async () => {
      await page.goto(base, { waitUntil: "networkidle" });
      await interactions(page, !!options.isMobile);
    });
  }
  await check(name + " browser console and no demo transmissions", async () => {
    expect(errors).toEqual([]);
    expect(posts).toEqual([]);
    expect(await context.cookies()).toEqual([]);
  });
  await check(name + " direct privacy route and refresh", async () => {
    const response = await page.goto(new URL("privacy/", base).href);
    expect(response.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect((await page.reload()).status()).toBe(200);
    await noOverflow(page);
  });
  await context.close();
  await browser.close();
}

await check("scroll reveals and motion preference changes", async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, reducedMotion: "no-preference" });
    await page.goto(base, { waitUntil: "networkidle" });
    const reveal = page.locator("#about h2");
    await reveal.scrollIntoViewIfNeeded();
    await expect(reveal).toHaveClass(/is-visible/);
    await expect(reveal).toHaveCSS("opacity", "1");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
    const invisible = await page.locator("[data-reveal]").evaluateAll(elements =>
      elements.filter(el => getComputedStyle(el).opacity !== "1").length);
    expect(invisible).toBe(0);
  } finally {
    await browser.close();
  }
});

await writeFile("qa-report/results.json", JSON.stringify({ url: base, results, failures }, null, 2));
console.log("Browser QA: " + (results.length - failures.length) + "/" + results.length + " checks passed.");
if (failures.length) process.exitCode = 1;
