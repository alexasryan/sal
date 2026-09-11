import { useState } from "react";
import Header, { Logo } from "./components/layout/Header";
import Button, { Arrow } from "./components/ui/Button";
import Modal from "./components/ui/Modal";
import ConsultationForm from "./components/ConsultationForm";
import {
  practices,
  principles,
  process,
  expertise,
  faq,
  type Practice,
} from "./content";
import { asset, legalUrl, site } from "./config";
import { paymentLink } from "./utils/validation";
import { useReveal } from "./hooks/useReveal";
function App() {
  useReveal();
  const [practice, setPractice] = useState<Practice | null>(null);
  const [selectedService, setSelectedService] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [booking, setBooking] = useState(false);
  const [paymentConsent, setPaymentConsent] = useState(false);
  const payment = !site.demo && paymentLink(site.consultation.paymentUrl);
  function inquire(id = "") {
    setPractice(null);
    setBooking(false);
    setSelectedService(id);
    requestAnimationFrame(() => {
      document
        .getElementById("consultation")
        ?.scrollIntoView({
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
        });
      document
        .querySelector<HTMLInputElement>('[name="name"]')
        ?.focus({ preventScroll: true });
    });
  }
  return (
    <div id="top">
      <a className="skip-link" href="#main">
        Перейти к содержанию
      </a>
      <Header />
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow">
              <span className="tiny-rule" />
              ЮРИДИЧЕСКИЙ КОНСАЛТИНГ
            </p>
            <h1 id="hero-title">
              <span>Право на</span>
              <em>уверенность.</em>
            </h1>
            <p className="hero-description">
              В решениях, которые определяют будущее.
              <br className="desktop-break" /> Стратегический подход к защите
              бизнеса
              <br className="desktop-break" /> и личных интересов.
            </p>
            <div className="hero-actions">
              <a href="#consultation" className="button button-primary">
                Получить консультацию <Arrow />
              </a>
              <a href="#practices" className="text-link">
                Наши практики <Arrow diagonal />
              </a>
            </div>
            <div className="hero-bottom">
              <span>ТОЧНОСТЬ. ТАКТ. ПЕРСПЕКТИВА.</span>
              <a href="#about" aria-label="Перейти к философии компании">
                <span>Листайте, чтобы узнать нас</span>
                <span className="down-arrow" aria-hidden="true">
                  ↓
                </span>
              </a>
            </div>
          </div>
          <figure className="hero-visual">
            <picture>
              <source
                srcSet={`${asset("images/hero-640.webp")} 640w, ${asset("images/hero-1122.webp")} 1122w`}
                sizes="(max-width: 760px) 100vw, 50vw"
                type="image/webp"
              />
              <img
                src={asset("images/hero-1122.webp")}
                width="1122"
                height="1402"
                alt="Монументальная колоннада из светлого камня в глубокой архитектурной тени"
                {...{ fetchpriority: "high" }}
              />
            </picture>
            <figcaption>
              <span>ОПОРА ДЛЯ ВАЖНЫХ РЕШЕНИЙ</span>
              <span>01 / SĀL</span>
            </figcaption>
            <div className="hero-seal" aria-hidden="true">
              S<span>Ā</span>L
            </div>
          </figure>
        </section>
        <div className="values-band" aria-label="Принципы работы">
          <span>Независимый взгляд</span>
          <span>Конфиденциальный диалог</span>
          <span>Внимание к последствиям</span>
        </div>
        <section
          id="about"
          tabIndex={-1}
          className="section about light"
          aria-labelledby="about-title"
        >
          <div className="section-label" data-reveal>
            <span>01 / ФИЛОСОФИЯ</span>
            <span>ЗА КАЖДЫМ РЕШЕНИЕМ — ЧЕЛОВЕК</span>
          </div>
          <div className="about-grid">
            <h2 id="about-title" data-reveal>
              Сложные вопросы.
              <br />
              <em>Ясная позиция.</em>
            </h2>
            <div className="about-copy" data-reveal>
              <p className="lead">
                Хорошая юридическая работа начинается с понимания того, что для
                вас действительно важно.
              </p>
              <p>
                В основе SĀL — идея внимательного партнерства. Сначала
                разобраться в обстоятельствах. Затем увидеть варианты. И только
                после этого предложить путь, который учитывает ваши интересы.
              </p>
              <p>
                От повседневных договоренностей до решений с долгосрочными
                последствиями — право должно давать опору.
              </p>
              <a className="text-link dark-link" href="#approach">
                Как мы мыслим <Arrow diagonal />
              </a>
            </div>
          </div>
          <div className="facts" data-reveal>
            <div>
              <span className="fact-number">06</span>
              <span>
                взаимосвязанных
                <br />
                правовых практик
              </span>
            </div>
            <div>
              <span className="fact-number">05</span>
              <span>
                понятных этапов
                <br />
                совместной работы
              </span>
            </div>
            <div>
              <span className="fact-number">01</span>
              <span>
                фокус —<br />
                ваша задача
              </span>
            </div>
          </div>
        </section>
        <section
          id="practices"
          tabIndex={-1}
          className="section practices light"
          aria-labelledby="practice-title"
        >
          <div className="section-label" data-reveal>
            <span>02 / ПРАКТИКИ</span>
            <span>БИЗНЕС И ЧАСТНЫЕ ИНТЕРЕСЫ</span>
          </div>
          <div className="section-heading" data-reveal>
            <h2 id="practice-title">
              Экспертиза,
              <br />
              <em>которая имеет значение.</em>
            </h2>
            <p>
              Смотрим на задачу целиком.
              <br />
              Объединяем нужные направления
              <br />в одной согласованной стратегии.
            </p>
          </div>
          <div className="practice-list">
            {practices.map((p) => (
              <button
                className="practice-row"
                key={p.id}
                onClick={() => setPractice(p)}
                aria-haspopup="dialog"
                data-reveal
              >
                <span className="practice-number">{p.number}</span>
                <span className="practice-name">{p.title}</span>
                <span className="practice-description">{p.description}</span>
                <span className="practice-more">
                  <span>Подробнее</span>
                  <Arrow diagonal />
                </span>
              </button>
            ))}
          </div>
        </section>
        <section
          id="approach"
          tabIndex={-1}
          className="approach dark"
          aria-labelledby="approach-title"
        >
          <div className="approach-visual">
            <img
              src={asset("images/staircase-1200.webp")}
              srcSet={`${asset("images/staircase-720.webp")} 720w, ${asset("images/staircase-1200.webp")} 1200w`}
              sizes="(max-width: 900px) 100vw, 50vw"
              width="1536"
              height="1024"
              loading="lazy"
              alt="Скульптурная лестница из теплого камня, освещенная естественным светом"
            />
            <span className="image-note">ПЕРСПЕКТИВА МЕНЯЕТ РЕШЕНИЕ.</span>
          </div>
          <div className="approach-copy">
            <p className="eyebrow" data-reveal>
              03 / ПОДХОД
            </p>
            <h2 id="approach-title" data-reveal>
              На шаг
              <br />
              <em>дальше вопроса.</em>
            </h2>
            <div className="principles">
              {principles.map((p) => (
                <div className="principle" key={p.number} data-reveal>
                  <span>{p.number}</span>
                  <div>
                    <h3>{p.title}</h3>
                    <p>{p.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section
          id="process"
          tabIndex={-1}
          className="section process light"
          aria-labelledby="process-title"
        >
          <div className="section-label" data-reveal>
            <span>04 / ПРОЦЕСС</span>
            <span>ПРОЗРАЧНОСТЬ НА КАЖДОМ ЭТАПЕ</span>
          </div>
          <h2 id="process-title" data-reveal>
            От первого разговора
            <br />
            <em>к продуманному действию.</em>
          </h2>
          <div
            className="process-control"
            role="tablist"
            aria-label="Этапы работы"
          >
            {process.map((s, i) => (
              <button
                key={s.title}
                role="tab"
                id={`step-${i}`}
                aria-selected={activeStep === i}
                aria-controls={`step-panel-${i}`}
                tabIndex={activeStep === i ? 0 : -1}
                onKeyDown={(e) => {
                  let next = i;
                  if (e.key === "ArrowRight") next = (i + 1) % process.length;
                  else if (e.key === "ArrowLeft")
                    next = (i + process.length - 1) % process.length;
                  else if (e.key === "Home") next = 0;
                  else if (e.key === "End") next = process.length - 1;
                  else return;
                  e.preventDefault();
                  setActiveStep(next);
                  document.getElementById(`step-${next}`)?.focus();
                }}
                onClick={() => setActiveStep(i)}
              >
                <span>0{i + 1}</span>
                <strong>{s.title}</strong>
                <span className="process-dot" />
              </button>
            ))}
          </div>
          {process.map((s, i) => (
            <div
              key={s.title}
              role="tabpanel"
              id={`step-panel-${i}`}
              aria-labelledby={`step-${i}`}
              hidden={activeStep !== i}
              className="process-panel"
              tabIndex={0}
            >
              <span className="process-large" aria-hidden="true">
                0{i + 1}
              </span>
              <div>
                <p className="eyebrow">ЭТАП 0{i + 1}</p>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
              <a href="#consultation" className="text-link dark-link">
                Начать диалог <Arrow diagonal />
              </a>
            </div>
          ))}
        </section>
        <section
          id="expertise"
          tabIndex={-1}
          className="section expertise light"
          aria-labelledby="expertise-title"
        >
          <div className="section-label" data-reveal>
            <span>05 / В КОНТЕКСТЕ ВАШИХ ЗАДАЧ</span>
            <span>ТИПЫ СИТУАЦИЙ</span>
          </div>
          <div className="section-heading" data-reveal>
            <h2 id="expertise-title">
              Когда нужна
              <br />
              <em>правовая перспектива.</em>
            </h2>
            <p>
              Иллюстрации возможных задач.
              <br />
              Не реальные дела и не обещания
              <br />
              определенного результата.
            </p>
          </div>
          <div className="expertise-grid">
            {expertise.map((e, i) => (
              <article key={e.title} data-reveal>
                <div className="expertise-top">
                  <span className="eyebrow">{e.type}</span>
                  <span>0{i + 1}</span>
                </div>
                <h3>{e.title}</h3>
                <p>{e.text}</p>
                <div className="tags">
                  {e.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
                <button
                  className="text-link dark-link"
                  onClick={() => inquire(practices[[0, 3, 1][i]].id)}
                >
                  Обсудить похожую задачу <Arrow diagonal />
                </button>
              </article>
            ))}
          </div>
        </section>
        <section
          id="team"
          tabIndex={-1}
          className="section team dark"
          aria-labelledby="team-title"
        >
          <div className="section-label" data-reveal>
            <span>06 / КОМАНДА</span>
            <span>ПЕРСОНАЛЬНОЕ ВНИМАНИЕ</span>
          </div>
          <div className="section-heading" data-reveal>
            <h2 id="team-title">
              Доверие начинается
              <br />
              <em>с личного знакомства.</em>
            </h2>
            <p>
              Для каждой задачи — подходящая
              <br />
              специализация и понятная
              <br />
              ответственность за работу.
            </p>
          </div>
          <div className="team-grid">
            {[
              ["Управляющий партнер", "Стратегия и корпоративные вопросы"],
              ["Руководитель практики", "Разрешение споров"],
              ["Юридический консультант", "Сделки и частные клиенты"],
            ].map(([role, specialty], i) => (
              <article key={role} data-reveal>
                <div className="team-monogram">
                  <span>0{i + 1}</span>
                  <span className="eyebrow">ПРОФИЛЬ КОМАНДЫ</span>
                </div>
                <p className="demo-tag">ДЕМОНСТРАЦИОННЫЙ ПРОФИЛЬ</p>
                <h3>[Имя Фамилия]</h3>
                <p className="team-role">{role}</p>
                <p>{specialty}</p>
              </article>
            ))}
          </div>
          <p className="team-note">
            Места для будущих профилей. Имена, фотографии, квалификация и статус
            специалистов будут опубликованы после подтверждения. Вымышленные
            лица не представлены как действующие юристы.
          </p>
        </section>
        <section className="section faq light" aria-labelledby="faq-title">
          <div>
            <p className="eyebrow" data-reveal>
              07 / ВОПРОСЫ И ОТВЕТЫ
            </p>
            <h2 id="faq-title" data-reveal>
              Важное.
              <br />
              <em>До начала работы.</em>
            </h2>
            <p data-reveal>
              Ясность в деталях —<br />
              часть профессионального подхода.
            </p>
          </div>
          <div className="faq-list">
            {faq.map((f, i) => (
              <details key={f.question} name="faq" data-reveal>
                <summary>
                  <span className="faq-number">0{i + 1}</span>
                  <h3>{f.question}</h3>
                  <span className="plus" aria-hidden="true" />
                </summary>
                <div className="faq-answer">
                  <p>{f.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </section>
        <section
          id="consultation"
          tabIndex={-1}
          className="section consultation dark"
          aria-labelledby="consultation-title"
        >
          <div className="consultation-copy">
            <p className="eyebrow" data-reveal>
              08 / НАЧНЕМ С РАЗГОВОРА
            </p>
            <h2 id="consultation-title" data-reveal>
              Ваш следующий шаг.
              <br />
              <em>С ясной перспективой.</em>
            </h2>
            <p className="consultation-intro" data-reveal>
              Расскажите, что для вас важно.
              <br />
              Первый разговор поможет определить
              <br />
              вопросы, которые стоит решить.
            </p>
            <div className="booking-card" data-reveal>
              <div className="booking-label">
                <span>Первичная консультация</span>
                <span>{site.consultation.minutes} МИН</span>
              </div>
              <div className="booking-price">
                <span>
                  {new Intl.NumberFormat("ru", {
                    style: "currency",
                    currency: site.consultation.currency,
                    maximumFractionDigits: 0,
                  }).format(site.consultation.price)}
                </span>
                <p>
                  {site.demo
                    ? "Демонстрационная стоимость"
                    : "Стоимость консультации"}
                  <br />
                  Онлайн · по согласованию
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setPaymentConsent(false);
                  setBooking(true);
                }}
              >
                Забронировать консультацию
              </Button>
              <p className="payment-note">
                {payment
                  ? "Оплата на защищенной странице Stripe."
                  : "Онлайн-оплата пока не подключена. Списаний нет."}
              </p>
            </div>
          </div>
          <ConsultationForm selectedService={selectedService} />
        </section>
        <section
          id="contacts"
          tabIndex={-1}
          className="section contacts light"
          aria-labelledby="contacts-title"
        >
          <div className="section-label">
            <span>09 / КОНТАКТЫ</span>
            <span>
              {site.demo ? "ДЕМОНСТРАЦИОННЫЕ ДАННЫЕ" : "ОСТАЕМСЯ НА СВЯЗИ"}
            </span>
          </div>
          <div className="contacts-grid">
            <div>
              <h2 id="contacts-title">
                Хорошее решение
                <br />
                <em>начинается с диалога.</em>
              </h2>
              <a href="#consultation" className="text-link dark-link">
                Обсудим вашу задачу <Arrow diagonal />
              </a>
            </div>
            <div className="contact-info">
              <div>
                <span className="eyebrow">EMAIL</span>
                {site.demo ? (
                  <span>{site.company.email}</span>
                ) : (
                  <a href={`mailto:${site.company.email}`}>
                    {site.company.email}
                  </a>
                )}
              </div>
              <div>
                <span className="eyebrow">ТЕЛЕФОН</span>
                {site.demo ? (
                  <span>{site.company.phone}</span>
                ) : (
                  <a href={`tel:${site.company.phone.replace(/[^+\d]/g, "")}`}>
                    {site.company.phone}
                  </a>
                )}
              </div>
              <div>
                <span className="eyebrow">
                  ОФИС · ПО ПРЕДВАРИТЕЛЬНОЙ ЗАПИСИ
                </span>
                <span>{site.company.address}</span>
                <small>{site.company.hours}</small>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="footer dark">
        <div className="footer-top">
          <a href="#top" aria-label="SĀL Legal — наверх">
            <Logo />
          </a>
          <p>
            Ясность в решениях.
            <br />
            Уверенность в будущем.
          </p>
          <a href="#top" className="back-top">
            Наверх <span aria-hidden="true">↑</span>
          </a>
        </div>
        <nav className="footer-nav" aria-label="Навигация в подвале">
          <a href="#about">Философия</a>
          <a href="#practices">Практики</a>
          <a href="#process">Процесс</a>
          <a href="#team">Команда</a>
          <a href="#consultation">Консультация</a>
          {(site.company.socials as { label: string; url: string }[]).map(
            (s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.label}
              </a>
            ),
          )}
        </nav>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} SĀL Legal</span>
          <nav aria-label="Правовая информация">
            <a href={legalUrl("privacy")}>Конфиденциальность</a>
            <a href={legalUrl("cookies")}>Cookies</a>
            <a href={legalUrl("legal")}>Правовая информация</a>
            <a href={legalUrl("terms")}>Условия</a>
          </nav>
        </div>
        {site.demo && (
          <p className="footer-disclaimer">
            SĀL Legal — демонстрационная концепция. Данные компании, состав
            команды и стоимость требуют замены. Материалы не являются
            юридической консультацией. Правовые тексты — шаблоны для проверки
            специалистом применимой юрисдикции.
          </p>
        )}
      </footer>
      <Modal
        open={!!practice}
        title={practice?.title || "Практика"}
        onClose={() => setPractice(null)}
      >
        {practice && (
          <>
            <p className="modal-subtitle">{practice.subtitle}</p>
            <p>{practice.description}</p>
            <h3>Возможный объем работы</h3>
            <ul>
              {practice.tasks.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <div className="modal-outcome">
              <span className="eyebrow">ЦЕЛЬ СОПРОВОЖДЕНИЯ</span>
              <p>{practice.outcome}</p>
            </div>
            <p className="small-note">
              Описание направления. Конкретный объем и возможность оказания
              услуги согласовываются после оценки задачи и юрисдикции.
            </p>
            <Button onClick={() => inquire(practice.id)}>
              Обсудить эту задачу
            </Button>
          </>
        )}
      </Modal>
      <Modal
        open={booking}
        title="Первичная консультация"
        onClose={() => setBooking(false)}
      >
        <p className="modal-subtitle">
          {site.consultation.minutes} минут для ясности в вашем вопросе.
        </p>
        <ul>
          <li>Уточнение обстоятельств и приоритетов.</li>
          <li>Предварительное обсуждение правовых вопросов.</li>
          <li>Определение возможных следующих действий.</li>
        </ul>
        <p>
          Стоимость:{" "}
          <strong>
            {new Intl.NumberFormat("ru", {
              style: "currency",
              currency: site.consultation.currency,
              maximumFractionDigits: 0,
            }).format(site.consultation.price)}
          </strong>
          . Время и возможность консультации согласовываются отдельно.
        </p>
        {payment ? (
          <>
            <label className="consent">
              <input
                type="checkbox"
                checked={paymentConsent}
                onChange={(e) => setPaymentConsent(e.target.checked)}
              />
              <span>
                Я прочитал{" "}
                <a
                  href={legalUrl("terms")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  условия услуги, отмены и возврата
                </a>
                .
              </span>
            </label>
            {paymentConsent ? (
              <a
                href={payment}
                className="button button-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Перейти к оплате в Stripe <Arrow diagonal />
              </a>
            ) : (
              <Button disabled>Перейти к оплате в Stripe</Button>
            )}
            <p className="small-note">
              Откроется страница Stripe. Реквизиты карты не передаются этому
              сайту.
            </p>
          </>
        ) : (
          <>
            <div className="modal-outcome">
              <strong>Бронирование пока не активно.</strong>
              <p>
                Это демонстрация. Деньги не списываются и время не
                резервируется. После подключения оплаты здесь откроется
                защищенная платежная страница.
              </p>
            </div>
            <Button onClick={() => inquire()}>Перейти к форме обращения</Button>
          </>
        )}
      </Modal>
    </div>
  );
}
export default App;
