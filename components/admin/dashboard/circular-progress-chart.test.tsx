/**
 * Unit Tests for CircularProgressChart Component
 * 
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.11, 2.7, 11.1
 * 
 * Test Coverage:
 * - Value rendering with various inputs (0, 50, 100, edge cases)
 * - Color threshold logic (green 0-69%, yellow 70-89%, red 90-100%)
 * - Animation transition properties
 * - ARIA attributes (role, aria-valuenow, aria-valuemin, aria-valuemax, aria-label)
 * - SVG rendering and stroke-dashoffset calculations
 * - Responsive sizing and custom props
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CircularProgressChart, getChartColor } from './circular-progress-chart';

describe('CircularProgressChart', () => {
  beforeEach(() => {
    // Mock CSS custom properties for color testing
    vi.spyOn(window, 'getComputedStyle').mockImplementation(() => ({
      getPropertyValue: (prop: string) => {
        const colors: Record<string, string> = {
          '--color-chart-green': '#22c55e',
          '--color-chart-yellow': '#eab308',
          '--color-chart-red': '#ef4444',
        };
        return colors[prop] || '';
      },
    } as CSSStyleDeclaration));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Value Rendering', () => {
    it('should render with value 0 and display 0%', () => {
      render(
        <CircularProgressChart
          value={0}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      // Check displayed value
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByText('CPU')).toBeInTheDocument();
    });

    it('should render with value 50 and display 50%', () => {
      render(
        <CircularProgressChart
          value={50}
          max={100}
          label="RAM"
          unit="%"
        />
      );

      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText('RAM')).toBeInTheDocument();
    });

    it('should render with value 100 and display 100%', () => {
      render(
        <CircularProgressChart
          value={100}
          max={100}
          label="Disk"
          unit="%"
        />
      );

      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('Disk')).toBeInTheDocument();
    });

    it('should handle non-percentage units (MB)', () => {
      render(
        <CircularProgressChart
          value={1024}
          max={4096}
          label="Memory"
          unit="MB"
        />
      );

      expect(screen.getByText('1024')).toBeInTheDocument();
      expect(screen.getByText('MB')).toBeInTheDocument();
      expect(screen.getByText('25%')).toBeInTheDocument(); // 1024/4096 = 25%
    });

    it('should handle non-percentage units (GB)', () => {
      render(
        <CircularProgressChart
          value={50}
          max={200}
          label="Storage"
          unit="GB"
        />
      );

      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('GB')).toBeInTheDocument();
      expect(screen.getByText('25%')).toBeInTheDocument(); // 50/200 = 25%
    });

    it('should round decimal values to nearest integer', () => {
      render(
        <CircularProgressChart
          value={45.7}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      // Should round 45.7 to 46
      expect(screen.getByText('46')).toBeInTheDocument();
      expect(screen.getByText('46%')).toBeInTheDocument();
    });

    it('should handle value exceeding max by capping at 100%', () => {
      render(
        <CircularProgressChart
          value={150}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      // Value should display as-is (150)
      expect(screen.getByText('150')).toBeInTheDocument();
      // Percentage should cap at 100%
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should handle negative values by displaying 0%', () => {
      render(
        <CircularProgressChart
          value={-10}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      // Negative value should display as-is but percentage should be 0
      expect(screen.getByText('-10')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should handle max value of 0 by displaying 0%', () => {
      render(
        <CircularProgressChart
          value={50}
          max={0}
          label="CPU"
          unit="%"
        />
      );

      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should handle very small decimal percentages', () => {
      render(
        <CircularProgressChart
          value={1}
          max={1000}
          label="CPU"
          unit="%"
        />
      );

      expect(screen.getByText('1')).toBeInTheDocument();
      // 1/1000 = 0.1%, rounds to 0%
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  describe('Color Threshold Logic', () => {
    describe('getChartColor function', () => {
      it('should return green for 0%', () => {
        expect(getChartColor(0)).toBe('var(--color-chart-green)');
      });

      it('should return green for 50%', () => {
        expect(getChartColor(50)).toBe('var(--color-chart-green)');
      });

      it('should return green for 69% (boundary)', () => {
        expect(getChartColor(69)).toBe('var(--color-chart-green)');
      });

      it('should return yellow for 70% (threshold)', () => {
        expect(getChartColor(70)).toBe('var(--color-chart-yellow)');
      });

      it('should return yellow for 80%', () => {
        expect(getChartColor(80)).toBe('var(--color-chart-yellow)');
      });

      it('should return yellow for 89% (boundary)', () => {
        expect(getChartColor(89)).toBe('var(--color-chart-yellow)');
      });

      it('should return red for 90% (threshold)', () => {
        expect(getChartColor(90)).toBe('var(--color-chart-red)');
      });

      it('should return red for 95%', () => {
        expect(getChartColor(95)).toBe('var(--color-chart-red)');
      });

      it('should return red for 100%', () => {
        expect(getChartColor(100)).toBe('var(--color-chart-red)');
      });

      it('should handle decimal percentages correctly', () => {
        expect(getChartColor(69.9)).toBe('var(--color-chart-green)');
        expect(getChartColor(70.0)).toBe('var(--color-chart-yellow)');
        expect(getChartColor(89.9)).toBe('var(--color-chart-yellow)');
        expect(getChartColor(90.0)).toBe('var(--color-chart-red)');
      });
    });

    it('should apply green color when value is 30/100', () => {
      const { container } = render(
        <CircularProgressChart
          value={30}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      const progressCircle = container.querySelector('circle[stroke="var(--color-chart-green)"]');
      expect(progressCircle).toBeInTheDocument();
    });

    it('should apply yellow color when value is 75/100', () => {
      const { container } = render(
        <CircularProgressChart
          value={75}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      const progressCircle = container.querySelector('circle[stroke="var(--color-chart-yellow)"]');
      expect(progressCircle).toBeInTheDocument();
    });

    it('should apply red color when value is 95/100', () => {
      const { container } = render(
        <CircularProgressChart
          value={95}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      const progressCircle = container.querySelector('circle[stroke="var(--color-chart-red)"]');
      expect(progressCircle).toBeInTheDocument();
    });

    it('should respect explicit color override with green', () => {
      const { container } = render(
        <CircularProgressChart
          value={95}
          max={100}
          label="CPU"
          unit="%"
          color="green"
        />
      );

      // Even though 95% should be red, explicit green override should apply
      const progressCircle = container.querySelector('circle[stroke="var(--color-chart-green)"]');
      expect(progressCircle).toBeInTheDocument();
    });

    it('should respect explicit color override with yellow', () => {
      const { container } = render(
        <CircularProgressChart
          value={30}
          max={100}
          label="CPU"
          unit="%"
          color="yellow"
        />
      );

      const progressCircle = container.querySelector('circle[stroke="var(--color-chart-yellow)"]');
      expect(progressCircle).toBeInTheDocument();
    });

    it('should respect explicit color override with red', () => {
      const { container } = render(
        <CircularProgressChart
          value={30}
          max={100}
          label="CPU"
          unit="%"
          color="red"
        />
      );

      const progressCircle = container.querySelector('circle[stroke="var(--color-chart-red)"]');
      expect(progressCircle).toBeInTheDocument();
    });
  });

  describe('SVG Rendering and Geometry', () => {
    it('should render SVG with default size of 120px', () => {
      const { container } = render(
        <CircularProgressChart
          value={50}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '120');
      expect(svg).toHaveAttribute('height', '120');
    });

    it('should render SVG with custom size', () => {
      const { container } = render(
        <CircularProgressChart
          value={50}
          max={100}
          label="CPU"
          unit="%"
          size={150}
        />
      );

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '150');
      expect(svg).toHaveAttribute('height', '150');
    });

    it('should render two circles (background and progress)', () => {
      const { container } = render(
        <CircularProgressChart
          value={50}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      const circles = container.querySelectorAll('circle');
      expect(circles).toHaveLength(2);
    });

    it('should set background circle with gray stroke', () => {
      const { container } = render(
        <CircularProgressChart
          value={50}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      const backgroundCircle = container.querySelector('circle[stroke="#2a2a2a"]');
      expect(backgroundCircle).toBeInTheDocument();
    });

    it('should apply default strokeWidth of 8px', () => {
      const { container } = render(
        <CircularProgressChart
          value={50}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      const circles = container.querySelectorAll('circle');
      circles.forEach(circle => {
        expect(circle.getAttribute('stroke-width')).toBe('8');
      });
    });

    it('should apply custom strokeWidth', () => {
      const { container } = render(
        <CircularProgressChart
          value={50}
          max={100}
          label="CPU"
          unit="%"
          strokeWidth={12}
        />
      );

      const circles = container.querySelectorAll('circle');
      circles.forEach(circle => {
        expect(circle.getAttribute('stroke-width')).toBe('12');
      });
    });

    it('should calculate correct radius based on size and strokeWidth', () => {
      const size = 120;
      const strokeWidth = 8;
      const expectedRadius = (size - strokeWidth) / 2; // (120 - 8) / 2 = 56

      const { container } = render(
        <CircularProgressChart
          value={50}
          max={100}
          label="CPU"
          unit="%"
          size={size}
          strokeWidth={strokeWidth}
        />
      );

      const circles = container.querySelectorAll('circle');
      circles.forEach(circle => {
        expect(circle.getAttribute('r')).toBe(expectedRadius.toString());
      });
    });

    it('should center circles at SVG midpoint', () => {
      const size = 120;
      const center = size / 2; // 60

      const { container } = render(
        <CircularProgressChart
          value={50}
          max={100}
          label="CPU"
          unit="%"
          size={size}
        />
      );

      const circles = container.querySelectorAll('circle');
      circles.forEach(circle => {
        expect(circle.getAttribute('cx')).toBe(center.toString());
        expect(circle.getAttribute('cy')).toBe(center.toString());
      });
    });

    it('should set stroke-linecap to round for smooth edges', () => {
      const { container } = render(
        <CircularProgressChart
          value={50}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      // Progress circle (second circle) should have rounded linecap
      const progressCircle = container.querySelectorAll('circle')[1];
      expect(progressCircle.getAttribute('stroke-linecap')).toBe('round');
    });

    it('should calculate correct stroke-dasharray based on circumference', () => {
      const size = 120;
      const strokeWidth = 8;
      const radius = (size - strokeWidth) / 2; // 56
      const circumference = 2 * Math.PI * radius; // ~351.86

      const { container } = render(
        <CircularProgressChart
          value={50}
          max={100}
          label="CPU"
          unit="%"
          size={size}
          strokeWidth={strokeWidth}
        />
      );

      const progressCircle = container.querySelectorAll('circle')[1];
      const dashArray = progressCircle.getAttribute('stroke-dasharray');
      expect(parseFloat(dashArray!)).toBeCloseTo(circumference, 0);
    });

    it('should calculate correct stroke-dashoffset for 0% progress', async () => {
      const size = 120;
      const strokeWidth = 8;
      const radius = (size - strokeWidth) / 2;
      const circumference = 2 * Math.PI * radius;

      const { container } = render(
        <CircularProgressChart
          value={0}
          max={100}
          label="CPU"
          unit="%"
          size={size}
          strokeWidth={strokeWidth}
        />
      );

      // Wait for useEffect to update percentage
      await waitFor(() => {
        const progressCircle = container.querySelectorAll('circle')[1];
        const dashOffset = progressCircle.getAttribute('stroke-dashoffset');
        // At 0%, dashoffset should equal circumference (no progress shown)
        expect(parseFloat(dashOffset!)).toBeCloseTo(circumference, 0);
      });
    });

    it('should calculate correct stroke-dashoffset for 50% progress', async () => {
      const size = 120;
      const strokeWidth = 8;
      const radius = (size - strokeWidth) / 2;
      const circumference = 2 * Math.PI * radius;
      const expectedOffset = circumference - (50 / 100) * circumference;

      const { container } = render(
        <CircularProgressChart
          value={50}
          max={100}
          label="CPU"
          unit="%"
          size={size}
          strokeWidth={strokeWidth}
        />
      );

      await waitFor(() => {
        const progressCircle = container.querySelectorAll('circle')[1];
        const dashOffset = progressCircle.getAttribute('stroke-dashoffset');
        expect(parseFloat(dashOffset!)).toBeCloseTo(expectedOffset, 0);
      });
    });

    it('should calculate correct stroke-dashoffset for 100% progress', async () => {
      const size = 120;
      const strokeWidth = 8;

      const { container } = render(
        <CircularProgressChart
          value={100}
          max={100}
          label="CPU"
          unit="%"
          size={size}
          strokeWidth={strokeWidth}
        />
      );

      await waitFor(() => {
        const progressCircle = container.querySelectorAll('circle')[1];
        const dashOffset = progressCircle.getAttribute('stroke-dashoffset');
        // At 100%, dashoffset should be 0 (full circle shown)
        expect(parseFloat(dashOffset!)).toBeCloseTo(0, 0);
      });
    });
  });

  describe('Animation Transitions', () => {
    it('should apply transition class to progress circle', () => {
      const { container } = render(
        <CircularProgressChart
          value={50}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      const progressCircle = container.querySelectorAll('circle')[1];
      expect(progressCircle.classList.contains('transition-[stroke-dashoffset]')).toBe(true);
    });

    it('should apply duration-300 class for 300ms transition', () => {
      const { container } = render(
        <CircularProgressChart
          value={50}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      const progressCircle = container.querySelectorAll('circle')[1];
      expect(progressCircle.classList.contains('duration-300')).toBe(true);
    });

    it('should apply ease-out timing function', () => {
      const { container } = render(
        <CircularProgressChart
          value={50}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      const progressCircle = container.querySelectorAll('circle')[1];
      expect(progressCircle.classList.contains('ease-out')).toBe(true);
    });

    it('should have will-change: stroke-dashoffset for GPU acceleration', () => {
      const { container } = render(
        <CircularProgressChart
          value={50}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      const progressCircle = container.querySelectorAll('circle')[1];
      const style = progressCircle.getAttribute('style');
      expect(style).toContain('will-change: stroke-dashoffset');
    });

    it('should rotate SVG -90 degrees for top-start position', () => {
      const { container } = render(
        <CircularProgressChart
          value={50}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      const svg = container.querySelector('svg');
      expect(svg?.classList.contains('transform')).toBe(true);
      expect(svg?.classList.contains('-rotate-90')).toBe(true);
    });
  });

  describe('ARIA Attributes', () => {
    it('should have role="progressbar"', () => {
      render(
        <CircularProgressChart
          value={50}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });

    it('should have aria-valuenow with current percentage', () => {
      render(
        <CircularProgressChart
          value={50}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '50');
    });

    it('should have aria-valuemin="0"', () => {
      render(
        <CircularProgressChart
          value={50}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    });

    it('should have aria-valuemax="100"', () => {
      render(
        <CircularProgressChart
          value={50}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    });

    it('should have default aria-label with metric description', () => {
      render(
        <CircularProgressChart
          value={50}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      const progressbar = screen.getByRole('progressbar');
      const ariaLabel = progressbar.getAttribute('aria-label');
      expect(ariaLabel).toContain('CPU');
      expect(ariaLabel).toContain('50%');
      expect(ariaLabel).toContain('100%');
      expect(ariaLabel).toContain('50 percent');
    });

    it('should respect custom ariaLabel prop', () => {
      render(
        <CircularProgressChart
          value={1024}
          max={4096}
          label="Memory"
          unit="MB"
          ariaLabel="Memory usage: 1024 out of 4096 megabytes, 25 percent"
        />
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute(
        'aria-label',
        'Memory usage: 1024 out of 4096 megabytes, 25 percent'
      );
    });

    it('should have aria-live region for real-time updates', () => {
      const { container } = render(
        <CircularProgressChart
          value={50}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });

    it('should have screen-reader-only class on live region', () => {
      const { container } = render(
        <CircularProgressChart
          value={50}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion?.classList.contains('sr-only')).toBe(true);
    });

    it('should update live region text with current values', () => {
      const { container } = render(
        <CircularProgressChart
          value={75}
          max={100}
          label="RAM"
          unit="%"
        />
      );

      const liveRegion = container.querySelector('[aria-live="polite"]');
      const text = liveRegion?.textContent;
      expect(text).toContain('RAM updated');
      expect(text).toContain('75%');
      expect(text).toContain('75 percent');
    });

    it('should have aria-hidden on SVG to avoid duplicate announcements', () => {
      const { container } = render(
        <CircularProgressChart
          value={50}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('should round aria-valuenow to nearest integer', () => {
      render(
        <CircularProgressChart
          value={45.7}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '46');
    });

    it('should cap aria-valuenow at 100 for values exceeding max', () => {
      render(
        <CircularProgressChart
          value={150}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '100');
    });

    it('should set aria-valuenow to 0 for negative values', () => {
      render(
        <CircularProgressChart
          value={-10}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    });
  });

  describe('Custom Styling and Props', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <CircularProgressChart
          value={50}
          max={100}
          label="CPU"
          unit="%"
          className="custom-class"
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.classList.contains('custom-class')).toBe(true);
    });

    it('should maintain default flex layout classes', () => {
      const { container } = render(
        <CircularProgressChart
          value={50}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.classList.contains('flex')).toBe(true);
      expect(wrapper.classList.contains('flex-col')).toBe(true);
      expect(wrapper.classList.contains('items-center')).toBe(true);
      expect(wrapper.classList.contains('justify-center')).toBe(true);
    });

    it('should render label with correct styling classes', () => {
      render(
        <CircularProgressChart
          value={50}
          max={100}
          label="CPU Usage"
          unit="%"
        />
      );

      const label = screen.getByText('CPU Usage');
      expect(label.tagName).toBe('P');
      expect(label.classList.contains('mt-3')).toBe(true);
      expect(label.classList.contains('text-sm')).toBe(true);
      expect(label.classList.contains('font-medium')).toBe(true);
    });

    it('should render value with correct text size', () => {
      const { container } = render(
        <CircularProgressChart
          value={50}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      const valueElement = screen.getByText('50').closest('p');
      expect(valueElement?.classList.contains('text-2xl')).toBe(true);
      expect(valueElement?.classList.contains('font-semibold')).toBe(true);
    });

    it('should render unit with muted color', () => {
      const { container } = render(
        <CircularProgressChart
          value={50}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      const unitElement = screen.getByText('%');
      expect(unitElement.classList.contains('text-sm')).toBe(true);
      expect(unitElement.classList.contains('text-muted-foreground')).toBe(true);
    });

    it('should render percentage with muted color', () => {
      const { container } = render(
        <CircularProgressChart
          value={50}
          max={100}
          label="CPU"
          unit="%"
        />
      );

      const percentElement = screen.getByText('50%');
      expect(percentElement.classList.contains('text-xs')).toBe(true);
      expect(percentElement.classList.contains('text-muted-foreground')).toBe(true);
    });
  });
});
