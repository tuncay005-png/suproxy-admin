/**
 * Simplified unit tests for I18n Context Provider
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { I18nProvider, useTranslations } from './context';

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

describe('I18nProvider Basic Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  it('should render I18nProvider component', () => {
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

  it('should translate simple keys with t() function', () => {
    const TestComponent = () => {
      const { t } = useTranslations();
      return <div data-testid="result">{t('nav.dashboard')}</div>;
    };

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('result')).toHaveTextContent('Dashboard');
  });

  it('should translate nested keys with dot notation', () => {
    const TestComponent = () => {
      const { t } = useTranslations();
      return <div data-testid="result">{t('nav.xray.inbounds')}</div>;
    };

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('result')).toHaveTextContent('Inbounds');
  });

  it('should return key when translation not found', () => {
    const TestComponent = () => {
      const { t } = useTranslations();
      return <div data-testid="result">{t('nonexistent.key')}</div>;
    };

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('result')).toHaveTextContent('nonexistent.key');
  });

  it('should persist language change to localStorage', () => {
    const TestComponent = () => {
      const { locale, changeLanguage } = useTranslations();
      return (
        <div>
          <span data-testid="locale">{locale}</span>
          <button data-testid="change-btn" onClick={() => changeLanguage('ru')}>
            Change
          </button>
        </div>
      );
    };

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    const button = screen.getByTestId('change-btn');
    button.click();

    expect(localStorageMock.getItem('preferred_locale')).toBe('ru');
    expect(screen.getByTestId('locale')).toHaveTextContent('ru');
  });
});
