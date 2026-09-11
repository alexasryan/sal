import { readFile, writeFile, mkdir, readdir, rm } from "node:fs/promises";
import { render } from "../.prerender/entry-server.js";
const config = JSON.parse(await readFile("site.config.json", "utf8"));
const origin = new URL(config.siteUrl);
if (origin.protocol !== "https:" || !origin.pathname.endsWith("/"))
  throw new Error("siteUrl must be an HTTPS URL ending in /.");
const base = origin.pathname;
const esc = (v) =>
  String(v).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const json = (v) => JSON.stringify(v).replace(/</g, "\\u003c");
const description =
  "Юридический консалтинг для бизнеса и частных клиентов. Корпоративное право, сделки, разрешение споров. Демонстрационная концепция SĀL Legal.";
const schema =
  config.demo || !config.company.verified
    ? {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "SĀL Legal — демонстрационная концепция",
        url: origin.href,
        inLanguage: "ru",
      }
    : {
        "@context": "https://schema.org",
        "@type": "LegalService",
        name: config.company.name,
        url: origin.href,
        email: config.company.email,
        telephone: config.company.phone,
        address: config.company.address,
      };
const meta = (
  title,
  desc,
  path = "",
) => `<link rel="canonical" href="${esc(new URL(path, origin).href)}" />
<meta property="og:type" content="website" /><meta property="og:locale" content="ru_RU" /><meta property="og:site_name" content="SĀL Legal" /><meta property="og:title" content="${esc(title)}" /><meta property="og:description" content="${esc(desc)}" /><meta property="og:url" content="${esc(new URL(path, origin).href)}" /><meta property="og:image" content="${esc(new URL("images/staircase-1200.webp", origin).href)}" /><meta property="og:image:width" content="1200" /><meta property="og:image:height" content="800" /><meta property="og:image:alt" content="Архитектурная лестница из светлого камня — SĀL Legal" />
<meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="${esc(title)}" /><meta name="twitter:description" content="${esc(desc)}" /><meta name="twitter:image" content="${esc(new URL("images/staircase-1200.webp", origin).href)}" />`;
let html = await readFile("dist/index.html", "utf8");
html = html
  .replace("<!-- APP_HTML -->", render())
  .replace(
    "<!-- SEO_METADATA -->",
    meta("SĀL Legal — Право на уверенность", description) +
      `<script type="application/ld+json">${json(schema)}</script>`,
  );
if (!html.includes("<h1")) throw new Error("Prerender failed: no H1 in HTML");
const assets = await readdir("dist/assets");
const font = assets.find(
  (f) =>
    f.startsWith("cormorant-garamond-cyrillic-400-normal") &&
    f.endsWith(".woff2"),
);
if (font)
  html = html.replace(
    "</head>",
    `<link rel="preload" href="${base}assets/${font}" as="font" type="font/woff2" crossorigin />\n</head>`,
  );
await writeFile("dist/index.html", html);
const stylesheet = /href="([^"]+\.css)"/.exec(html)?.[1];
if (!stylesheet) throw new Error("No stylesheet generated");
const notice =
  '<aside class="legal-alert"><strong>Шаблон · требуется проверка специалистом.</strong><p>Этот текст описывает демонстрационный сайт и не подтверждает соответствие законодательству. До использования для реальной компании необходимо заполнить реквизиты, определить применимую юрисдикцию и проверить текст с квалифицированным специалистом.</p></aside>';
const nav = `<nav class="legal-links" aria-label="Правовая информация"><a href="${base}privacy/">Конфиденциальность</a><a href="${base}cookies/">Cookies</a><a href="${base}legal/">Правовая информация</a><a href="${base}terms/">Условия</a></nav>`;
const pages = {
  privacy: {
    title: "Политика конфиденциальности",
    subtitle: "О данных и внимании к личному.",
    content: `${notice}
<h2>1. Кто отвечает за обработку</h2><p>Оператор: ${esc(config.company.registration)}. Адрес: ${esc(config.company.address)}. Контакт по вопросам данных: ${esc(config.company.email)}. Эти реквизиты являются заменяемыми полями, а не сведениями о подтвержденном операторе.</p>
<h2>2. Что происходит в демонстрации</h2><p>При включенном демо-режиме форма проверяет введенные данные только в памяти открытой страницы и не отправляет их компании или форм-сервису. Не используйте реальные персональные данные. При закрытии страницы значения формы не сохраняются приложением. Браузер может самостоятельно предлагать автозаполнение.</p>
<h2>3. Обработка после подключения формы</h2><p>Форма предусматривает имя, телефон и/или email, выбранную услугу, описание задачи, способ связи, отметку ознакомления с политикой, версию политики и технический идентификатор обращения. Цель — рассмотреть запрос и ответить. Нельзя отправлять платежные реквизиты, документы дела, паспортные данные, специальные категории данных и сведения о третьих лицах через эту форму.</p><p>До включения отправки необходимо указать правовое основание, реального оператора и получателей, сроки хранения, условия трансграничной передачи, способ отзыва согласия и применимые права пользователей. Срок хранения: [указать срок и критерии]. Основание обработки: [определить для вашей юрисдикции и цели].</p>
<h2>4. Технические сервисы</h2><p>Хостинг GitHub Pages обрабатывает технические запросы посетителей в рамках собственной инфраструктуры. Сайт самостоятельно не устанавливает аналитические или рекламные трекеры. Шрифты и изображения размещены вместе с сайтом.</p><p>Подготовлена интеграция с Formspree либо согласованным HTTPS-сервисом обращений; фактический обработчик определяется настройкой владельца. До активации здесь нужно указать выбранного провайдера и его условия обработки. При переходе к оплате пользователь окажется на отдельной странице Stripe; применение этой интеграции требует подходящего подтвержденного аккаунта продавца. Номера карт на сайте не запрашиваются.</p>
<h2>5. Ваши обращения</h2><p>Для вопросов об обработке данных и реализации применимых прав используйте подтвержденный контакт оператора, который должен заменить демонстрационный email. Порядок запроса, идентификации и ответа, а также компетентный надзорный орган следует определить после выбора юрисдикции.</p>
<h2>6. Безопасность и изменения</h2><p>Данные формы не сохраняются в localStorage или sessionStorage. После активации отправка выполняется по HTTPS. HTTPS сам по себе не создает адвокатскую тайну или отношения консультирования. Способ обмена документами согласовывается отдельно. При изменении обработки владелец обязан обновить этот текст и дату версии.</p>`,
  },
  cookies: {
    title: "Cookies и технические данные",
    subtitle: "Минимум вмешательства.",
    content: `${notice}<h2>Текущая конфигурация</h2><p>Код сайта не устанавливает cookies, не использует localStorage или sessionStorage, не подключает аналитику, рекламные пиксели, сторонние шрифтовые CDN и встроенные карты. Поэтому баннер согласия на необязательные cookies не добавлен.</p><h2>Хостинг и внешние сервисы</h2><p>GitHub Pages может обрабатывать технические сведения о запросах по своим правилам. После перехода на отдельную страницу платежного провайдера действуют его правила. Если владелец подключит CAPTCHA, аналитику, видео, карты или другие внешние модули, состав технологий и необходимость согласия нужно оценить заново.</p><h2>Дальнейшая настройка</h2><p>До добавления необязательных технологий укажите их название, цель, поставщика и срок действия; при необходимости реализуйте выбор согласия и возможность его изменить. Этот шаблон не является заключением об обязательности баннера для конкретной юрисдикции.</p>`,
  },
  legal: {
    title: "Правовая информация",
    subtitle: "Прозрачность начинается с реквизитов.",
    content: `${notice}<h2>Статус сайта</h2><p>SĀL Legal — демонстрационное название и визуальная концепция. Сайт не подтверждает существование юридической фирмы с таким названием, наличие лицензий, профессионального статуса или полномочий оказывать услуги в какой-либо стране. Описания практик иллюстрируют предполагаемое наполнение. Команда содержит явно обозначенные места для будущих профилей.</p><h2>Реквизиты для заполнения</h2><dl><dt>Полное наименование и организационная форма</dt><dd>[Заполнить]</dd><dt>Юридический адрес</dt><dd>${esc(config.company.address)}</dd><dt>Регистрационный и налоговый номера</dt><dd>[Заполнить при применимости]</dd><dt>Ответственное лицо и контакт</dt><dd>[Заполнить]</dd><dt>Профессиональный статус, реестр и регулирующий орган</dt><dd>[Указать только подтвержденные и применимые сведения]</dd><dt>Юрисдикция и применимые профессиональные правила</dt><dd>[Заполнить после проверки]</dd></dl><h2>Ограничение назначения материалов</h2><p>Публикации носят общий информационный характер и не учитывают обстоятельства конкретного вопроса. Они не заменяют индивидуальную юридическую консультацию. Сообщение через форму или переход к оплате сами по себе не подтверждают принятие поручения.</p><h2>Визуальные материалы</h2><p>Архитектурные изображения созданы для демонстрационной концепции с помощью генеративной модели. Они не изображают подтвержденный офис фирмы. Шрифты Cormorant Garamond и Manrope распространяются по SIL Open Font License; тексты лицензий включены в репозиторий.</p>`,
  },
  terms: {
    title: "Условия использования",
    subtitle: "Договоренности до начала работы.",
    content: `${notice}<h2>1. Использование демонстрации</h2><p>Сайт позволяет ознакомиться с концепцией юридической практики, проверить форму и увидеть сценарий консультации. При включенном демо-режиме обращения не отправляются, консультации не бронируются, платежи не принимаются. Указанная стоимость ${esc(config.consultation.price)} ${esc(config.consultation.currency)} — пример наполнения.</p><h2>2. Принятие поручения</h2><p>Для реальной работы необходимо установить стороны, применимую юрисдикцию, отсутствие конфликта интересов, объем и условия услуг. Договор заключается в согласованном порядке. Отправка обращения не является гарантией принятия поручения, соблюдения процессуального срока или достижения результата.</p><h2>3. Консультация и платежи</h2><p>Планируемый формат — ${esc(config.consultation.minutes)} минут, онлайн или по телефону, в согласованное время. Перед включением оплаты продавец должен подтвердить цену, валюту, состав услуги, применимость налогов и дополнительных расходов. Оплата будет производиться на странице Stripe, если владелец активирует эту интеграцию. Сайт не обрабатывает карты и не считает возврат с платежной страницы подтверждением платежа.</p><h2>4. Перенос, отмена, возврат</h2><p>[Указать правила согласования времени, крайние сроки переноса, порядок отмены, возврата, неявки и контакт для обращений. Проверить применимость обязательных потребительских прав, включая требования к дистанционной продаже.] До заполнения и проверки этого раздела реальные платежи включать нельзя.</p><h2>5. Ответственность и права</h2><p>Объем обязанностей сторон, допустимые ограничения ответственности, порядок рассмотрения претензий и разрешения споров нужно определить в договоре с учетом обязательных норм выбранной юрисдикции. Настоящий шаблон не отменяет обязательных прав пользователя и не содержит гарантии исхода дела.</p><h2>6. Контакты и версия</h2><p>Поставщик: ${esc(config.company.registration)}. Контакт: ${esc(config.company.email)}. Замените эти данные и проверьте все условия до перехода к реальному оказанию услуг.</p>`,
  },
  "payment-return": {
    title: "Статус консультации",
    subtitle: "Проверим следующий шаг.",
    noindex: true,
    content:
      "<h2>Эта страница не подтверждает оплату</h2><p>Проверьте подтверждение на стороне платежного провайдера и в письме с квитанцией. Время консультации необходимо согласовать отдельно. Параметры URL не используются как доказательство оплаты.</p><p>Если платеж выполнялся, но подтверждение не получено, сначала уточните его статус у продавца или провайдера. Не оплачивайте повторно до выяснения.</p><p>В текущей демонстрационной конфигурации онлайн-оплата не подключена.</p>",
  },
};
const pageHtml = (path, page) =>
  `<!doctype html><html lang="ru"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="theme-color" content="#191b19"/><meta name="referrer" content="strict-origin-when-cross-origin"/><title>${esc(page.title)} — SĀL Legal</title><meta name="description" content="${esc(page.subtitle)} ${esc(page.title)} демонстрационного сайта SĀL Legal. Шаблон для проверки специалистом."/>${page.noindex ? '<meta name="robots" content="noindex,follow"/>' : ""}${meta(`${page.title} — SĀL Legal`, page.subtitle, path + "/")}<link rel="icon" href="${base}favicon.svg"/><link rel="stylesheet" href="${stylesheet}"/><link rel="stylesheet" href="${base}legal.css"/></head><body class="legal-body"><a class="skip-link" href="#legal-main">Перейти к содержанию</a><header class="legal-header"><a class="brand" href="${base}"><span class="brand-name">SĀL</span><span class="brand-descriptor">LEGAL<br/>ADVISORY</span></a><a href="${base}">← На главную</a></header><main class="legal-document" id="legal-main"><p class="eyebrow">ПРАВОВАЯ ИНФОРМАЦИЯ · ВЕРСИЯ 10.09.2026</p><h1>${esc(page.title)}</h1><p class="legal-subtitle">${esc(page.subtitle)}</p>${page.content}<a class="text-link dark-link" href="${base}#consultation">Вернуться к диалогу →</a></main><footer class="legal-footer">${nav}<p>© 2026 SĀL Legal · Демонстрационная концепция</p></footer></body></html>`;
for (const [path, page] of Object.entries(pages)) {
  await mkdir(`dist/${path}`, { recursive: true });
  await writeFile(`dist/${path}/index.html`, pageHtml(path, page));
}
await writeFile(
  "dist/404.html",
  pageHtml("404", {
    title: "Страница не найдена",
    subtitle: "Вернемся к главному.",
    noindex: true,
    content: `<p>Возможно, адрес изменился или содержит опечатку.</p><p><a class="button button-primary" href="${base}">Перейти на главную →</a></p>`,
  }),
);
await writeFile(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${["", "privacy/", "cookies/", "legal/", "terms/"].map((p) => `<url><loc>${esc(new URL(p, origin).href)}</loc></url>`).join("")}</urlset>`,
);
await writeFile(
  "dist/robots.txt",
  `User-agent: *\nAllow: /\nSitemap: ${new URL("sitemap.xml", origin).href}\n`,
);
await rm(".prerender", { recursive: true, force: true });
console.log(
  "Prerendered home, four legal pages, payment return and 404; canonical metadata, sitemap and robots generated.",
);
