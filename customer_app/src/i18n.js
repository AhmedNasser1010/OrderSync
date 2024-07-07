import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'

// Import translation files
import translationEN from './locales/en/translation.json'
import translationAR from './locales/ar/translation.json'

const resources = {
  en: {
    translation: translationEN
  },
  ar: {
    translation: translationAR
  }
}

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar',
    fallbackLng: 'ar',
    debug: true,
    interpolation: {
      escapeValue: false
    }
  });

export default i18n