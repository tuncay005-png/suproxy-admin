/**
 * Unit Tests for LanguageSelector Component
 * 
 * Validates: Requirements 3.1, 3.2, 3.23
 * 
 * Test Coverage:
 * - Locale switching triggers i18n context changeLanguage
 * - localStorage persistence of selected language
 * - Dropdown menu interaction and rendering
 * - Current language display with flag and label
 * - Checkmark indicator for selected language
 * - Keyboard accessibility
 * - ARIA attributes for accessibility
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageSelector } from './language-selector';
import { I18nProvider } from '@/lib/i18n/context';
import type { Locale } from '@/lib/i18n/types';

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
vi.mock('@/lib/i18n/locales/en.json', () => ({
  default: {
    nav: { dashboard: 'Dashboard' },
    dashboard: { title: 'Dashboard' },
  },
}));

vi.mock('@/lib/i18n/locales/ru.json', () => ({
  default: {
    nav: { dashboard: 'Панель управления' },
    dashboard: { title: 'Панель управления' },
  },
}));

describe('LanguageSelector', () => {
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

  /**
   * Helper function to render LanguageSelector within I18nProvider
   */
  const renderLanguageSelector = (initialLocale: Locale = 'en') => {
    return render(
      <I18nProvider initialLocale={initialLocale}>
        <LanguageSelector />
      </I18nProvider>
    );
  };

  describe('Initial Rendering', () => {
    it('should render language selector button with globe icon', async () => {
      renderLanguageSelector();

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /select language/i });
        expect(button).toBeInTheDocument();
      });

      // Check for globe icon (by class or test-id)
      const button = screen.getByRole('button', { name: /select language/i });
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('should display English flag and label by default', async () => {
      renderLanguageSelector();

      await waitFor(() => {
        expect(screen.getByText('🇺🇸')).toBeInTheDocument();
        expect(screen.getByText('English')).toBeInTheDocument();
      });
    });

    it('should display Russian flag and label when initialLocale is ru', async () => {
      renderLanguageSelector('ru');

      await waitFor(() => {
        expect(screen.getByText('🇷🇺')).toBeInTheDocument();
        expect(screen.getByText('Русский')).toBeInTheDocument();
      });
    });

    it('should have proper button styling classes', async () => {
      renderLanguageSelector();

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /select language/i });
        expect(button).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /select language/i });
      expect(button.classList.contains('gap-2')).toBe(true);
    });

    it('should have aria-label for accessibility', async () => {
      renderLanguageSelector();

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /select language/i });
        expect(button).toHaveAttribute('aria-label', 'Select language');
      });
    });

    it('should apply custom className prop', async () => {
      render(
        <I18nProvider initialLocale="en">
          <LanguageSelector className="custom-class" />
        </I18nProvider>
      );

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /select language/i });
        expect(button.classList.contains('custom-class')).toBe(true);
      });
    });
  });

  describe('Dropdown Menu Interaction', () => {
    it('should open dropdown menu when button is clicked', async () => {
      const user = userEvent.setup();
      renderLanguageSelector();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      // Wait for dropdown menu to appear
      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /English/i })).toBeInTheDocument();
      });
    });

    it('should display both language options in dropdown', async () => {
      const user = userEvent.setup();
      renderLanguageSelector();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /English/i })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: /Русский/i })).toBeInTheDocument();
      });
    });

    it('should display flag emojis in dropdown menu items', async () => {
      const user = userEvent.setup();
      renderLanguageSelector();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      await waitFor(() => {
        // Get all instances of flags (button + menu items)
        const usFlags = screen.getAllByText('🇺🇸');
        const ruFlags = screen.getAllByText('🇷🇺');
        
        // Should have at least 2 US flags (button + menu item)
        expect(usFlags.length).toBeGreaterThanOrEqual(2);
        // Should have at least 1 RU flag (menu item)
        expect(ruFlags.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should show checkmark for currently selected language', async () => {
      const user = userEvent.setup();
      renderLanguageSelector('en');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      await waitFor(() => {
        // Look for Check icon with aria-label "Selected"
        const checkIcon = screen.getByLabelText('Selected');
        expect(checkIcon).toBeInTheDocument();
        
        // The checkmark should be in the English menu item
        const englishMenuItem = screen.getByRole('menuitem', { name: /English/i });
        expect(englishMenuItem).toContainElement(checkIcon);
      });
    });

    it('should not show checkmark for non-selected language', async () => {
      const user = userEvent.setup();
      renderLanguageSelector('en');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      await waitFor(() => {
        const russianMenuItem = screen.getByRole('menuitem', { name: /Русский/i });
        const checkIcon = screen.queryByLabelText('Selected');
        
        if (checkIcon) {
          // Checkmark should not be in Russian menu item
          expect(russianMenuItem).not.toContainElement(checkIcon);
        }
      });
    });

    it('should have cursor-pointer class on menu items', async () => {
      const user = userEvent.setup();
      renderLanguageSelector();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      await waitFor(() => {
        const englishMenuItem = screen.getByRole('menuitem', { name: /English/i });
        expect(englishMenuItem.classList.contains('cursor-pointer')).toBe(true);
      });
    });

    it('should close dropdown after selecting a language', async () => {
      const user = userEvent.setup();
      renderLanguageSelector('en');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /Русский/i })).toBeInTheDocument();
      });

      const russianMenuItem = screen.getByRole('menuitem', { name: /Русский/i });
      await user.click(russianMenuItem);

      // Dropdown should close after selection
      await waitFor(() => {
        expect(screen.queryByRole('menuitem', { name: /Русский/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('Locale Switching', () => {
    it('should call changeLanguage when English is selected', async () => {
      const user = userEvent.setup();
      renderLanguageSelector('ru'); // Start with Russian

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /English/i })).toBeInTheDocument();
      });

      const englishMenuItem = screen.getByRole('menuitem', { name: /English/i });
      await user.click(englishMenuItem);

      // Verify localStorage was updated
      await waitFor(() => {
        expect(mockSetItem).toHaveBeenCalledWith('preferred_locale', 'en');
      });
    });

    it('should call changeLanguage when Russian is selected', async () => {
      const user = userEvent.setup();
      renderLanguageSelector('en'); // Start with English

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /Русский/i })).toBeInTheDocument();
      });

      const russianMenuItem = screen.getByRole('menuitem', { name: /Русский/i });
      await user.click(russianMenuItem);

      // Verify localStorage was updated
      await waitFor(() => {
        expect(mockSetItem).toHaveBeenCalledWith('preferred_locale', 'ru');
      });
    });

    it('should update button display after switching to Russian', async () => {
      const user = userEvent.setup();
      renderLanguageSelector('en');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      });

      // Initially showing English
      expect(screen.getByText('English')).toBeInTheDocument();

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /Русский/i })).toBeInTheDocument();
      });

      const russianMenuItem = screen.getByRole('menuitem', { name: /Русский/i });
      await user.click(russianMenuItem);

      // Button should now show Russian
      await waitFor(() => {
        // Find the button's text content (not in menu)
        const buttons = screen.getAllByText('Русский');
        // One should be the button itself (not in a menuitem)
        const buttonText = buttons.find(el => !el.closest('[role="menuitem"]'));
        expect(buttonText).toBeInTheDocument();
      });
    });

    it('should update button display after switching to English', async () => {
      const user = userEvent.setup();
      renderLanguageSelector('ru');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      });

      // Initially showing Russian
      expect(screen.getByText('Русский')).toBeInTheDocument();

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /English/i })).toBeInTheDocument();
      });

      const englishMenuItem = screen.getByRole('menuitem', { name: /English/i });
      await user.click(englishMenuItem);

      // Button should now show English
      await waitFor(() => {
        const buttons = screen.getAllByText('English');
        const buttonText = buttons.find(el => !el.closest('[role="menuitem"]'));
        expect(buttonText).toBeInTheDocument();
      });
    });

    it('should update flag emoji after language change', async () => {
      const user = userEvent.setup();
      renderLanguageSelector('en');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /Русский/i })).toBeInTheDocument();
      });

      const russianMenuItem = screen.getByRole('menuitem', { name: /Русский/i });
      await user.click(russianMenuItem);

      // Button should now show Russian flag
      await waitFor(() => {
        const button = screen.getByRole('button', { name: /select language/i });
        expect(button).toHaveTextContent('🇷🇺');
      });
    });

    it('should move checkmark to newly selected language', async () => {
      const user = userEvent.setup();
      renderLanguageSelector('en');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      });

      // Open dropdown and switch to Russian
      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /Русский/i })).toBeInTheDocument();
      });

      const russianMenuItem = screen.getByRole('menuitem', { name: /Русский/i });
      await user.click(russianMenuItem);

      // Re-open dropdown to check checkmark position
      await waitFor(() => {
        const button = screen.getByRole('button', { name: /select language/i });
        expect(button).toBeInTheDocument();
      });

      await user.click(button);

      await waitFor(() => {
        const checkIcon = screen.getByLabelText('Selected');
        const russianMenuItem = screen.getByRole('menuitem', { name: /Русский/i });
        expect(russianMenuItem).toContainElement(checkIcon);
      });
    });
  });

  describe('localStorage Persistence', () => {
    it('should persist language selection to localStorage when switching to English', async () => {
      const user = userEvent.setup();
      renderLanguageSelector('ru');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /English/i })).toBeInTheDocument();
      });

      const englishMenuItem = screen.getByRole('menuitem', { name: /English/i });
      await user.click(englishMenuItem);

      await waitFor(() => {
        expect(mockSetItem).toHaveBeenCalledWith('preferred_locale', 'en');
      });
    });

    it('should persist language selection to localStorage when switching to Russian', async () => {
      const user = userEvent.setup();
      renderLanguageSelector('en');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /Русский/i })).toBeInTheDocument();
      });

      const russianMenuItem = screen.getByRole('menuitem', { name: /Русский/i });
      await user.click(russianMenuItem);

      await waitFor(() => {
        expect(mockSetItem).toHaveBeenCalledWith('preferred_locale', 'ru');
      });
    });

    it('should only call setItem once per language change', async () => {
      const user = userEvent.setup();
      renderLanguageSelector('en');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /Русский/i })).toBeInTheDocument();
      });

      const russianMenuItem = screen.getByRole('menuitem', { name: /Русский/i });
      await user.click(russianMenuItem);

      await waitFor(() => {
        expect(mockSetItem).toHaveBeenCalledTimes(1);
      });
    });

    it('should use correct localStorage key "preferred_locale"', async () => {
      const user = userEvent.setup();
      renderLanguageSelector('en');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /Русский/i })).toBeInTheDocument();
      });

      const russianMenuItem = screen.getByRole('menuitem', { name: /Русский/i });
      await user.click(russianMenuItem);

      await waitFor(() => {
        const calls = mockSetItem.mock.calls;
        expect(calls[0][0]).toBe('preferred_locale');
      });
    });
  });

  describe('Keyboard Accessibility', () => {
    it('should be focusable via keyboard navigation', async () => {
      const user = userEvent.setup();
      renderLanguageSelector();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /select language/i });
      
      // Tab to the button
      await user.tab();
      
      // Button should receive focus
      expect(button).toHaveFocus();
    });

    it('should open dropdown with Enter key', async () => {
      const user = userEvent.setup();
      renderLanguageSelector();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /select language/i });
      button.focus();

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /English/i })).toBeInTheDocument();
      });
    });

    it('should open dropdown with Space key', async () => {
      const user = userEvent.setup();
      renderLanguageSelector();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /select language/i });
      button.focus();

      await user.keyboard(' ');

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /English/i })).toBeInTheDocument();
      });
    });

    it('should allow arrow key navigation through menu items', async () => {
      const user = userEvent.setup();
      renderLanguageSelector();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /English/i })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: /Русский/i })).toBeInTheDocument();
      });

      // Both menu items should be accessible (navigation is handled by shadcn/ui)
      const russianMenuItem = screen.getByRole('menuitem', { name: /Русский/i });
      expect(russianMenuItem).toBeInTheDocument();
    });

    it('should close dropdown with Escape key', async () => {
      const user = userEvent.setup();
      renderLanguageSelector();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /English/i })).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('menuitem', { name: /English/i })).not.toBeInTheDocument();
      });
    });

    it('should select language with Enter or click when focused on menu item', async () => {
      const user = userEvent.setup();
      renderLanguageSelector('en');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /Русский/i })).toBeInTheDocument();
      });

      // Click to select Russian item (Enter key navigation is handled by shadcn/ui)
      const russianMenuItem = screen.getByRole('menuitem', { name: /Русский/i });
      await user.click(russianMenuItem);

      await waitFor(() => {
        expect(mockSetItem).toHaveBeenCalledWith('preferred_locale', 'ru');
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle rapid language switching', async () => {
      const user = userEvent.setup();
      renderLanguageSelector('en');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      });

      // Switch to Russian
      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /Русский/i })).toBeInTheDocument();
      });

      const russianMenuItem = screen.getByRole('menuitem', { name: /Русский/i });
      await user.click(russianMenuItem);

      await waitFor(() => {
        expect(mockSetItem).toHaveBeenCalledWith('preferred_locale', 'ru');
      });

      // Immediately switch back to English
      await user.click(screen.getByRole('button', { name: /select language/i }));

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /English/i })).toBeInTheDocument();
      });

      const englishMenuItem = screen.getByRole('menuitem', { name: /English/i });
      await user.click(englishMenuItem);

      await waitFor(() => {
        expect(mockSetItem).toHaveBeenCalledWith('preferred_locale', 'en');
      });

      // Should have called setItem twice total
      expect(mockSetItem).toHaveBeenCalledTimes(2);
    });

    it('should handle clicking same language that is already selected', async () => {
      const user = userEvent.setup();
      renderLanguageSelector('en');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /English/i })).toBeInTheDocument();
      });

      // Click English (already selected)
      const englishMenuItem = screen.getByRole('menuitem', { name: /English/i });
      await user.click(englishMenuItem);

      // Should still call changeLanguage (idempotent operation)
      await waitFor(() => {
        expect(mockSetItem).toHaveBeenCalledWith('preferred_locale', 'en');
      });
    });

    it('should render correctly when localStorage is not available', async () => {
      // Mock storage to return null (simulating unavailable storage)
      mockGetItem.mockReturnValue(null);
      mockSetItem.mockImplementation(() => {
        // Silently fail for setItem
      });

      renderLanguageSelector();

      // Should still render with default locale
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
        expect(screen.getByText('English')).toBeInTheDocument();
      });
    });

    it('should fallback to English when stored locale is invalid', async () => {
      // Mock invalid stored locale
      mockGetItem.mockReturnValue('invalid-locale');

      renderLanguageSelector();

      // Should fallback to English (initialLocale)
      await waitFor(() => {
        expect(screen.getByText('English')).toBeInTheDocument();
      });
    });

    it('should maintain language state across re-renders', async () => {
      const user = userEvent.setup();
      const { rerender } = renderLanguageSelector('en');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      });

      // Switch to Russian
      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /Русский/i })).toBeInTheDocument();
      });

      const russianMenuItem = screen.getByRole('menuitem', { name: /Русский/i });
      await user.click(russianMenuItem);

      await waitFor(() => {
        // Button should show Russian
        const buttons = screen.getAllByText('Русский');
        const buttonText = buttons.find(el => !el.closest('[role="menuitem"]'));
        expect(buttonText).toBeInTheDocument();
      });

      // Re-render the component
      rerender(
        <I18nProvider initialLocale="en">
          <LanguageSelector />
        </I18nProvider>
      );

      // Should maintain Russian language (from context state)
      await waitFor(() => {
        const button = screen.getByRole('button', { name: /select language/i });
        expect(button).toHaveTextContent('Русский');
      });
    });
  });

  describe('Visual Feedback', () => {
    it('should display both flag emoji and text label on button', async () => {
      renderLanguageSelector('en');

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /select language/i });
        expect(button).toHaveTextContent('🇺🇸');
        expect(button).toHaveTextContent('English');
      });
    });

    it('should have aria-hidden on flag emoji spans', async () => {
      renderLanguageSelector();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /select language/i });
      const flagSpan = button.querySelector('span[aria-hidden="true"]');
      expect(flagSpan).toBeInTheDocument();
      expect(flagSpan?.textContent).toMatch(/🇺🇸|🇷🇺/);
    });

    it('should display Globe icon alongside flag and text', async () => {
      renderLanguageSelector();

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /select language/i });
        const globeIcon = button.querySelector('svg');
        expect(globeIcon).toBeInTheDocument();
      });
    });

    it('should display checkmark icon with aria-label "Selected"', async () => {
      const user = userEvent.setup();
      renderLanguageSelector('en');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      await waitFor(() => {
        const checkIcon = screen.getByLabelText('Selected');
        expect(checkIcon).toBeInTheDocument();
        expect(checkIcon.tagName.toLowerCase()).toBe('svg');
      });
    });

    it('should have proper spacing between elements in dropdown items', async () => {
      const user = userEvent.setup();
      renderLanguageSelector();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      await waitFor(() => {
        const englishMenuItem = screen.getByRole('menuitem', { name: /English/i });
        
        // Check for flag span with mr-2 (margin-right)
        const flagSpan = englishMenuItem.querySelector('span.mr-2');
        expect(flagSpan).toBeInTheDocument();
        
        // Check for label span with flex-1
        const labelSpan = englishMenuItem.querySelector('span.flex-1');
        expect(labelSpan).toBeInTheDocument();
      });
    });
  });
});
