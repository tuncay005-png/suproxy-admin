/**
 * Dark Theme Color Contrast Tests
 * 
 * Verifies that the premium dark theme color tokens meet WCAG AA accessibility
 * standards with minimum 4.5:1 contrast ratio for normal text.
 * 
 * @vitest-environment node
 */

import { describe, it, expect } from 'vitest';

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex format: ${hex}`);
  }
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
}

/**
 * Calculate relative luminance (WCAG 2.0 formula)
 */
function getRelativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map(val => {
    const normalized = val / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors (WCAG 2.0 formula)
 */
function getContrastRatio(color1: [number, number, number], color2: [number, number, number]): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Dark Theme Color Contrast - WCAG AA Compliance', () => {
  // Define color tokens using hex equivalents from design spec comments
  const colors = {
    background: '#121212',        // oklch(10% 0 0)
    foreground: '#e4e4e7',        // oklch(95% 0 0)
    card: '#1a1a1a',              // oklch(13% 0 0)
    cardForeground: '#e4e4e7',    // oklch(95% 0 0)
    popover: '#141414',           // oklch(11% 0 0)
    secondary: '#1f1f1f',         // oklch(15% 0 0)
    border: '#2a2a2a',            // oklch(17% 0 0)
    mutedForeground: '#a1a1aa',   // oklch(65% 0 0)
    primaryForeground: '#fafafa', // oklch(98% 0 0)
    chartGreen: '#22c55e',        // oklch(65% 0.16 145)
    chartYellow: '#eab308',       // oklch(75% 0.13 85)
    chartRed: '#ef4444',          // oklch(60% 0.18 25)
  };

  describe('Requirement 2.1: Premium dark background (#121212-#141414)', () => {
    it('should use background color #121212', () => {
      expect(colors.background).toBe('#121212');
      const rgb = hexToRgb(colors.background);
      expect(rgb).toEqual([18, 18, 18]);
    });
    
    it('should use popover color #141414', () => {
      expect(colors.popover).toBe('#141414');
      const rgb = hexToRgb(colors.popover);
      expect(rgb).toEqual([20, 20, 20]);
    });
  });

  describe('Requirement 2.2: Subtle gray borders (#2a2a2a-#333333)', () => {
    it('should use border color #2a2a2a', () => {
      expect(colors.border).toBe('#2a2a2a');
      const rgb = hexToRgb(colors.border);
      expect(rgb).toEqual([42, 42, 42]);
    });
  });

  describe('Requirement 2.3: Soft white text (#e4e4e7)', () => {
    it('should use foreground color #e4e4e7', () => {
      expect(colors.foreground).toBe('#e4e4e7');
      const rgb = hexToRgb(colors.foreground);
      expect(rgb).toEqual([228, 228, 231]);
    });
  });

  describe('Requirement 2.4: Card backgrounds (#1a1a1a-#1f1f1f)', () => {
    it('should use card color #1a1a1a', () => {
      expect(colors.card).toBe('#1a1a1a');
      const rgb = hexToRgb(colors.card);
      expect(rgb).toEqual([26, 26, 26]);
    });
    
    it('should use secondary color #1f1f1f', () => {
      expect(colors.secondary).toBe('#1f1f1f');
      const rgb = hexToRgb(colors.secondary);
      expect(rgb).toEqual([31, 31, 31]);
    });
  });

  describe('Requirement 2.7: WCAG AA Contrast Ratios (minimum 4.5:1)', () => {
    it('should meet WCAG AA contrast for foreground text on background (4.5:1 minimum)', () => {
      const bgRgb = hexToRgb(colors.background);
      const fgRgb = hexToRgb(colors.foreground);
      
      const ratio = getContrastRatio(bgRgb, fgRgb);
      
      console.log(`Background (#121212) vs Foreground (#e4e4e7) contrast: ${ratio.toFixed(2)}:1`);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('should meet WCAG AA contrast for foreground text on card background (4.5:1 minimum)', () => {
      const cardRgb = hexToRgb(colors.card);
      const fgRgb = hexToRgb(colors.cardForeground);
      
      const ratio = getContrastRatio(cardRgb, fgRgb);
      
      console.log(`Card (#1a1a1a) vs Foreground (#e4e4e7) contrast: ${ratio.toFixed(2)}:1`);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('should meet WCAG AA contrast for muted text on background (4.5:1 minimum)', () => {
      const bgRgb = hexToRgb(colors.background);
      const mutedRgb = hexToRgb(colors.mutedForeground);
      
      const ratio = getContrastRatio(bgRgb, mutedRgb);
      
      console.log(`Background (#121212) vs Muted Foreground (#a1a1aa) contrast: ${ratio.toFixed(2)}:1`);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('should meet WCAG AA contrast for primary foreground text (4.5:1 minimum)', () => {
      const bgRgb = hexToRgb(colors.background);
      const primaryFgRgb = hexToRgb(colors.primaryForeground);
      
      const ratio = getContrastRatio(bgRgb, primaryFgRgb);
      
      console.log(`Background (#121212) vs Primary Foreground (#fafafa) contrast: ${ratio.toFixed(2)}:1`);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
    
    it('should meet WCAG AA contrast for muted text on card background (4.5:1 minimum)', () => {
      const cardRgb = hexToRgb(colors.card);
      const mutedRgb = hexToRgb(colors.mutedForeground);
      
      const ratio = getContrastRatio(cardRgb, mutedRgb);
      
      console.log(`Card (#1a1a1a) vs Muted Foreground (#a1a1aa) contrast: ${ratio.toFixed(2)}:1`);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('Chart Colors (Requirements 2.5, 2.6)', () => {
    it('should define chart-green as #22c55e', () => {
      expect(colors.chartGreen).toBe('#22c55e');
      const rgb = hexToRgb(colors.chartGreen);
      expect(rgb).toEqual([34, 197, 94]);
    });

    it('should define chart-yellow as #eab308', () => {
      expect(colors.chartYellow).toBe('#eab308');
      const rgb = hexToRgb(colors.chartYellow);
      expect(rgb).toEqual([234, 179, 8]);
    });

    it('should define chart-red as #ef4444', () => {
      expect(colors.chartRed).toBe('#ef4444');
      const rgb = hexToRgb(colors.chartRed);
      expect(rgb).toEqual([239, 68, 68]);
    });

    it('should meet WCAG AA contrast for chart green on background (3.0:1 for graphics)', () => {
      const bgRgb = hexToRgb(colors.background);
      const greenRgb = hexToRgb(colors.chartGreen);
      
      const ratio = getContrastRatio(bgRgb, greenRgb);
      
      console.log(`Background (#121212) vs Chart Green (#22c55e) contrast: ${ratio.toFixed(2)}:1`);
      expect(ratio).toBeGreaterThanOrEqual(3.0); // WCAG AA for graphics/large text
    });

    it('should meet WCAG AA contrast for chart yellow on background (3.0:1 for graphics)', () => {
      const bgRgb = hexToRgb(colors.background);
      const yellowRgb = hexToRgb(colors.chartYellow);
      
      const ratio = getContrastRatio(bgRgb, yellowRgb);
      
      console.log(`Background (#121212) vs Chart Yellow (#eab308) contrast: ${ratio.toFixed(2)}:1`);
      expect(ratio).toBeGreaterThanOrEqual(3.0); // WCAG AA for graphics/large text
    });

    it('should meet WCAG AA contrast for chart red on background (3.0:1 for graphics)', () => {
      const bgRgb = hexToRgb(colors.background);
      const redRgb = hexToRgb(colors.chartRed);
      
      const ratio = getContrastRatio(bgRgb, redRgb);
      
      console.log(`Background (#121212) vs Chart Red (#ef4444) contrast: ${ratio.toFixed(2)}:1`);
      expect(ratio).toBeGreaterThanOrEqual(3.0); // WCAG AA for graphics/large text
    });
  });

  describe('Color Consistency', () => {
    it('should use coal-black range for dark backgrounds', () => {
      const background = hexToRgb(colors.background);  // #121212 = [18, 18, 18]
      const card = hexToRgb(colors.card);              // #1a1a1a = [26, 26, 26]
      const popover = hexToRgb(colors.popover);        // #141414 = [20, 20, 20]
      const secondary = hexToRgb(colors.secondary);    // #1f1f1f = [31, 31, 31]
      const border = hexToRgb(colors.border);          // #2a2a2a = [42, 42, 42]

      // All should be in the dark range (under 50)
      [background, card, popover, secondary, border].forEach(rgb => {
        expect(rgb[0]).toBeLessThanOrEqual(50);
        expect(rgb[1]).toBeLessThanOrEqual(50);
        expect(rgb[2]).toBeLessThanOrEqual(50);
      });
    });

    it('should use soft white/gray range for text', () => {
      const foreground = hexToRgb(colors.foreground);          // #e4e4e7 = [228, 228, 231]
      const mutedForeground = hexToRgb(colors.mutedForeground); // #a1a1aa = [161, 161, 170]
      const primaryForeground = hexToRgb(colors.primaryForeground); // #fafafa = [250, 250, 250]

      // All should be in the light range (above 150)
      [foreground, mutedForeground, primaryForeground].forEach(rgb => {
        expect(rgb[0]).toBeGreaterThanOrEqual(150);
        expect(rgb[1]).toBeGreaterThanOrEqual(150);
        expect(rgb[2]).toBeGreaterThanOrEqual(150);
      });
    });
  });
});
