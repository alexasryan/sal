import { useEffect, useRef, useState } from 'react'

/**
 * Кастомный хук для анимации появления элементов при скролле
 * Использует Intersection Observer API для производительности
 * 
 * UX-решение: Элементы появляются плавно при входе во вьюпорт,
 * что создает ощущение "открытия" контента и удерживает внимание
 */
export function useScrollAnimation<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          // Отключаем наблюдение после первого появления
          if (ref.current) observer.unobserve(ref.current)
        }
      },
      {
        threshold: 0.15, // Срабатывает когда 15% элемента видно
        rootMargin: '0px 0px -50px 0px', // Чуть раньше начала появления
      }
    )

    const currentRef = ref.current
    if (currentRef) observer.observe(currentRef)

    return () => {
      if (currentRef) observer.unobserve(currentRef)
    }
  }, [])

  return { ref, isVisible }
}
