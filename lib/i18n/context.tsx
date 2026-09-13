/**
 * I18n Context Provider
 * 
 * React Context for managing locale state and translations with localStorage persistence.
 * Implements automatic locale detection on mount and provides a translation helper function
 * with dot notation support.
 * 
 * @example
 * ```tsx
 * // Wrap your app/layout with I18nProvider
 * <I18nProvider>
 *   <YourApp />
 * </I18nProvider>
 * 
 * // Use in components
 * const { t, locale, changeLanguage } = useTranslations();
 * console.log(t('nav.dashboard')); // "Dashboard" or "Панель управления"
 * changeLanguage('ru'); // Switch to Russian
 * ```
 */

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Locale, Translations, I18nContextValue } from './types';
import { storage } from '@/lib/utils/feature-detection';

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  /** Initial locale to use (default: 'en') */
  initialLocale?: Locale;
}

/**
 * I18nProvider Component
 * 
 * Provides internationalization context to all child components.
 * Handles locale persistence in localStorage and automatic locale detection on mount.
 * 
 * @param children - Child components to wrap
 * @param initialLocale - Initial locale to use before localStorage detection (default: 'en')
 */
export function I18nProvider({ children, initialLocale = 'en' }: I18nProviderProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [translations, setTranslations] = useState<Translations | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load translations dynamically
  useEffect(() => {
    const loadInitialTranslations = async () => {
      try {
        // Check for persisted locale from localStorage (with safe fallback)
        let targetLocale: Locale = initialLocale;
        if (typeof window !== 'undefined') {
          const stored = storage.getItem('preferred_locale') as Locale | null;
          if (stored && (stored === 'en' || stored === 'ru')) {
            targetLocale = stored;
            setLocale(stored);
          }
        }
        
        // Load the appropriate translation file
        await loadTranslations(targetLocale);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialTranslations();
  }, [initialLocale]);

  /**
   * Load translation file for specified locale
   * @param newLocale - Locale to load translations for
   */
  const loadTranslations = async (newLocale: Locale) => {
    try {
      const translationsModule = await import(`./locales/${newLocale}.json`);
      setTranslations(translationsModule.default as Translations);
    } catch (error) {
      console.error(`Failed to load translations for locale: ${newLocale}`, error);
      // Fallback to English if loading fails
      if (newLocale !== 'en') {
        const fallbackModule = await import('./locales/en.json');
        setTranslations(fallbackModule.default as Translations);
      }
    }
  };

  /**
   * Change the active language
   * Persists the selection to localStorage (with safe fallback) and loads new translations
   * @param newLocale - New locale to activate
   */
  const changeLanguage = (newLocale: Locale) => {
    setLocale(newLocale);
    if (typeof window !== 'undefined') {
      storage.setItem('preferred_locale', newLocale);
    }
    loadTranslations(newLocale);
  };

  /**
   * Translation helper function with dot notation support
   * 
   * @param key - Translation key in dot notation (e.g., 'nav.dashboard')
   * @returns Translated string or the key itself if translation not found
   * 
   * @example
   * t('nav.dashboard') // "Dashboard" or "Панель управления"
   * t('nav.xray.inbounds') // "Inbounds" or "Входящие"
   */
  const t = (key: string): string => {
    if (!translations) return key;
    
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    return value ?? key;
  };

  // Show loading state while translations are being loaded
  if (isLoading || !translations) {
    return null; // or a loading spinner if needed
  }

  return (
    <I18nContext.Provider value={{ locale, translations, changeLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * useTranslations Hook
 * 
 * Access i18n context from any component within I18nProvider.
 * Throws an error if used outside of I18nProvider.
 * 
 * @returns I18n context value with locale, translations, changeLanguage, and t functions
 * @throws Error if used outside I18nProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { t, locale, changeLanguage } = useTranslations();
 *   
 *   return (
 *     <div>
 *       <h1>{t('dashboard.title')}</h1>
 *       <button onClick={() => changeLanguage('ru')}>Русский</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTranslations(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslations must be used within I18nProvider');
  }
  return context;
}
