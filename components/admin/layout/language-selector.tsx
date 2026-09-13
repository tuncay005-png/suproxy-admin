/**
 * LanguageSelector Component
 * 
 * Dropdown menu for language selection with localStorage persistence.
 * Integrates with the i18n context to trigger language changes.
 * Displays flag emojis and checkmarks for visual feedback.
 * 
 * @module components/admin/layout/language-selector
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <LanguageSelector />
 * 
 * // With custom styling
 * <LanguageSelector className="ml-4" />
 * ```
 * 
 * Validates: Requirements 3.1, 3.2, 3.23
 */

'use client';

import { useTranslations } from '@/lib/i18n/context';
import type { Locale } from '@/lib/i18n/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Check, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Props for LanguageSelector component
 */
interface LanguageSelectorProps {
  /** CSS class for additional styling */
  className?: string;
}

/**
 * Language option with localized label and flag emoji
 */
interface LanguageOption {
  /** Language code (en, ru) */
  code: Locale;
  /** Localized language name */
  label: string;
  /** Flag emoji representing the language */
  flag: string;
}

/**
 * Available language options
 */
const languages: LanguageOption[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

/**
 * LanguageSelector Component
 * 
 * Provides a dropdown menu for switching between English and Russian languages.
 * - Persists language selection to localStorage
 * - Updates immediately without page reload
 * - Shows checkmark for currently selected language
 * - Displays flag emojis for visual identification
 * 
 * @param props - Component props
 * @returns Language selector dropdown menu
 */
export function LanguageSelector({ className }: LanguageSelectorProps) {
  const { locale, changeLanguage } = useTranslations();

  // Find the current language option for display
  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];

  /**
   * Handle language selection
   * Updates the i18n context and persists to localStorage
   * 
   * @param selectedLocale - The locale to switch to
   */
  const handleLanguageChange = (selectedLocale: Locale) => {
    changeLanguage(selectedLocale);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('gap-2', className)}
          aria-label="Select language"
        >
          <Globe className="h-4 w-4" />
          <span className="text-lg" aria-hidden="true">
            {currentLanguage.flag}
          </span>
          <span className="text-sm">{currentLanguage.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="cursor-pointer"
          >
            <span className="text-lg mr-2" aria-hidden="true">
              {language.flag}
            </span>
            <span className="flex-1">{language.label}</span>
            {locale === language.code && (
              <Check className="h-4 w-4 ml-auto" aria-label="Selected" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
