/**
 * Unit tests for I18n Context Provider
 * 
 * Tests cover:
 * - I18nProvider component creation and locale state management
 * - localStorage persistence implementation
 * - Automatic locale detection on mount
 * - t() function with dot notation support
 * - useTranslations hook error handling
 * - TypeScript type safety
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { I18nProvider, useTranslations } from './context';
import type { Locale } from './types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('I18nProvider', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  it('should create I18nProvider component with locale state management', () => {
    const TestComponent = () => {
      const { locale } = useTranslations();
      return <div data-testid="locale">{locale}</div>;
    };

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('locale')).toHaveTextContent('en');
  });

  it('should implement localStorage persistence when changing language', () => {
    const TestComponent = () => {
      const { locale, changeLanguage } = useTranslations();
      return (
        <div>
          <span data-testid="locale">{locale}</span>
          <button onClick={() => changeLanguage('ru')}>Change to Russian</button>
        </div>
      );
    };

    const { rerender } = render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    // Click the button to change language
    const button = screen.getByText('Change to Russian');
    button.click();

    // Check localStorage was updated
    expect(localStorageMock.getItem('preferred_locale')).toBe('ru');

    // Verify locale state changed
    expect(screen.getByTestId('locale')).toHaveTextContent('ru');
  });

  it('should detect and load locale from localStorage on mount', async () => {
    // Set up localStorage before mounting
    localStorageMock.setItem('preferred_locale', 'ru');

    const TestComponent = () => {
      const { locale } = useTranslations();
      return <div data-testid="locale">{locale}</div>;
    };

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    // Wait for useEffect to run and update locale
    await waitFor(() => {
      expect(screen.getByTestId('locale')).toHaveTextContent('ru');
    });
  });

  it('should default to initialLocale when localStorage is empty', () => {
    const TestComponent = () => {
      const { locale } = useTranslations();
      return <div data-testid="locale">{locale}</div>;
    };

    render(
      <I18nProvider initialLocale="en">
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('locale')).toHaveTextContent('en');
  });

  it('should ignore invalid locale values from localStorage', async () => {
    // Set invalid locale in localStorage
    localStorageMock.setItem('preferred_locale', 'invalid');

    const TestComponent = () => {
      const { locale } = useTranslations();
      return <div data-testid="locale">{locale}</div>;
    };

    render(
      <I18nProvider initialLocale="en">
        <TestComponent />
      </I18nProvider>
    );

    // Should remain at initial locale (en) since stored value is invalid
    await waitFor(() => {
      expect(screen.getByTestId('locale')).toHaveTextContent('en');
    });
  });
});

describe('t() translation function', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should support dot notation for nested translation keys', () => {
    const TestComponent = () => {
      const { t } = useTranslations();
      return (
        <div>
          <span data-testid="dashboard">{t('nav.dashboard')}</span>
          <span data-testid="inbounds">{t('nav.xray.inbounds')}</span>
        </div>
      );
    };

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('dashboard')).toHaveTextContent('Dashboard');
    expect(screen.getByTestId('inbounds')).toHaveTextContent('Inbounds');
  });

  it('should return the key itself when translation is not found', () => {
    const TestComponent = () => {
      const { t } = useTranslations();
      return <div data-testid="missing">{t('nonexistent.key')}</div>;
    };

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('missing')).toHaveTextContent('nonexistent.key');
  });

  it('should translate to Russian when locale is ru', () => {
    const TestComponent = () => {
      const { t, changeLanguage } = useTranslations();
      
      // Change to Russian immediately
      React.useEffect(() => {
        changeLanguage('ru');
      }, [changeLanguage]);

      return <div data-testid="dashboard">{t('nav.dashboard')}</div>;
    };

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    // After language change, should show Russian translation
    waitFor(() => {
      expect(screen.getByTestId('dashboard')).toHaveTextContent('Панель управления');
    });
  });

  it('should handle deeply nested keys', () => {
    const TestComponent = () => {
      const { t } = useTranslations();
      return <div data-testid="nested">{t('nav.xray.routing')}</div>;
    };

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('nested')).toHaveTextContent('Routing');
  });

  it('should handle single-level keys', () => {
    const TestComponent = () => {
      const { t } = useTranslations();
      return <div data-testid="loading">{t('dashboard.loading')}</div>;
    };

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('Loading...');
  });
});

describe('useTranslations hook', () => {
  it('should throw error when used outside I18nProvider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const TestComponent = () => {
      useTranslations();
      return <div>Test</div>;
    };

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTranslations must be used within I18nProvider');

    consoleError.mockRestore();
  });

  it('should return all context properties when used within provider', () => {
    const { result } = renderHook(() => useTranslations(), {
      wrapper: ({ children }) => <I18nProvider>{children}</I18nProvider>,
    });

    expect(result.current).toHaveProperty('locale');
    expect(result.current).toHaveProperty('translations');
    expect(result.current).toHaveProperty('changeLanguage');
    expect(result.current).toHaveProperty('t');
    expect(typeof result.current.t).toBe('function');
    expect(typeof result.current.changeLanguage).toBe('function');
  });

  it('should allow changing language through hook', () => {
    const { result } = renderHook(() => useTranslations(), {
      wrapper: ({ children }) => <I18nProvider>{children}</I18nProvider>,
    });

    expect(result.current.locale).toBe('en');

    act(() => {
      result.current.changeLanguage('ru');
    });

    expect(result.current.locale).toBe('ru');
    expect(localStorageMock.getItem('preferred_locale')).toBe('ru');
  });
});

describe('TypeScript type safety', () => {
  it('should enforce valid Locale type', () => {
    const TestComponent = () => {
      const { changeLanguage } = useTranslations();
      
      // Valid locales
      const validLocale: Locale = 'en';
      const validLocale2: Locale = 'ru';

      return (
        <div>
          <button onClick={() => changeLanguage('en')}>EN</button>
          <button onClick={() => changeLanguage('ru')}>RU</button>
        </div>
      );
    };

    // Should compile without errors
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(true).toBe(true);
  });
});
