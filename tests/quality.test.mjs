import test from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile, mkdir, readdir, access } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";
await mkdir("tests/.compiled", { recursive: true });
for (const name of ["validation", "send-inquiry"]) {
  const source = await readFile(`src/utils/${name}.ts`, "utf8");
  const js = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  await writeFile(`tests/.compiled/${name}.mjs`, js);
}
const { inquirySchema, formEndpoint, paymentLink } =
  await import("./.compiled/validation.mjs");
const { sendInquiry } = await import("./.compiled/send-inquiry.mjs");
const valid = {
  name: "Тестовый посетитель",
  phone: "",
  email: "qa@example.com",
  service: "corporate",
  message: "Тестовое обращение для проверки формы.",
  preferred: "email",
  consent: true,
  website: "",
};
test("inquiry accepts email-only contact and trims whitespace", () => {
  const v = inquirySchema.parse({ ...valid, name: "  Анна  " });
  assert.equal(v.name, "Анна");
});
test("inquiry requires the preferred contact channel and valid phone", () => {
  assert.equal(inquirySchema.safeParse({ ...valid, email: "" }).success, false);
  assert.equal(
    inquirySchema.safeParse({ ...valid, preferred: "phone" }).success,
    false,
  );
  assert.equal(
    inquirySchema.safeParse({
      ...valid,
      preferred: "phone",
      phone: "+44 20 7946 0000",
      email: "",
    }).success,
    true,
  );
  assert.equal(
    inquirySchema.safeParse({ ...valid, phone: "телефон1234567" }).success,
    false,
  );
});
test("inquiry rejects missing consent, malformed email, short and excessive descriptions", () => {
  for (const bad of [
    { consent: false },
    { email: "wrong@" },
    { message: "мало" },
    { message: "a".repeat(2001) },
    { service: "invalid" },
  ])
    assert.equal(inquirySchema.safeParse({ ...valid, ...bad }).success, false);
});
test("only HTTPS form endpoints and live hosted Stripe payment links are accepted", () => {
  assert.equal(formEndpoint(""), null);
  assert.equal(formEndpoint("http://example.com"), null);
  assert.equal(formEndpoint("https://user:pass@example.com/"), null);
  assert.equal(formEndpoint("javascript:alert(1)"), null);
  assert.equal(
    formEndpoint("https://formspree.io/f/example"),
    "https://formspree.io/f/example",
  );
  assert.equal(
    paymentLink("https://buy.stripe.com/a1B2c3"),
    "https://buy.stripe.com/a1B2c3",
  );
  for (const url of [
    "https://buy.stripe.com.evil.example/a",
    "https://buy.stripe.com/test_a",
    "http://buy.stripe.com/a",
    "javascript:alert(1)",
    "",
  ])
    assert.equal(paymentLink(url), null);
});
test("submission uses JSON, no cookies or referrer, and never posts honeypot data", async () => {
  let captured;
  await sendInquiry(
    valid,
    "https://formspree.io/f/example",
    new AbortController().signal,
    async (url, options) => {
      captured = { url, options };
      return new Response("{}", { status: 200 });
    },
  );
  assert.equal(captured.options.credentials, "omit");
  assert.equal(captured.options.referrerPolicy, "no-referrer");
  const body = JSON.parse(captured.options.body);
  assert.equal(body.email, valid.email);
  assert.equal(body.website, undefined);
  assert.equal(body.privacyVersion, "2026-09-10");
  assert.ok(body.submissionId);
});
test("server rejection, rate limiting and network failure never become a success", async () => {
  for (const status of [400, 429, 500])
    await assert.rejects(
      sendInquiry(
        valid,
        "https://formspree.io/f/example",
        new AbortController().signal,
        async () => new Response("", { status }),
      ),
    );
  await assert.rejects(
    sendInquiry(
      valid,
      "https://formspree.io/f/example",
      new AbortController().signal,
      async () => {
        throw new TypeError("network");
      },
    ),
  );
});
test("aborted request reaches the transport and reports cancellation", async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    sendInquiry(
      valid,
      "https://formspree.io/f/example",
      controller.signal,
      async (_, options) => {
        options.signal.throwIfAborted();
        return new Response("{}");
      },
    ),
    { name: "AbortError" },
  );
});
const config = JSON.parse(await readFile("site.config.json", "utf8"));
const base = new URL(config.siteUrl).pathname;
const home = await readFile("dist/index.html", "utf8");
test("home is pre-rendered, semantic and honest about demonstration data", () => {
  assert.equal((home.match(/<h1[ >]/g) || []).length, 1);
  assert.match(home, /Право на/);
  assert.match(home, /ДЕМОНСТРАЦИОННЫЙ ПРОФИЛЬ/);
  assert.match(home, /<main/);
  assert.match(home, /lang="ru"/);
  assert.ok(!home.includes("APP_HTML"));
  const schema = JSON.parse(
    home.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1],
  );
  assert.equal(
    schema["@type"],
    config.demo
      ? "WebSite"
      : config.company.verified
        ? "LegalService"
        : "WebSite",
  );
  assert.ok(!JSON.stringify(schema).includes("aggregateRating"));
});
test("home anchor links point to existing IDs", () => {
  const ids = new Set([...home.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of home.matchAll(/href="#([^"]+)"/g))
    assert.ok(ids.has(m[1]), `Missing #${m[1]}`);
});
test("every static page has working local assets, legal links and metadata at Pages base path", async () => {
  for (const route of [
    "",
    "privacy/",
    "cookies/",
    "legal/",
    "terms/",
    "payment-return/",
  ]) {
    const html = await readFile(`dist/${route}index.html`, "utf8");
    assert.ok(
      html.includes(
        `rel="canonical" href="${new URL(route, config.siteUrl).href}"`,
      ),
      route,
    );
    for (const field of [
      "og:title",
      "og:description",
      "og:image",
      "twitter:card",
    ])
      assert.ok(html.includes(field), `${route} ${field}`);
    for (const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
      const url = m[1];
      if (!url.startsWith(base)) continue;
      const relative = url.slice(base.length).split("#")[0];
      assert.ok(!relative.includes("../"));
      await access(
        path.join(
          "dist",
          relative.endsWith("/") || !relative
            ? relative + "index.html"
            : relative,
        ),
      );
    }
    if (route && route !== "payment-return/")
      assert.match(html, /требуется проверка специалистом/);
  }
});
test("build keeps production JS under 130 KB gzipped and image sizes reasonable", async () => {
  const { gzipSync } = await import("node:zlib");
  let size = 0;
  for (const f of await readdir("dist/assets"))
    if (f.endsWith(".js"))
      size += gzipSync(await readFile(`dist/assets/${f}`)).length;
  assert.ok(size < 130000, `${size} gzip bytes`);
  for (const f of await readdir("dist/images"))
    assert.ok((await readFile(`dist/images/${f}`)).length < 250000);
});
test("privacy: no tracking code, no persistent storage or secrets in production config", async () => {
  if (!config.demo && config.form.endpoint)
    assert.ok(formEndpoint(config.form.endpoint));
  if (!config.demo && config.consultation.paymentUrl)
    assert.ok(paymentLink(config.consultation.paymentUrl));
  for (const f of await readdir("dist/assets"))
    if (f.endsWith(".js")) {
      const s = await readFile(`dist/assets/${f}`, "utf8");
      for (const marker of [
        "localStorage.setItem",
        "sessionStorage.setItem",
        "googletagmanager",
        "google-analytics",
        "sk_live_",
        "sk_test_",
        "ghp_",
      ])
        assert.ok(!s.includes(marker), marker);
    }
});
