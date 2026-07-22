import { useEffect } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import Header from './components/layout/Header'
import Hero from './components/sections/Hero'
import About from './components/sections/About'
import Services from './components/sections/Services'
import Advantages from './components/sections/Advantages'
import Testimonials from './components/sections/Testimonials'
import Contact from './components/sections/Contact'
import Footer from './components/layout/Footer'

/**
 * Основной компонент приложения
 * Использует Framer Motion для плавной анимации прогресс-бара прокрутки
 */
function App() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  // Устанавливаем язык документа для accessibility
  useEffect(() => {
    document.documentElement.lang = 'ru'
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Прогресс-бар прокрутки - визуальный индикатор для пользователя */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gold z-50 origin-left"
        style={{ scaleX }}
      />

      <Header />
      
      <main>
        <Hero />
        <About />
        <Services />
        <Advantages />
        <Testimonials />
        <Contact />
      </main>

      <Footer />
    </div>
  )
}

export default App
