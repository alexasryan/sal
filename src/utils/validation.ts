import { z } from "zod";
export const inquirySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Укажите имя — не менее 2 символов.")
      .max(100, "Не более 100 символов."),
    phone: z.string().trim().max(30, "Не более 30 символов."),
    email: z
      .string()
      .trim()
      .max(160, "Не более 160 символов.")
      .refine(
        (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        "Проверьте адрес электронной почты.",
      ),
    service: z.enum([
      "unsure",
      "corporate",
      "disputes",
      "contracts",
      "property",
      "ip",
      "private",
    ]),
    message: z
      .string()
      .trim()
      .min(15, "Опишите задачу чуть подробнее — от 15 символов.")
      .max(2000, "Не более 2000 символов."),
    preferred: z.enum(["email", "phone"]),
    consent: z
      .boolean()
      .refine((v) => v, "Подтвердите согласие перед продолжением."),
    website: z.string().max(200).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.preferred === "email" && !v.email)
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: "Укажите email для ответа.",
      });
    const digits = v.phone.replace(/\D/g, "");
    if (
      (v.preferred === "phone" || v.phone) &&
      (!/^[+()\d\s.-]+$/.test(v.phone) ||
        digits.length < 7 ||
        digits.length > 15)
    )
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Укажите телефон: от 7 до 15 цифр, с кодом страны.",
      });
  });
export type Inquiry = z.infer<typeof inquirySchema>;
export function formEndpoint(value: string): string | null {
  try {
    const u = new URL(value);
    return u.protocol === "https:" && !u.username && !u.password && !u.hash
      ? u.href
      : null;
  } catch {
    return null;
  }
}
export function paymentLink(value: string): string | null {
  try {
    const u = new URL(value);
    return u.protocol === "https:" &&
      u.hostname === "buy.stripe.com" &&
      !u.username &&
      !u.password &&
      /^\/[a-zA-Z0-9_]+$/.test(u.pathname) &&
      !u.pathname.startsWith("/test_")
      ? u.href
      : null;
  } catch {
    return null;
  }
}
