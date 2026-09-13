/**
 * AdminLayout Integration Tests
 * 
 * Tests for i18n integration into AdminLayout.
 * Validates that I18nProvider wraps the layout and provides context to all admin pages.
 * 
 * Validates: Requirements 3.22, 3.23
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AdminLayout from './layout';

// Mock the admin components
vi.mock('@/components/admin/layout/admin-sidebar', () => ({
  AdminSidebar: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    <div data-testid="admin-sidebar" data-open={isOpen}>
      Sidebar
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

vi.mock('@/components/admin/layout/admin-header', () => ({
  AdminHeader: ({ onMenuClick }: { onMenuClick: () => void }) => (
    <div data-testid="admin-header">
      Header
      <button onClick={onMenuClick}>Menu</button>
    </div>
  ),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/admin',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe('AdminLayout - i18n Integration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('renders AdminLayout with I18nProvider wrapper', async () => {
    render(
      <AdminLayout>
        <div data-testid="child-content">Test Content</div>
      </AdminLayout>
    );

    // Wait for translations to load
    await waitFor(() => {
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    // Verify layout structure
    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('admin-header')).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('provides i18n context to child components', async () => {
    // Import useTranslations to test context availability
    const { useTranslations } = await import('@/lib/i18n/context');
    
    // Create a test component that uses translations
    function TestComponent() {
      const { t, locale } = useTranslations();
      return (
        <div data-testid="test-component">
          <span data-testid="locale">{locale}</span>
          <span data-testid="translation">{t('nav.dashboard')}</span>
        </div>
      );
    }

    render(
      <AdminLayout>
        <TestComponent />
      </AdminLayout>
    );

    // Wait for translations to load
    await waitFor(() => {
      expect(screen.getByTestId('locale')).toBeInTheDocument();
    });

    // Verify context is available
    const localeElement = screen.getByTestId('locale');
    expect(localeElement.textContent).toBe('en'); // Default locale

    const translationElement = screen.getByTestId('translation');
    expect(translationElement.textContent).toBe('Dashboard'); // English translation
  });

  it('does not break existing layout functionality', async () => {
    const userEvent = await import('@testing-library/user-event');
    const user = userEvent.default;
    
    render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );

    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
    });

    // Verify sidebar starts closed
    const sidebar = screen.getByTestId('admin-sidebar');
    expect(sidebar.getAttribute('data-open')).toBe('false');

    // Click menu button to open sidebar
    const menuButton = screen.getByText('Menu');
    await user.setup().click(menuButton);

    // Verify sidebar opens
    await waitFor(() => {
      expect(sidebar.getAttribute('data-open')).toBe('true');
    });
  });

  it('persists language selection across rerenders', async () => {
    const { useTranslations } = await import('@/lib/i18n/context');
    const userEvent = await import('@testing-library/user-event');
    const user = userEvent.default;
    
    function LanguageSwitcher() {
      const { locale, changeLanguage } = useTranslations();
      return (
        <div>
          <span data-testid="current-locale">{locale}</span>
          <button onClick={() => changeLanguage('ru')}>Switch to Russian</button>
        </div>
      );
    }
    
    const { container } = render(
      <AdminLayout>
        <LanguageSwitcher />
      </AdminLayout>
    );

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByTestId('current-locale')).toBeInTheDocument();
    });

    // Verify initial locale
    expect(screen.getByTestId('current-locale').textContent).toBe('en');

    // Switch to Russian
    const switchButton = screen.getByText('Switch to Russian');
    await user.setup().click(switchButton);

    // Wait for locale change
    await waitFor(() => {
      expect(screen.getByTestId('current-locale').textContent).toBe('ru');
    });

    // Verify localStorage was updated
    expect(localStorage.getItem('preferred_locale')).toBe('ru');
  });

  it('applies responsive layout classes correctly', async () => {
    const { container } = render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );

    // Wait for component to render
    await waitFor(() => {
      expect(container.querySelector('main')).toBeInTheDocument();
    });

    const mainElement = container.querySelector('main');
    expect(mainElement).toHaveClass('flex-1');
    expect(mainElement).toHaveClass('overflow-y-auto');
    expect(mainElement).toHaveClass('bg-muted/10');
    expect(mainElement).toHaveClass('p-4');
    expect(mainElement).toHaveClass('md:p-6');
    expect(mainElement).toHaveClass('lg:p-8');
  });

  it('wraps children in max-width container', async () => {
    const { container } = render(
      <AdminLayout>
        <div data-testid="child">Content</div>
      </AdminLayout>
    );

    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    const containerDiv = screen.getByTestId('child').parentElement;
    expect(containerDiv).toHaveClass('mx-auto');
    expect(containerDiv).toHaveClass('max-w-7xl');
    expect(containerDiv).toHaveClass('w-full');
  });
});
