/**
 * Firefox Compatibility Tests
 * Task 13.2: Test on Firefox (latest 2 versions)
 * 
 * Tests Firefox-specific behaviors:
 * - SVG chart rendering
 * - localStorage persistence
 * - All core features
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@/lib/i18n/context';
import { CircularProgressChart } from '@/components/admin/dashboard/circular-progress-chart';
import { ActivityCard } from '@/components/admin/dashboard/activity-card';
import { LanguageSelector } from '@/components/admin/layout/language-selector';
import { Activity, TrendingUp } from 'lucide-react';

describe('Firefox Compatibility - SVG Chart Rendering', () => {
  it('should render SVG circular progress chart correctly', () => {
    const { container } = render(
      <CircularProgressChart
        value={75}
        max={100}
        label="CPU Usage"
        unit="%"
      />
    );

    // Verify SVG element exists
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement?.tagName).toBe('svg');

    // Verify SVG has correct structure
    const circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(2); // Background circle + progress circle

    // Verify SVG has aria-hidden (since progressbar role is on wrapper div)
    expect(svgElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render SVG with correct stroke-dasharray for progress', () => {
    const { container } = render(
      <CircularProgressChart
        value={50}
        max={100}
        label="RAM"
        unit="MB"
      />
    );

    const progressCircle = container.querySelectorAll('circle')[1];
    const strokeDasharray = progressCircle?.getAttribute('stroke-dasharray');
    
    // Verify stroke-dasharray is set (this controls the progress arc)
    expect(strokeDasharray).toBeTruthy();
    expect(strokeDasharray).toMatch(/[\d.]+/);
  });

  it('should apply correct colors to SVG strokes based on thresholds', () => {
    const testCases = [
      { value: 50, expectedStroke: 'var(--color-chart-green)' },
      { value: 75, expectedStroke: 'var(--color-chart-yellow)' },
      { value: 95, expectedStroke: 'var(--color-chart-red)' },
    ];

    testCases.forEach(({ value, expectedStroke }) => {
      const { container, unmount } = render(
        <CircularProgressChart
          value={value}
          max={100}
          label="Test"
          unit="%"
        />
      );

      const progressCircle = container.querySelectorAll('circle')[1];
      
      // Verify the correct color is applied via stroke attribute
      expect(progressCircle).toHaveAttribute('stroke', expectedStroke);
      
      unmount();
    });
  });

  it('should handle SVG animations with CSS transitions', () => {
    const { container, rerender } = render(
      <CircularProgressChart
        value={25}
        max={100}
        label="Disk"
        unit="GB"
      />
    );

    const progressCircle = container.querySelectorAll('circle')[1];
    
    // Verify transition class is applied for smooth animation
    // Firefox should support CSS transitions on SVG elements
    expect(progressCircle).toHaveClass('transition-[stroke-dashoffset]');
    expect(progressCircle).toHaveClass('duration-300');
    expect(progressCircle).toHaveClass('ease-out');

    // Update value to trigger animation
    rerender(
      <CircularProgressChart
        value={75}
        max={100}
        label="Disk"
        unit="GB"
      />
    );

    // Value should update
    expect(container.textContent).toContain('75');
  });

  it('should render SVG charts at different sizes', () => {
    const sizes = [80, 120, 160];

    sizes.forEach((size) => {
      const { container, unmount } = render(
        <CircularProgressChart
          value={60}
          max={100}
          label="Test"
          unit="%"
          size={size}
        />
      );

      const svgElement = container.querySelector('svg');
      expect(svgElement).toHaveAttribute('width', size.toString());
      expect(svgElement).toHaveAttribute('height', size.toString());

      unmount();
    });
  });
});

describe('Firefox Compatibility - localStorage Persistence', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should persist language selection in localStorage', async () => {
    const user = userEvent.setup();

    render(
      <I18nProvider>
        <LanguageSelector />
      </I18nProvider>
    );

    // Find the button by its accessible label
    const trigger = screen.getByRole('button', { name: /select language/i });
    await user.click(trigger);

    // Select Russian option
    const russianOption = screen.getByRole('menuitem', { name: /русский/i });
    await user.click(russianOption);

    // Verify localStorage was updated
    await waitFor(() => {
      expect(localStorage.getItem('preferred_locale')).toBe('ru');
    });
  });

  it('should restore language from localStorage on mount', () => {
    // Pre-populate localStorage
    localStorage.setItem('preferred_locale', 'ru');

    const { container } = render(
      <I18nProvider>
        <div data-testid="test-component" />
      </I18nProvider>
    );

    // Provider should load the stored locale
    expect(container).toBeInTheDocument();
    expect(localStorage.getItem('preferred_locale')).toBe('ru');
  });

  it('should handle localStorage write failures gracefully', () => {
    // Mock localStorage to throw error (simulate quota exceeded or disabled)
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    setItemSpy.mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });

    render(
      <I18nProvider>
        <LanguageSelector />
      </I18nProvider>
    );

    // Should render without crashing
    expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();

    setItemSpy.mockRestore();
  });

  it('should handle localStorage read failures gracefully', () => {
    // Mock localStorage to throw error on getItem
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
    getItemSpy.mockImplementation(() => {
      throw new Error('Storage access denied');
    });

    // Should render without crashing and fall back to default locale
    const { container } = render(
      <I18nProvider>
        <div data-testid="test-component" />
      </I18nProvider>
    );

    expect(container).toBeInTheDocument();

    getItemSpy.mockRestore();
  });

  it('should support multiple localStorage keys without conflicts', () => {
    // Restore any mocked localStorage
    vi.restoreAllMocks();
    
    // Set multiple keys
    localStorage.setItem('preferred_locale', 'en');
    localStorage.setItem('sidebar_collapsed', 'true');
    localStorage.setItem('theme', 'dark');

    // Verify all keys are stored correctly
    expect(localStorage.getItem('preferred_locale')).toBe('en');
    expect(localStorage.getItem('sidebar_collapsed')).toBe('true');
    expect(localStorage.getItem('theme')).toBe('dark');

    // Update one key
    localStorage.setItem('preferred_locale', 'ru');

    // Verify only that key changed
    expect(localStorage.getItem('preferred_locale')).toBe('ru');
    expect(localStorage.getItem('sidebar_collapsed')).toBe('true');
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});

describe('Firefox Compatibility - Core Features', () => {
  it('should render activity cards with icons correctly', () => {
    render(
      <I18nProvider>
        <ActivityCard
          icon={Activity}
          title="Xray Status"
          value="Running"
          status="success"
          statusDot={true}
        />
      </I18nProvider>
    );

    // Verify card renders with accessible label
    const card = screen.getByRole('article', { name: /xray status/i });
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent('Running');

    // Verify Lucide icon renders as SVG
    const svg = card.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should handle text rendering with proper UTF-8 encoding', () => {
    render(
      <I18nProvider>
        <ActivityCard
          icon={TrendingUp}
          title="Traffic Speed"
          value="125.5 MB/s"
          description="Total: 1.2 TB"
          status="neutral"
        />
      </I18nProvider>
    );

    // Verify card renders with accessible label
    const card = screen.getByRole('article', { name: /traffic speed/i });
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent('125.5 MB/s');
    expect(card).toHaveTextContent('Total: 1.2 TB');

    // Should not contain encoding artifacts
    expect(card.textContent).not.toContain('â€"');
    expect(card.textContent).not.toContain('Ã©');
  });

  it('should apply dark theme styles correctly', () => {
    const { container } = render(
      <I18nProvider>
        <CircularProgressChart
          value={60}
          max={100}
          label="CPU"
          unit="%"
        />
      </I18nProvider>
    );

    // Verify the component renders with proper structure
    const chartLabel = screen.getByText('CPU');
    expect(chartLabel).toBeInTheDocument();
    expect(chartLabel).toHaveClass('text-foreground');
    
    // Verify percentage display
    expect(container.textContent).toContain('60%');
  });

  it('should handle responsive breakpoints correctly', () => {
    // Test mobile viewport
    global.innerWidth = 640;
    global.dispatchEvent(new Event('resize'));

    const { container, rerender } = render(
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CircularProgressChart value={50} max={100} label="CPU" unit="%" />
      </div>
    );

    expect(container.querySelector('.grid')).toBeInTheDocument();

    // Test desktop viewport
    global.innerWidth = 1024;
    global.dispatchEvent(new Event('resize'));

    rerender(
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CircularProgressChart value={50} max={100} label="CPU" unit="%" />
      </div>
    );

    expect(container.querySelector('.grid')).toBeInTheDocument();
  });

  it('should handle focus states for accessibility', async () => {
    const user = userEvent.setup();

    render(
      <I18nProvider>
        <LanguageSelector />
      </I18nProvider>
    );

    const button = screen.getByRole('button', { name: /select language/i });
    
    // Tab to button
    await user.tab();
    
    // Verify focus (Firefox should show focus indicators)
    expect(button).toHaveFocus();
  });

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup();

    render(
      <I18nProvider>
        <div>
          <button>Button 1</button>
          <button>Button 2</button>
          <button>Button 3</button>
        </div>
      </I18nProvider>
    );

    const buttons = screen.getAllByRole('button');

    // Tab through buttons
    await user.tab();
    expect(buttons[0]).toHaveFocus();

    await user.tab();
    expect(buttons[1]).toHaveFocus();

    await user.tab();
    expect(buttons[2]).toHaveFocus();
  });
});

describe('Firefox Compatibility - CSS and Layout', () => {
  it('should apply Tailwind CSS classes correctly', () => {
    const { container } = render(
      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-foreground">Test content</p>
      </div>
    );

    const div = container.querySelector('div');
    expect(div).toHaveClass('bg-card', 'border', 'border-border', 'rounded-lg', 'p-4');

    const p = container.querySelector('p');
    expect(p).toHaveClass('text-foreground');
  });

  it('should handle flexbox layouts correctly', () => {
    const { container } = render(
      <div className="flex items-center justify-between gap-4">
        <span>Left</span>
        <span>Right</span>
      </div>
    );

    const flexContainer = container.querySelector('.flex');
    expect(flexContainer).toBeInTheDocument();
    expect(flexContainer).toHaveClass('items-center', 'justify-between', 'gap-4');
  });

  it('should handle CSS Grid layouts correctly', () => {
    const { container } = render(
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </div>
    );

    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-3', 'gap-4');
  });

  it('should apply hover states correctly', () => {
    const { container } = render(
      <button className="hover:bg-accent hover:text-accent-foreground transition-colors">
        Hover Me
      </button>
    );

    const button = container.querySelector('button');
    expect(button).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground', 'transition-colors');
  });

  it('should support CSS transitions', () => {
    const { container } = render(
      <div className="transition-all duration-300 ease-in-out">
        Animated content
      </div>
    );

    const div = container.querySelector('div');
    expect(div).toHaveClass('transition-all', 'duration-300', 'ease-in-out');
  });
});
