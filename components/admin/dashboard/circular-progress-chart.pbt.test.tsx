import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getChartColor } from './circular-progress-chart';

/**
 * Property-Based Tests for CircularProgressChart
 * 
 * **Validates: Requirements 4.6, 4.7, 4.8**
 * 
 * These tests verify that the chart color threshold selection logic
 * is correct for ALL possible value/max pairs, not just specific examples.
 * 
 * Color Thresholds:
 * - Green (#22c55e): 0-69%
 * - Yellow (#eab308): 70-89%
 * - Red (#ef4444): 90-100%
 */

describe('CircularProgressChart - Property-Based Tests', () => {
  describe('Property 2: Chart Color Threshold Selection', () => {
    it('should return green for any percentage in range [0, 70)', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 69.999999, noNaN: true }),
          (percentage) => {
            const color = getChartColor(percentage);
            expect(color).toBe('var(--color-chart-green)');
          }
        ),
        { numRuns: 1000 }
      );
    });

    it('should return yellow for any percentage in range [70, 90)', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 70, max: 89.999999, noNaN: true }),
          (percentage) => {
            const color = getChartColor(percentage);
            expect(color).toBe('var(--color-chart-yellow)');
          }
        ),
        { numRuns: 1000 }
      );
    });

    it('should return red for any percentage in range [90, Infinity)', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 90, max: 1000, noNaN: true }),
          (percentage) => {
            const color = getChartColor(percentage);
            expect(color).toBe('var(--color-chart-red)');
          }
        ),
        { numRuns: 1000 }
      );
    });

    it('should correctly determine color for any random value/max pair', () => {
      fc.assert(
        fc.property(
          // Generate random value and max where max > 0
          fc.tuple(
            fc.double({ min: 0, max: 10000, noNaN: true }),
            fc.double({ min: 0.1, max: 10000, noNaN: true })
          ),
          ([value, max]) => {
            // Calculate percentage
            const percentage = (value / max) * 100;
            
            // Get color from function
            const color = getChartColor(percentage);
            
            // Verify color matches expected threshold
            if (percentage < 70) {
              expect(color).toBe('var(--color-chart-green)');
            } else if (percentage < 90) {
              expect(color).toBe('var(--color-chart-yellow)');
            } else {
              expect(color).toBe('var(--color-chart-red)');
            }
          }
        ),
        { numRuns: 1000 }
      );
    });

    it('should handle boundary conditions correctly', () => {
      // Test exact boundary values
      const boundaries = [
        { percentage: 69, expected: 'var(--color-chart-green)' },
        { percentage: 69.9, expected: 'var(--color-chart-green)' },
        { percentage: 69.99999, expected: 'var(--color-chart-green)' },
        { percentage: 70, expected: 'var(--color-chart-yellow)' },
        { percentage: 70.00001, expected: 'var(--color-chart-yellow)' },
        { percentage: 89, expected: 'var(--color-chart-yellow)' },
        { percentage: 89.9, expected: 'var(--color-chart-yellow)' },
        { percentage: 89.99999, expected: 'var(--color-chart-yellow)' },
        { percentage: 90, expected: 'var(--color-chart-red)' },
        { percentage: 90.00001, expected: 'var(--color-chart-red)' },
      ];

      boundaries.forEach(({ percentage, expected }) => {
        const color = getChartColor(percentage);
        expect(color).toBe(expected);
      });
    });

    it('should handle edge cases: 0%, 100%, negative, and > 100%', () => {
      // Test 0%
      expect(getChartColor(0)).toBe('var(--color-chart-green)');
      
      // Test 100%
      expect(getChartColor(100)).toBe('var(--color-chart-red)');
      
      // Test negative values (should still return green)
      fc.assert(
        fc.property(
          fc.double({ min: -1000, max: -0.001, noNaN: true }),
          (percentage) => {
            const color = getChartColor(percentage);
            expect(color).toBe('var(--color-chart-green)');
          }
        ),
        { numRuns: 100 }
      );
      
      // Test values > 100% (should return red)
      fc.assert(
        fc.property(
          fc.double({ min: 100.001, max: 10000, noNaN: true }),
          (percentage) => {
            const color = getChartColor(percentage);
            expect(color).toBe('var(--color-chart-red)');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be consistent: same percentage always returns same color', () => {
      fc.assert(
        fc.property(
          fc.double({ min: -100, max: 1000, noNaN: true }),
          (percentage) => {
            const color1 = getChartColor(percentage);
            const color2 = getChartColor(percentage);
            const color3 = getChartColor(percentage);
            
            expect(color1).toBe(color2);
            expect(color2).toBe(color3);
          }
        ),
        { numRuns: 500 }
      );
    });

    it('should calculate percentage correctly from value/max pairs', () => {
      fc.assert(
        fc.property(
          fc.record({
            value: fc.double({ min: 0, max: 10000, noNaN: true }),
            max: fc.double({ min: 1, max: 10000, noNaN: true }),
          }),
          ({ value, max }) => {
            // Manually calculate percentage
            const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
            
            // Get color based on calculated percentage
            const color = getChartColor(percentage);
            
            // Verify color is one of the three valid colors
            expect(['var(--color-chart-green)', 'var(--color-chart-yellow)', 'var(--color-chart-red)']).toContain(color);
            
            // Verify specific color based on percentage range
            if (percentage < 70) {
              expect(color).toBe('var(--color-chart-green)');
            } else if (percentage >= 70 && percentage < 90) {
              expect(color).toBe('var(--color-chart-yellow)');
            } else {
              expect(color).toBe('var(--color-chart-red)');
            }
          }
        ),
        { numRuns: 1000 }
      );
    });

    it('should handle very small and very large percentages', () => {
      // Very small positive percentages (near 0)
      fc.assert(
        fc.property(
          fc.double({ min: 0.0000001, max: 0.1, noNaN: true }),
          (percentage) => {
            const color = getChartColor(percentage);
            expect(color).toBe('var(--color-chart-green)');
          }
        ),
        { numRuns: 100 }
      );

      // Very large percentages (>> 100%)
      fc.assert(
        fc.property(
          fc.double({ min: 1000, max: 1000000, noNaN: true }),
          (percentage) => {
            const color = getChartColor(percentage);
            expect(color).toBe('var(--color-chart-red)');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have monotonic color progression: never go from red back to yellow or green', () => {
      fc.assert(
        fc.property(
          fc.array(fc.double({ min: 0, max: 200, noNaN: true }), { minLength: 2 }).map(arr => arr.sort((a, b) => a - b)),
          (sortedPercentages) => {
            const colors = sortedPercentages.map(p => getChartColor(p));
            
            // Convert colors to numeric values for comparison
            const colorToNum = (color: string) => {
              if (color === 'var(--color-chart-green)') return 0;
              if (color === 'var(--color-chart-yellow)') return 1;
              if (color === 'var(--color-chart-red)') return 2;
              return -1;
            };
            
            const numericColors = colors.map(colorToNum);
            
            // Verify that colors never decrease (monotonic non-decreasing)
            for (let i = 1; i < numericColors.length; i++) {
              expect(numericColors[i]).toBeGreaterThanOrEqual(numericColors[i - 1]);
            }
          }
        ),
        { numRuns: 500 }
      );
    });

    it('should handle decimal value/max pairs correctly', () => {
      fc.assert(
        fc.property(
          fc.record({
            value: fc.double({ min: 0, max: 1, noNaN: true }),
            max: fc.double({ min: 0.01, max: 1, noNaN: true }),
          }),
          ({ value, max }) => {
            const percentage = (value / max) * 100;
            const color = getChartColor(percentage);
            
            // Color must be one of the valid three
            expect(['var(--color-chart-green)', 'var(--color-chart-yellow)', 'var(--color-chart-red)']).toContain(color);
            
            // Verify correctness
            if (percentage < 70) {
              expect(color).toBe('var(--color-chart-green)');
            } else if (percentage >= 70 && percentage < 90) {
              expect(color).toBe('var(--color-chart-yellow)');
            } else {
              expect(color).toBe('var(--color-chart-red)');
            }
          }
        ),
        { numRuns: 1000 }
      );
    });
  });
});
