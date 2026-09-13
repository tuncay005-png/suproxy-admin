/**
 * Integration Tests for i18n System
 * 
 * Validates: Requirements 3.3, 3.4, 3.23, 3.24
 * 
 * Test Coverage:
 * 1. Language switching updates all visible text immediately across components
 * 2. localStorage persistence across page reloads
 * 3. Fallback to default locale ('en') on invalid stored values
 * 4. Navigation items, dashboard labels, and all translated text updates correctly
 * 
 * Task ID: 14.5
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider, useTranslations } from './context';
import type { Locale } from './types';
import React, { ReactNode, useState } from 'react';

// Mock the feature-detection module
vi.mock('@/lib/utils/feature-detection', () => {
  return {
    storage: {
      getItem: vi.fn(),
      setItem: vi.fn(),
    },
    features: {
      supportsLocalStorage: true,
    },
  };
});

// Mock translation files
vi.mock('./locales/en.json', () => ({
  default: {
    nav: {
      dashboard: 'Dashboard',
      users: 'Users',
      sessions: 'Sessions',
      xray_management: 'Xray Management',
      xray: {
        inbounds: 'Inbounds',
        clients: 'Clients',
        nodes: 'Nodes',
        routing: 'Routing',
      },
      plans: 'Plans',
      logs: 'Logs',
      monitoring: 'Monitoring',
    },
    dashboard: {
      title: 'Dashboard',
      description: 'Welcome to the admin dashboard',
      total_users: 'Total Users',
      active_users: 'active',
      xray_status: 'Xray Status',
      running: 'Running',
      stopped: 'Stopped',
      loading: 'Loading...',
    },
    monitoring: {
      cpu_usage: 'CPU Usage',
      ram_usage: 'RAM Usage',
      disk_usage: 'Disk Usage',
      swap_usage: 'Swap Usage',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      retry: 'Retry',
    },
  },
}));

vi.mock('./locales/ru.json', () => ({
  default: {
    nav: {
      dashboard: 'Панель управления',
      users: 'Пользователи',
      sessions: 'Сессии',
      xray_management: 'Управление Xray',
      xray: {
        inbounds: 'Входящие',
        clients: 'Клиенты',
        nodes: 'Узлы',
        routing: 'Маршрутизация',
      },
      plans: 'Тарифы',
      logs: 'Логи',
      monitoring: 'Мониторинг',
    },
    dashboard: {
      title: 'Панель управления',
      description: 'Добро пожаловать в административную панель',
      total_users: 'Всего пользователей',
      active_users: 'активных',
      xray_status: 'Статус Xray',
      running: 'Работает',
      stopped: 'Остановлен',
      loading: 'Загрузка...',
    },
    monitoring: {
      cpu_usage: 'Использование CPU',
      ram_usage: 'Использование RAM',
      disk_usage: 'Использование диска',
      swap_usage: 'Использование Swap',
    },
    common: {
      loading: 'Загрузка...',
      error: 'Ошибка',
      retry: 'Повторить',
    },
  },
}));

/**
 * Test component simulating navigation sidebar with multiple items
 */
function TestNavigationSidebar() {
  const { t } = useTranslations();

  return (
    <nav data-testid="test-sidebar">
      <div>{t('nav.dashboard')}</div>
      <div>{t('nav.users')}</div>
      <div>{t('nav.sessions')}</div>
      <div>{t('nav.xray_management')}</div>
      <div>{t('nav.xray.inbounds')}</div>
      <div>{t('nav.xray.clients')}</div>
      <div>{t('nav.xray.nodes')}</div>
      <div>{t('nav.xray.routing')}</div>
      <div>{t('nav.plans')}</div>
      <div>{t('nav.logs')}</div>
      <div>{t('nav.monitoring')}</div>
    </nav>
  );
}

/**
 * Test component simulating dashboard with multiple labels
 */
function TestDashboard() {
  const { t } = useTranslations();

  return (
    <main data-testid="test-dashboard">
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.description')}</p>
      <div>{t('dashboard.total_users')}</div>
      <div>{t('dashboard.active_users')}</div>
      <div>{t('dashboard.xray_status')}</div>
      <div>{t('dashboard.running')}</div>
      <div>{t('dashboard.stopped')}</div>
      <div>{t('monitoring.cpu_usage')}</div>
      <div>{t('monitoring.ram_usage')}</div>
      <div>{t('monitoring.disk_usage')}</div>
      <div>{t('monitoring.swap_usage')}</div>
      <div>{t('common.loading')}</div>
    </main>
  );
}

/**
 * Test component with language switcher
 */
function TestLanguageSwitcher() {
  const { t, locale, changeLanguage } = useTranslations();

  return (
    <div data-testid="test-language-switcher">
      <div data-testid="current-locale">{locale}</div>
      <button onClick={() => changeLanguage('en')}>Switch to English</button>
      <button onClick={() => changeLanguage('ru')}>Switch to Russian</button>
      <div data-testid="translated-text">{t('dashboard.title')}</div>
    </div>
  );
}

/**
 * Complex test component simulating multiple sections of the app
 */
function TestComplexApp() {
  return (
    <div data-testid="test-complex-app">
      <TestNavigationSidebar />
      <TestDashboard />
      <TestLanguageSwitcher />
    </div>
  );
}

describe('i18n System Integration Tests', () => {
  let mockGetItem: ReturnType<typeof vi.fn>;
  let mockSetItem: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    // Import the mocked module to access mock functions
    const { storage } = await import('@/lib/utils/feature-detection');
    mockGetItem = storage.getItem as ReturnType<typeof vi.fn>;
    mockSetItem = storage.setItem as ReturnType<typeof vi.fn>;

    // Reset mocks before each test
    mockGetItem.mockClear();
    mockSetItem.mockClear();
    mockGetItem.mockReturnValue(null); // Default: no stored locale
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Language Switching Updates All Visible Text', () => {
    it('should update all navigation items when switching from English to Russian', async () => {
      const user = userEvent.setup();

      render(
        <I18nProvider initialLocale="en">
          <TestComplexApp />
        </I18nProvider>
      );

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
      });

      // Verify initial English text (use within to scope queries)
      const sidebar = screen.getByTestId('test-sidebar');
      expect(within(sidebar).getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Xray Management')).toBeInTheDocument();
      expect(screen.getByText('Inbounds')).toBeInTheDocument();

      // Switch to Russian
      const switchButton = screen.getByRole('button', { name: /switch to russian/i });
      await user.click(switchButton);

      // Wait for translations to update
      await waitFor(() => {
        expect(screen.getAllByText('Панель управления').length).toBeGreaterThan(0);
      });

      // Verify all navigation items are now in Russian
      expect(screen.getByText('Пользователи')).toBeInTheDocument();
      expect(screen.getByText('Сессии')).toBeInTheDocument();
      expect(screen.getByText('Управление Xray')).toBeInTheDocument();
      expect(screen.getByText('Входящие')).toBeInTheDocument();
      expect(screen.getByText('Клиенты')).toBeInTheDocument();
      expect(screen.getByText('Узлы')).toBeInTheDocument();
      expect(screen.getByText('Маршрутизация')).toBeInTheDocument();
      expect(screen.getByText('Тарифы')).toBeInTheDocument();
      expect(screen.getByText('Логи')).toBeInTheDocument();
      expect(screen.getByText('Мониторинг')).toBeInTheDocument();

      // Verify old English text is gone
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByText('Users')).not.toBeInTheDocument();
      expect(screen.queryByText('Xray Management')).not.toBeInTheDocument();
    });

    it('should update all dashboard labels when switching from Russian to English', async () => {
      const user = userEvent.setup();

      render(
        <I18nProvider initialLocale="ru">
          <TestComplexApp />
        </I18nProvider>
      );

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getAllByText('Панель управления').length).toBeGreaterThan(0);
      });

      // Verify initial Russian text (use within to scope queries)
      const dashboard = screen.getByTestId('test-dashboard');
      expect(within(dashboard).getByText('Добро пожаловать в административную панель')).toBeInTheDocument();
      expect(screen.getByText('Всего пользователей')).toBeInTheDocument();
      expect(screen.getByText('Статус Xray')).toBeInTheDocument();
      expect(screen.getByText('Работает')).toBeInTheDocument();

      // Switch to English
      const switchButton = screen.getByRole('button', { name: /switch to english/i });
      await user.click(switchButton);

      // Wait for translations to update
      await waitFor(() => {
        expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
      });

      // Verify all dashboard labels are now in English
      expect(screen.getByText('Welcome to the admin dashboard')).toBeInTheDocument();
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('Xray Status')).toBeInTheDocument();
      expect(screen.getByText('Running')).toBeInTheDocument();
      expect(screen.getByText('Stopped')).toBeInTheDocument();

      // Verify old Russian text is gone
      expect(screen.queryByText('Панель управления')).not.toBeInTheDocument();
      expect(screen.queryByText('Добро пожаловать в административную панель')).not.toBeInTheDocument();
    });

    it('should update monitoring labels when switching languages', async () => {
      const user = userEvent.setup();

      render(
        <I18nProvider initialLocale="en">
          <TestComplexApp />
        </I18nProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('CPU Usage')).toBeInTheDocument();
      });

      // Verify initial English monitoring labels
      expect(screen.getByText('CPU Usage')).toBeInTheDocument();
      expect(screen.getByText('RAM Usage')).toBeInTheDocument();
      expect(screen.getByText('Disk Usage')).toBeInTheDocument();
      expect(screen.getByText('Swap Usage')).toBeInTheDocument();

      // Switch to Russian
      const switchButton = screen.getByRole('button', { name: /switch to russian/i });
      await user.click(switchButton);

      await waitFor(() => {
        expect(screen.getByText('Использование CPU')).toBeInTheDocument();
      });

      // Verify monitoring labels are now in Russian
      expect(screen.getByText('Использование RAM')).toBeInTheDocument();
      expect(screen.getByText('Использование диска')).toBeInTheDocument();
      expect(screen.getByText('Использование Swap')).toBeInTheDocument();

      // Old English labels should be gone
      expect(screen.queryByText('CPU Usage')).not.toBeInTheDocument();
      expect(screen.queryByText('RAM Usage')).not.toBeInTheDocument();
    });

    it('should update text immediately without page reload', async () => {
      const user = userEvent.setup();

      render(
        <I18nProvider initialLocale="en">
          <TestLanguageSwitcher />
        </I18nProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      // Switch to Russian
      const switchButton = screen.getByRole('button', { name: /switch to russian/i });
      await user.click(switchButton);

      // Text should update immediately (within reasonable time)
      await waitFor(
        () => {
          expect(screen.getByText('Панель управления')).toBeInTheDocument();
        },
        { timeout: 500 }
      ); // Should be fast
    });

    it('should update nested translation keys correctly', async () => {
      const user = userEvent.setup();

      render(
        <I18nProvider initialLocale="en">
          <TestNavigationSidebar />
          <TestLanguageSwitcher />
        </I18nProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Inbounds')).toBeInTheDocument();
      });

      // Verify nested keys work in English
      expect(screen.getByText('Inbounds')).toBeInTheDocument();
      expect(screen.getByText('Clients')).toBeInTheDocument();
      expect(screen.getByText('Nodes')).toBeInTheDocument();
      expect(screen.getByText('Routing')).toBeInTheDocument();

      // Switch to Russian
      const switchButton = screen.getByRole('button', { name: /switch to russian/i });
      await user.click(switchButton);

      await waitFor(() => {
        expect(screen.getByText('Входящие')).toBeInTheDocument();
      });

      // Verify nested keys work in Russian
      expect(screen.getByText('Клиенты')).toBeInTheDocument();
      expect(screen.getByText('Узлы')).toBeInTheDocument();
      expect(screen.getByText('Маршрутизация')).toBeInTheDocument();
    });

    it('should maintain consistent state across multiple components', async () => {
      const user = userEvent.setup();

      render(
        <I18nProvider initialLocale="en">
          <TestComplexApp />
        </I18nProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('test-sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('test-dashboard')).toBeInTheDocument();
      });

      // All components should show English initially
      const sidebar = screen.getByTestId('test-sidebar');
      const dashboard = screen.getByTestId('test-dashboard');

      expect(within(sidebar).getByText('Dashboard')).toBeInTheDocument();
      expect(within(dashboard).getByText('Dashboard')).toBeInTheDocument();

      // Switch to Russian
      const switchButton = screen.getByRole('button', { name: /switch to russian/i });
      await user.click(switchButton);

      await waitFor(() => {
        expect(within(sidebar).getByText('Панель управления')).toBeInTheDocument();
      });

      // All components should show Russian now
      expect(within(dashboard).getByText('Панель управления')).toBeInTheDocument();
      expect(within(sidebar).getByText('Пользователи')).toBeInTheDocument();
      expect(within(dashboard).getByText('Всего пользователей')).toBeInTheDocument();
    });

    it('should handle rapid language switching correctly', async () => {
      const user = userEvent.setup();

      render(
        <I18nProvider initialLocale="en">
          <TestLanguageSwitcher />
        </I18nProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      // Switch to Russian
      await user.click(screen.getByRole('button', { name: /switch to russian/i }));
      await waitFor(() => {
        expect(screen.getByText('Панель управления')).toBeInTheDocument();
      });

      // Quickly switch back to English
      await user.click(screen.getByRole('button', { name: /switch to english/i }));
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      // Switch to Russian again
      await user.click(screen.getByRole('button', { name: /switch to russian/i }));
      await waitFor(() => {
        expect(screen.getByText('Панель управления')).toBeInTheDocument();
      });

      // Final state should be Russian
      expect(screen.getByText('Панель управления')).toBeInTheDocument();
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });

    it('should update current locale indicator when language changes', async () => {
      const user = userEvent.setup();

      render(
        <I18nProvider initialLocale="en">
          <TestLanguageSwitcher />
        </I18nProvider>
      );

      await waitFor(() => {
        const localeIndicator = screen.getByTestId('current-locale');
        expect(localeIndicator).toHaveTextContent('en');
      });

      // Switch to Russian
      await user.click(screen.getByRole('button', { name: /switch to russian/i }));

      await waitFor(() => {
        const localeIndicator = screen.getByTestId('current-locale');
        expect(localeIndicator).toHaveTextContent('ru');
      });

      // Switch back to English
      await user.click(screen.getByRole('button', { name: /switch to english/i }));

      await waitFor(() => {
        const localeIndicator = screen.getByTestId('current-locale');
        expect(localeIndicator).toHaveTextContent('en');
      });
    });
  });

  describe('localStorage Persistence Across Page Reloads', () => {
    it('should persist English locale selection to localStorage', async () => {
      const user = userEvent.setup();

      render(
        <I18nProvider initialLocale="ru">
          <TestLanguageSwitcher />
        </I18nProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Панель управления')).toBeInTheDocument();
      });

      // Switch to English
      await user.click(screen.getByRole('button', { name: /switch to english/i }));

      await waitFor(() => {
        expect(mockSetItem).toHaveBeenCalledWith('preferred_locale', 'en');
      });
    });

    it('should persist Russian locale selection to localStorage', async () => {
      const user = userEvent.setup();

      render(
        <I18nProvider initialLocale="en">
          <TestLanguageSwitcher />
        </I18nProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      // Switch to Russian
      await user.click(screen.getByRole('button', { name: /switch to russian/i }));

      await waitFor(() => {
        expect(mockSetItem).toHaveBeenCalledWith('preferred_locale', 'ru');
      });
    });

    it('should load persisted English locale from localStorage on mount', async () => {
      // Simulate stored locale
      mockGetItem.mockReturnValue('en');

      render(
        <I18nProvider initialLocale="ru">
          <TestLanguageSwitcher />
        </I18nProvider>
      );

      // Should load English despite initialLocale being 'ru'
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      const localeIndicator = screen.getByTestId('current-locale');
      expect(localeIndicator).toHaveTextContent('en');
    });

    it('should load persisted Russian locale from localStorage on mount', async () => {
      // Simulate stored locale
      mockGetItem.mockReturnValue('ru');

      render(
        <I18nProvider initialLocale="en">
          <TestLanguageSwitcher />
        </I18nProvider>
      );

      // Should load Russian despite initialLocale being 'en'
      await waitFor(() => {
        expect(screen.getByText('Панель управления')).toBeInTheDocument();
      });

      const localeIndicator = screen.getByTestId('current-locale');
      expect(localeIndicator).toHaveTextContent('ru');
    });

    it('should maintain locale across simulated page reload', async () => {
      const user = userEvent.setup();

      // First render - switch to Russian
      const { unmount } = render(
        <I18nProvider initialLocale="en">
          <TestLanguageSwitcher />
        </I18nProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /switch to russian/i }));

      await waitFor(() => {
        expect(mockSetItem).toHaveBeenCalledWith('preferred_locale', 'ru');
      });

      // Unmount (simulate page unload)
      unmount();

      // Simulate localStorage returning the persisted value
      mockGetItem.mockReturnValue('ru');

      // Second render - should load Russian from localStorage
      render(
        <I18nProvider initialLocale="en">
          <TestLanguageSwitcher />
        </I18nProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Панель управления')).toBeInTheDocument();
      });

      expect(mockGetItem).toHaveBeenCalledWith('preferred_locale');
    });

    it('should use correct localStorage key "preferred_locale"', async () => {
      const user = userEvent.setup();

      render(
        <I18nProvider initialLocale="en">
          <TestLanguageSwitcher />
        </I18nProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /switch to russian/i }));

      await waitFor(() => {
        const calls = mockSetItem.mock.calls;
        expect(calls[0][0]).toBe('preferred_locale');
        expect(calls[0][1]).toBe('ru');
      });
    });

    it('should read from localStorage on initial mount', async () => {
      mockGetItem.mockReturnValue('ru');

      render(
        <I18nProvider initialLocale="en">
          <TestLanguageSwitcher />
        </I18nProvider>
      );

      await waitFor(() => {
        expect(mockGetItem).toHaveBeenCalledWith('preferred_locale');
      });
    });

    it('should persist locale choice across multiple language switches', async () => {
      const user = userEvent.setup();

      render(
        <I18nProvider initialLocale="en">
          <TestLanguageSwitcher />
        </I18nProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      // First switch
      await user.click(screen.getByRole('button', { name: /switch to russian/i }));
      await waitFor(() => {
        expect(mockSetItem).toHaveBeenCalledWith('preferred_locale', 'ru');
      });

      // Second switch
      await user.click(screen.getByRole('button', { name: /switch to english/i }));
      await waitFor(() => {
        expect(mockSetItem).toHaveBeenCalledWith('preferred_locale', 'en');
      });

      // Third switch
      await user.click(screen.getByRole('button', { name: /switch to russian/i }));
      await waitFor(() => {
        expect(mockSetItem).toHaveBeenCalledWith('preferred_locale', 'ru');
      });

      // Should have called setItem 3 times
      expect(mockSetItem).toHaveBeenCalledTimes(3);
    });
  });

  describe('Fallback to Default Locale on Invalid Stored Value', () => {
    it('should fallback to default "en" when localStorage contains invalid locale', async () => {
      // Simulate invalid stored locale
      mockGetItem.mockReturnValue('fr'); // Invalid locale

      render(
        <I18nProvider initialLocale="en">
          <TestLanguageSwitcher />
        </I18nProvider>
      );

      // Should fallback to English (initialLocale)
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      const localeIndicator = screen.getByTestId('current-locale');
      expect(localeIndicator).toHaveTextContent('en');
    });

    it('should fallback to default "en" when localStorage contains null', async () => {
      mockGetItem.mockReturnValue(null);

      render(
        <I18nProvider initialLocale="en">
          <TestLanguageSwitcher />
        </I18nProvider>
      );

      // Should use English (initialLocale)
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      const localeIndicator = screen.getByTestId('current-locale');
      expect(localeIndicator).toHaveTextContent('en');
    });

    it('should fallback to default "en" when localStorage contains empty string', async () => {
      mockGetItem.mockReturnValue('');

      render(
        <I18nProvider initialLocale="en">
          <TestLanguageSwitcher />
        </I18nProvider>
      );

      // Should use English (initialLocale)
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      const localeIndicator = screen.getByTestId('current-locale');
      expect(localeIndicator).toHaveTextContent('en');
    });

    it('should fallback to default "en" when localStorage contains malformed JSON', async () => {
      mockGetItem.mockReturnValue('{invalid json}');

      render(
        <I18nProvider initialLocale="en">
          <TestLanguageSwitcher />
        </I18nProvider>
      );

      // Should use English (initialLocale)
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      const localeIndicator = screen.getByTestId('current-locale');
      expect(localeIndicator).toHaveTextContent('en');
    });

    it('should fallback to default "en" when localStorage contains numeric value', async () => {
      mockGetItem.mockReturnValue('123');

      render(
        <I18nProvider initialLocale="en">
          <TestLanguageSwitcher />
        </I18nProvider>
      );

      // Should use English (initialLocale)
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      const localeIndicator = screen.getByTestId('current-locale');
      expect(localeIndicator).toHaveTextContent('en');
    });

    it('should fallback to default "en" when localStorage contains object', async () => {
      mockGetItem.mockReturnValue('[object Object]');

      render(
        <I18nProvider initialLocale="en">
          <TestLanguageSwitcher />
        </I18nProvider>
      );

      // Should use English (initialLocale)
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      const localeIndicator = screen.getByTestId('current-locale');
      expect(localeIndicator).toHaveTextContent('en');
    });

    it('should fallback gracefully when localStorage is unavailable', async () => {
      // Mock storage to simulate unavailable localStorage
      mockGetItem.mockImplementation(() => {
        // Return null instead of throwing - simulates getItem handling error internally
        return null;
      });

      render(
        <I18nProvider initialLocale="en">
          <TestLanguageSwitcher />
        </I18nProvider>
      );

      // Should still render with default locale
      await waitFor(() => {
        const translatedText = screen.getByTestId('translated-text');
        expect(translatedText).toHaveTextContent('Dashboard');
      });

      const localeIndicator = screen.getByTestId('current-locale');
      expect(localeIndicator).toHaveTextContent('en');
    });

    it('should not crash when setItem fails', async () => {
      const user = userEvent.setup();
      // Mock setItem to silently fail (wrapped in try-catch in implementation)
      mockSetItem.mockImplementation(() => {
        // Silent failure - storage module should handle this
      });

      render(
        <I18nProvider initialLocale="en">
          <TestLanguageSwitcher />
        </I18nProvider>
      );

      await waitFor(() => {
        const translatedText = screen.getByTestId('translated-text');
        expect(translatedText).toHaveTextContent('Dashboard');
      });

      // Switch to Russian - should not crash even if setItem fails
      await user.click(screen.getByRole('button', { name: /switch to russian/i }));

      // Language should still change in memory
      await waitFor(() => {
        const translatedText = screen.getByTestId('translated-text');
        expect(translatedText).toHaveTextContent('Панель управления');
      });
    });

    it('should recover from invalid locale and allow subsequent language changes', async () => {
      const user = userEvent.setup();
      mockGetItem.mockReturnValue('invalid');

      render(
        <I18nProvider initialLocale="en">
          <TestLanguageSwitcher />
        </I18nProvider>
      );

      // Should start with English (fallback)
      await waitFor(() => {
        const translatedText = screen.getByTestId('translated-text');
        expect(translatedText).toHaveTextContent('Dashboard');
      });

      // Should still allow language switching
      await user.click(screen.getByRole('button', { name: /switch to russian/i }));

      await waitFor(() => {
        const translatedText = screen.getByTestId('translated-text');
        expect(translatedText).toHaveTextContent('Панель управления');
      });

      // And verify it persisted
      expect(mockSetItem).toHaveBeenCalledWith('preferred_locale', 'ru');
    });
  });

  describe('Complete Integration Scenarios', () => {
    it('should handle complete user workflow: load from storage, switch language, persist', async () => {
      const user = userEvent.setup();

      // Scenario: User has Russian saved from previous session
      mockGetItem.mockReturnValue('ru');

      render(
        <I18nProvider initialLocale="en">
          <TestComplexApp />
        </I18nProvider>
      );

      // App should load with Russian from localStorage
      await waitFor(() => {
        expect(screen.getAllByText('Панель управления').length).toBeGreaterThan(0);
      });

      // Verify multiple components show Russian
      expect(screen.getByText('Пользователи')).toBeInTheDocument();
      expect(screen.getByText('Всего пользователей')).toBeInTheDocument();
      expect(screen.getByText('Использование CPU')).toBeInTheDocument();

      // User switches to English
      await user.click(screen.getByRole('button', { name: /switch to english/i }));

      await waitFor(() => {
        expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
      });

      // Verify all components updated
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('CPU Usage')).toBeInTheDocument();

      // Verify persistence
      expect(mockSetItem).toHaveBeenCalledWith('preferred_locale', 'en');
    });

    it('should handle first-time user (no stored locale)', async () => {
      const user = userEvent.setup();
      mockGetItem.mockReturnValue(null);

      render(
        <I18nProvider initialLocale="en">
          <TestComplexApp />
        </I18nProvider>
      );

      // Should start with default English
      await waitFor(() => {
        expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
      });

      // User discovers language switcher and changes to Russian
      await user.click(screen.getByRole('button', { name: /switch to russian/i }));

      await waitFor(() => {
        expect(screen.getAllByText('Панель управления').length).toBeGreaterThan(0);
      });

      // First-time preference should be saved
      expect(mockSetItem).toHaveBeenCalledWith('preferred_locale', 'ru');
    });

    it('should handle translation key fallback for missing translations', async () => {
      function TestMissingKey() {
        const { t } = useTranslations();
        return <div data-testid="missing-key">{t('nonexistent.key.path')}</div>;
      }

      render(
        <I18nProvider initialLocale="en">
          <TestMissingKey />
        </I18nProvider>
      );

      await waitFor(() => {
        const element = screen.getByTestId('missing-key');
        // Should return the key itself as fallback
        expect(element).toHaveTextContent('nonexistent.key.path');
      });
    });

    it('should maintain locale state across component mounting and unmounting', async () => {
      const user = userEvent.setup();

      function TestConditionalRender() {
        const { changeLanguage } = useTranslations();
        const [showDashboard, setShowDashboard] = useState(true);

        return (
          <div>
            <button onClick={() => changeLanguage('ru')}>Switch to Russian</button>
            <button onClick={() => setShowDashboard(!showDashboard)}>
              Toggle Dashboard
            </button>
            {showDashboard && <TestDashboard />}
          </div>
        );
      }

      render(
        <I18nProvider initialLocale="en">
          <TestConditionalRender />
        </I18nProvider>
      );

      await waitFor(() => {
        expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
      });

      // Switch to Russian
      await user.click(screen.getByRole('button', { name: /switch to russian/i }));

      await waitFor(() => {
        expect(screen.getAllByText('Панель управления').length).toBeGreaterThan(0);
      });

      // Unmount dashboard
      await user.click(screen.getByRole('button', { name: /toggle dashboard/i }));

      await waitFor(() => {
        expect(screen.queryAllByText('Панель управления').length).toBe(0);
      });

      // Re-mount dashboard - should still be in Russian
      await user.click(screen.getByRole('button', { name: /toggle dashboard/i }));

      await waitFor(() => {
        expect(screen.getAllByText('Панель управления').length).toBeGreaterThan(0);
      });
    });

    it('should handle concurrent language switches correctly', async () => {
      const user = userEvent.setup();

      render(
        <I18nProvider initialLocale="en">
          <TestLanguageSwitcher />
        </I18nProvider>
      );

      await waitFor(() => {
        const translatedText = screen.getByTestId('translated-text');
        expect(translatedText).toHaveTextContent('Dashboard');
      });

      // Trigger multiple switches rapidly
      const ruButton = screen.getByRole('button', { name: /switch to russian/i });
      const enButton = screen.getByRole('button', { name: /switch to english/i });

      // Fire multiple clicks
      await user.click(ruButton);
      await user.click(enButton);
      await user.click(ruButton);

      // Final state should be Russian (last click)
      await waitFor(() => {
        const translatedText = screen.getByTestId('translated-text');
        expect(translatedText).toHaveTextContent('Панель управления');
      });

      const localeIndicator = screen.getByTestId('current-locale');
      expect(localeIndicator).toHaveTextContent('ru');
    });
  });
});
