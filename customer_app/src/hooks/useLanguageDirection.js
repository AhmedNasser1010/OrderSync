import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const useLanguageDirection = () => {
  const { i18n } = useTranslation()
  const [direction, setDirection] = useState('ltr')

  useEffect(() => {
    const changeDirection = () => {
      const direction = i18n.language === 'ar' ? 'rtl' : 'ltr'
      document.documentElement.dir = direction
      setDirection(direction)
    }

    // Change direction on language change
    i18n.on('languageChanged', changeDirection)

    // Initial direction setting
    changeDirection()

    // Cleanup listener on unmount
    return () => {
      i18n.off('languageChanged', changeDirection)
    }
  }, [i18n])

  return direction
}

export default useLanguageDirection