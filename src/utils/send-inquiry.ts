import type { Inquiry } from "./validation";
export async function sendInquiry(
  values: Inquiry,
  endpoint: string,
  signal: AbortSignal,
  fetcher: typeof fetch = fetch,
) {
  const response = await fetcher(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "omit",
    referrerPolicy: "no-referrer",
    signal,
    body: JSON.stringify({
      ...values,
      website: undefined,
      _gotcha: "",
      _subject: "SĀL Legal — новое обращение",
      submissionId: crypto.randomUUID(),
      privacyVersion: "2026-09-10",
    }),
  });
  if (!response.ok)
    throw new Error(
      response.status === 429
        ? "Слишком много запросов. Подождите несколько минут и попробуйте снова."
        : "Сервис не принял обращение. Данные остались в форме; попробуйте позже.",
    );
}
