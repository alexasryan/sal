import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { site, legalUrl } from "../config";
import { practices } from "../content";
import { formEndpoint, inquirySchema, type Inquiry } from "../utils/validation";
import Button from "./ui/Button";
import { sendInquiry } from "../utils/send-inquiry";
export default function ConsultationForm({
  selectedService,
}: {
  selectedService: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<Inquiry>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      service: "unsure",
      message: "",
      preferred: "email",
      consent: false,
      website: "",
    },
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error" | "demo"
  >("idle");
  const [errorText, setErrorText] = useState("");
  const lock = useRef(false);
  const completed = useRef("");
  const statusRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selectedService)
      setValue("service", selectedService as Inquiry["service"]);
  }, [selectedService, setValue]);
  const preferred = watch("preferred");
  const message = watch("message") || "";
  const endpoint = formEndpoint(site.form.endpoint);
  const demo = site.demo || !endpoint;
  const announce = (state: typeof status) => {
    setStatus(state);
    requestAnimationFrame(() =>
      statusRef.current?.focus({ preventScroll: true }),
    );
  };
  async function submit(values: Inquiry) {
    if (lock.current) return;
    if (values.website) {
      setErrorText(
        "Не удалось проверить обращение. Обновите страницу и попробуйте еще раз.",
      );
      announce("error");
      return;
    }
    const fingerprint = JSON.stringify(values);
    if (completed.current === fingerprint) {
      setErrorText(
        "Это обращение уже отправлено. Дождитесь ответа, прежде чем отправлять его повторно.",
      );
      announce("error");
      return;
    }
    lock.current = true;
    setStatus("loading");
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 15000);
    try {
      if (demo) {
        await new Promise((resolve) => window.setTimeout(resolve, 400));
        announce("demo");
        return;
      }
      await sendInquiry(values, endpoint!, controller.signal);
      completed.current = fingerprint;
      reset();
      announce("success");
    } catch (error) {
      setErrorText(
        error instanceof Error && error.name === "AbortError"
          ? "Ответ сервиса задерживается. Отправка могла состояться. Сначала проверьте подтверждение, чтобы избежать повтора."
          : error instanceof TypeError
            ? "Нет связи с сервисом. Проверьте подключение и попробуйте снова. Данные остались в форме."
            : error instanceof Error
              ? error.message
              : "Не удалось отправить обращение. Попробуйте позже.",
      );
      announce("error");
    } finally {
      clearTimeout(timer);
      lock.current = false;
    }
  }
  const fieldError = (key: keyof Inquiry) =>
    errors[key] ? (
      <span className="field-error" id={`${key}-error`}>
        {errors[key]?.message}
      </span>
    ) : null;
  const invalid = (key: keyof Inquiry) => ({
    "aria-invalid": !!errors[key],
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
  });
  return (
    <form
      className="consultation-form"
      onSubmit={handleSubmit(submit)}
      noValidate
      aria-label="Форма обращения"
    >
      <div className="form-heading">
        <span className="eyebrow">ВАША ЗАДАЧА</span>
        <span className="form-step">01 — Знакомство</span>
      </div>
      {demo && (
        <p className="demo-notice">
          Демонстрационная форма. Используйте тестовые данные — обращения пока
          не отправляются.
        </p>
      )}
      <div className="form-grid">
        <label className="field">
          Ваше имя <span className="required">*</span>
          <input
            autoComplete="name"
            maxLength={100}
            placeholder="Как к вам обращаться"
            {...register("name")}
            {...invalid("name")}
          />
          {fieldError("name")}
        </label>
        <label className="field">
          Практика
          <select {...register("service")}>
            <option value="unsure">Помогите определить</option>
            {practices.map((p) => (
              <option value={p.id} key={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <fieldset className="contact-preference">
        <legend>Как вам удобнее получить ответ?</legend>
        <label>
          <input type="radio" value="email" {...register("preferred")} />
          По email
        </label>
        <label>
          <input type="radio" value="phone" {...register("preferred")} />
          По телефону
        </label>
      </fieldset>
      <div className="form-grid">
        <label className="field">
          Email {preferred === "email" && <span className="required">*</span>}
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={160}
            placeholder="name@company.com"
            {...register("email")}
            {...invalid("email")}
          />
          {fieldError("email")}
        </label>
        <label className="field">
          Телефон {preferred === "phone" && <span className="required">*</span>}
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={30}
            placeholder="С кодом страны"
            {...register("phone")}
            {...invalid("phone")}
          />
          {fieldError("phone")}
        </label>
      </div>
      <label className="field message-field">
        Кратко о ситуации <span className="required">*</span>
        <textarea
          rows={3}
          maxLength={2000}
          placeholder="Ваша задача и желаемый результат"
          {...register("message")}
          {...invalid("message")}
          aria-describedby={
            errors.message ? "message-error message-hint" : "message-hint"
          }
        />
        {fieldError("message")}
        <span className="message-meta">
          <span id="message-hint">
            Без документов и чувствительных сведений.
          </span>
          <span>{message.length}/2000</span>
        </span>
      </label>
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>
      <label className="consent">
        <input
          type="checkbox"
          {...register("consent")}
          {...invalid("consent")}
        />
        <span>
          Я ознакомился с{" "}
          <a
            href={legalUrl("privacy")}
            target="_blank"
            rel="noopener noreferrer"
          >
            политикой конфиденциальности
          </a>{" "}
          и согласен на обработку данных для ответа на обращение.
        </span>
      </label>
      {fieldError("consent")}
      <div
        ref={statusRef}
        tabIndex={-1}
        className={`form-status ${status}`}
        aria-live="polite"
        aria-atomic="true"
      >
        {status === "loading" && (
          <p>{demo ? "Проверяем заполнение…" : "Отправляем обращение…"}</p>
        )}
        {status === "demo" && (
          <>
            <strong>Демо-проверка завершена.</strong>
            <p>
              Форма заполнена корректно. Данные никуда не отправлены. Запись на
              консультацию не создана.
            </p>
          </>
        )}
        {status === "success" && (
          <>
            <strong>Обращение принято сервисом.</strong>
            <p>
              Спасибо. Ответ поступит выбранным способом после рассмотрения
              запроса. Время консультации необходимо согласовать отдельно.
            </p>
          </>
        )}
        {status === "error" && <p>{errorText}</p>}
      </div>
      <Button type="submit" loading={status === "loading"}>
        {demo ? "Проверить обращение" : "Отправить обращение"}
      </Button>
      <p className="form-footnote">
        * Обязательные поля. Обращение не создает отношений с юридическим
        консультантом.
      </p>
    </form>
  );
}
