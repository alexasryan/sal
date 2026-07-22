/**
 * Централизованное хранилище TypeScript типов
 * Обеспечивает строгую типизацию всего приложения
 */

export interface Service {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  price?: string
}

export interface Advantage {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

export interface Testimonial {
  id: string
  name: string
  role: string
  content: string
  rating: number
  date: string
}

export interface ContactFormData {
  name: string
  phone: string
  email: string
  message: string
  consent: boolean
}

export interface StatItem {
  label: string
  value: string
  suffix?: string
}
