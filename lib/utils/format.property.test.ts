/**
 * Property-Based Tests for Traffic Unit Conversion
 * 
 * **Validates: Requirements 5.8, 5.9**
 * 
 * These tests use fast-check to generate random byte values and verify
 * that formatTrafficSpeed and formatTrafficVolume correctly select units
 * at 1024 thresholds and preserve values through round-trip conversion.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { formatTrafficSpeed, formatTrafficVolume } from "./format";

describe("Property 3: Traffic Unit Conversion", () => {
  /**
   * Helper function to parse traffic speed back to bytes/second
   * Used for round-trip conversion testing
   */
  function parseTrafficSpeed(formatted: string): number {
    const match = formatted.match(/^([\d.]+)\s+(KB\/s|MB\/s)$/);
    if (!match) throw new Error(`Invalid format: ${formatted}`);
    
    const value = parseFloat(match[1]);
    const unit = match[2];
    
    if (unit === "KB/s") {
      return value * 1024;
    } else if (unit === "MB/s") {
      return value * 1024 * 1024;
    }
    
    throw new Error(`Unknown unit: ${unit}`);
  }

  /**
   * Helper function to parse traffic volume back to bytes
   * Used for round-trip conversion testing
   */
  function parseTrafficVolume(formatted: string): number {
    const match = formatted.match(/^([\d.]+)\s+(GB|TB)$/);
    if (!match) throw new Error(`Invalid format: ${formatted}`);
    
    const value = parseFloat(match[1]);
    const unit = match[2];
    
    if (unit === "GB") {
      return value * 1024 * 1024 * 1024;
    } else if (unit === "TB") {
      return value * 1024 * 1024 * 1024 * 1024;
    }
    
    throw new Error(`Unknown unit: ${unit}`);
  }

  /**
   * Property: Traffic speeds below 1024 KB/s should display in KB/s
   * 
   * Generates random byte values that will format to < 1024.00 KB/s
   * and verifies they are formatted with KB/s unit.
   */
  it("should display traffic speed in KB/s when below 1024 KB/s threshold", () => {
    fc.assert(
      fc.property(
        // Generate bytes/second values that will definitely be < 1024 KB/s when formatted
        // 1024 KB/s = 1,048,576 bytes/s, but due to rounding, values near the threshold
        // might round up to 1024.00 KB/s, so we test below the threshold
        fc.integer({ min: 0, max: 1024 * 1023 }),
        (bytesPerSecond) => {
          const result = formatTrafficSpeed(bytesPerSecond);
          
          // Should end with KB/s
          return result.endsWith(" KB/s");
        }
      ),
      { numRuns: 1000 }
    );
  });

  /**
   * Property: Traffic speeds at or above 1024 KB/s should display in MB/s
   * 
   * Generates random byte values >= 1024 KB/s and verifies they are
   * formatted with MB/s unit.
   */
  it("should display traffic speed in MB/s when at or above 1024 KB/s threshold", () => {
    fc.assert(
      fc.property(
        // Generate bytes/second values from 1024 KB/s to 1024 MB/s
        fc.integer({ min: 1024 * 1024, max: 1024 * 1024 * 1024 }),
        (bytesPerSecond) => {
          const result = formatTrafficSpeed(bytesPerSecond);
          
          // Should end with MB/s
          const hasCorrectUnit = result.endsWith(" MB/s");
          
          // Should be a valid number
          const value = parseFloat(result.split(" ")[0]);
          const isValidNumber = !isNaN(value) && isFinite(value);
          
          // Value should be >= 1.00 (since input is >= 1024 KB/s)
          const inCorrectRange = value >= 1.00;
          
          return hasCorrectUnit && isValidNumber && inCorrectRange;
        }
      ),
      { numRuns: 1000 }
    );
  });

  /**
   * Property: Traffic volumes below 1024 GB should display in GB
   * 
   * Generates random byte values that will format to < 1024.00 GB
   * and verifies they are formatted with GB unit.
   */
  it("should display traffic volume in GB when below 1024 GB threshold", () => {
    fc.assert(
      fc.property(
        // Generate byte values that will definitely be < 1024 GB when formatted
        // 1024 GB = 1,099,511,627,776 bytes, but due to rounding, values near threshold
        // might round up to 1024.00 GB, so we test below the threshold
        fc.integer({ min: 0, max: 1024 * 1024 * 1024 * 1023 }),
        (bytes) => {
          const result = formatTrafficVolume(bytes);
          
          // Should end with GB
          return result.endsWith(" GB");
        }
      ),
      { numRuns: 1000 }
    );
  });

  /**
   * Property: Traffic volumes at or above 1024 GB should display in TB
   * 
   * Generates random byte values >= 1024 GB and verifies they are
   * formatted with TB unit.
   */
  it("should display traffic volume in TB when at or above 1024 GB threshold", () => {
    fc.assert(
      fc.property(
        // Generate byte values from 1024 GB to 1024 TB
        // Using smaller max to avoid overflow issues
        fc.integer({ min: 1024 * 1024 * 1024 * 1024, max: 1024 * 1024 * 1024 * 1024 * 100 }),
        (bytes) => {
          const result = formatTrafficVolume(bytes);
          
          // Should end with TB
          const hasCorrectUnit = result.endsWith(" TB");
          
          // Should be a valid number
          const value = parseFloat(result.split(" ")[0]);
          const isValidNumber = !isNaN(value) && isFinite(value);
          
          // Value should be >= 1.00 (since input is >= 1024 GB)
          const inCorrectRange = value >= 1.00;
          
          return hasCorrectUnit && isValidNumber && inCorrectRange;
        }
      ),
      { numRuns: 500 }
    );
  });

  /**
   * Property: Round-trip conversion for traffic speed should preserve value within tolerance
   * 
   * For any traffic speed value, converting to display format and back should
   * preserve the original value within floating-point rounding tolerance (1%).
   * Note: Very small values lose precision due to 2-decimal rounding.
   */
  it("should preserve traffic speed value through round-trip conversion", () => {
    fc.assert(
      fc.property(
        // Generate various magnitude ranges, avoiding very small values
        // where rounding error dominates
        fc.integer({ min: 10 * 1024, max: 1024 * 1024 * 1024 }),
        (originalBytes) => {
          // Convert to display format
          const formatted = formatTrafficSpeed(originalBytes);
          
          // Parse back to bytes
          const parsedBytes = parseTrafficSpeed(formatted);
          
          // Calculate percentage difference
          const percentDiff = Math.abs((parsedBytes - originalBytes) / originalBytes) * 100;
          
          // Should be within 1% (accounting for rounding to 2 decimal places)
          return percentDiff <= 1.0;
        }
      ),
      { numRuns: 1000 }
    );
  });

  /**
   * Property: Round-trip conversion for traffic volume should preserve value within tolerance
   * 
   * For any traffic volume value, converting to display format and back should
   * preserve the original value within floating-point rounding tolerance (1%).
   * Note: Values near boundaries and very small values lose precision due to 2-decimal rounding.
   */
  it("should preserve traffic volume value through round-trip conversion", () => {
    fc.assert(
      fc.property(
        // Generate various magnitude ranges (avoid very small values near zero)
        fc.integer({ min: 10 * 1024 * 1024 * 1024, max: 1024 * 1024 * 1024 * 1024 * 10 }),
        (originalBytes) => {
          // Convert to display format
          const formatted = formatTrafficVolume(originalBytes);
          
          // Parse back to bytes
          const parsedBytes = parseTrafficVolume(formatted);
          
          // Calculate percentage difference
          const percentDiff = Math.abs((parsedBytes - originalBytes) / originalBytes) * 100;
          
          // Should be within 1% (accounting for rounding to 2 decimal places)
          return percentDiff <= 1.0;
        }
      ),
      { numRuns: 1000 }
    );
  });

  /**
   * Property: Negative traffic speed values should return "0.00 KB/s"
   * 
   * Verifies that negative inputs are handled gracefully.
   */
  it("should return '0.00 KB/s' for negative traffic speed values", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000000, max: -1 }),
        (negativeBytes) => {
          const result = formatTrafficSpeed(negativeBytes);
          return result === "0.00 KB/s";
        }
      ),
      { numRuns: 500 }
    );
  });

  /**
   * Property: Negative traffic volume values should return "0.00 GB"
   * 
   * Verifies that negative inputs are handled gracefully.
   */
  it("should return '0.00 GB' for negative traffic volume values", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000000, max: -1 }),
        (negativeBytes) => {
          const result = formatTrafficVolume(negativeBytes);
          return result === "0.00 GB";
        }
      ),
      { numRuns: 500 }
    );
  });

  /**
   * Property: Zero traffic speed should return "0.00 KB/s"
   */
  it("should return '0.00 KB/s' for zero traffic speed", () => {
    const result = formatTrafficSpeed(0);
    expect(result).toBe("0.00 KB/s");
  });

  /**
   * Property: Zero traffic volume should return "0.00 GB"
   */
  it("should return '0.00 GB' for zero traffic volume", () => {
    const result = formatTrafficVolume(0);
    expect(result).toBe("0.00 GB");
  });

  /**
   * Edge case property: Exact threshold values should use correct units
   * 
   * Tests boundary conditions at exactly 1024 KB/s and 1024 GB.
   */
  it("should handle exact threshold values correctly", () => {
    // Exactly 1024 KB/s = 1024 * 1024 bytes/s = 1.00 MB/s
    const speedAt1024KB = formatTrafficSpeed(1024 * 1024);
    expect(speedAt1024KB).toBe("1.00 MB/s");
    
    // Just below 1024 KB/s - note: 1024*1024-1 bytes rounds to 1024.00 KB/s!
    // So we need a value that clearly rounds below 1024
    const speedBelow1024KB = formatTrafficSpeed(1024 * 1023);
    expect(speedBelow1024KB).toBe("1023.00 KB/s");
    
    // Exactly 1024 GB = 1024^3 * 1024 bytes = 1.00 TB
    const volumeAt1024GB = formatTrafficVolume(1024 * 1024 * 1024 * 1024);
    expect(volumeAt1024GB).toBe("1.00 TB");
    
    // Just below 1024 GB
    const volumeBelow1024GB = formatTrafficVolume(1024 * 1024 * 1024 * 1023);
    expect(volumeBelow1024GB).toBe("1023.00 GB");
  });

  /**
   * Property: Format should always include exactly 2 decimal places
   * 
   * Verifies consistent formatting across all magnitude ranges.
   */
  it("should always format with exactly 2 decimal places", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1024 * 1024 * 1024 }),
        (bytes) => {
          const speedResult = formatTrafficSpeed(bytes);
          const volumeResult = formatTrafficVolume(bytes);
          
          // Extract numeric part before unit
          const speedValue = speedResult.split(" ")[0];
          const volumeValue = volumeResult.split(" ")[0];
          
          // Check decimal places (should have format "X.XX")
          const speedHasTwoDecimals = /^\d+\.\d{2}$/.test(speedValue);
          const volumeHasTwoDecimals = /^\d+\.\d{2}$/.test(volumeValue);
          
          return speedHasTwoDecimals && volumeHasTwoDecimals;
        }
      ),
      { numRuns: 1000 }
    );
  });

  /**
   * Property: Very large values should be handled gracefully
   * 
   * Tests that extremely large byte values don't cause overflow or formatting issues.
   */
  it("should handle very large traffic values without overflow", () => {
    fc.assert(
      fc.property(
        // Generate very large values (up to petabytes)
        fc.integer({ min: 1024 * 1024 * 1024 * 1024, max: Number.MAX_SAFE_INTEGER }),
        (bytes) => {
          try {
            const speedResult = formatTrafficSpeed(bytes);
            const volumeResult = formatTrafficVolume(bytes);
            
            // Should return valid formatted strings
            const speedValid = /^[\d.]+\s+(KB\/s|MB\/s)$/.test(speedResult);
            const volumeValid = /^[\d.]+\s+(GB|TB)$/.test(volumeResult);
            
            // Values should be finite
            const speedValue = parseFloat(speedResult.split(" ")[0]);
            const volumeValue = parseFloat(volumeResult.split(" ")[0]);
            
            return speedValid && volumeValid && 
                   isFinite(speedValue) && isFinite(volumeValue);
          } catch {
            // Any parsing errors indicate failure
            return false;
          }
        }
      ),
      { numRuns: 500 }
    );
  });

  /**
   * Property: Small values should display correctly in KB/s and GB
   * 
   * Tests that very small values (fractional KB/s or GB) are formatted correctly.
   */
  it("should handle small fractional values correctly", () => {
    fc.assert(
      fc.property(
        // Generate small byte values (0 to 10 KB)
        fc.integer({ min: 0, max: 10 * 1024 }),
        (bytes) => {
          const speedResult = formatTrafficSpeed(bytes);
          const volumeResult = formatTrafficVolume(bytes);
          
          // Should use KB/s for speed (always)
          const speedUsesKB = speedResult.endsWith(" KB/s");
          
          // Should use GB for volume (always)
          const volumeUsesGB = volumeResult.endsWith(" GB");
          
          // Values should be valid numbers
          const speedValue = parseFloat(speedResult.split(" ")[0]);
          const volumeValue = parseFloat(volumeResult.split(" ")[0]);
          
          return speedUsesKB && volumeUsesGB && 
                 !isNaN(speedValue) && !isNaN(volumeValue) &&
                 isFinite(speedValue) && isFinite(volumeValue);
        }
      ),
      { numRuns: 500 }
    );
  });

  /**
   * Property: Consecutive values should produce monotonically increasing formatted values
   * 
   * For any two byte values where B1 < B2 (within same unit range), the formatted 
   * output should also reflect B1 < B2 when parsed back to numeric values.
   * Note: This property holds within the same unit (KB or MB, GB or TB).
   */
  it("should maintain ordering: if bytes1 < bytes2, then formatted1 < formatted2", () => {
    fc.assert(
      fc.property(
        // Use two separate ranges that stay within the same unit to avoid boundary issues
        fc.oneof(
          // Test within KB/s range
          fc.tuple(
            fc.integer({ min: 1024, max: 1024 * 1000 }),
            fc.integer({ min: 1024, max: 1024 * 1000 })
          ),
          // Test within MB/s range
          fc.tuple(
            fc.integer({ min: 2 * 1024 * 1024, max: 1024 * 1024 * 100 }),
            fc.integer({ min: 2 * 1024 * 1024, max: 1024 * 1024 * 100 })
          ),
          // Test within GB range
          fc.tuple(
            fc.integer({ min: 1024 * 1024 * 1024, max: 1024 * 1024 * 1024 * 100 }),
            fc.integer({ min: 1024 * 1024 * 1024, max: 1024 * 1024 * 1024 * 100 })
          ),
          // Test within TB range
          fc.tuple(
            fc.integer({ min: 2 * 1024 * 1024 * 1024 * 1024, max: 1024 * 1024 * 1024 * 1024 * 10 }),
            fc.integer({ min: 2 * 1024 * 1024 * 1024 * 1024, max: 1024 * 1024 * 1024 * 1024 * 10 })
          )
        ),
        ([a, b]) => {
          if (a === b) return true; // Skip equal values
          
          const bytes1 = Math.min(a, b);
          const bytes2 = Math.max(a, b);
          
          // Format both
          const speed1 = formatTrafficSpeed(bytes1);
          const speed2 = formatTrafficSpeed(bytes2);
          
          const volume1 = formatTrafficVolume(bytes1);
          const volume2 = formatTrafficVolume(bytes2);
          
          // Parse back to bytes
          const parsedSpeed1 = parseTrafficSpeed(speed1);
          const parsedSpeed2 = parseTrafficSpeed(speed2);
          
          const parsedVolume1 = parseTrafficVolume(volume1);
          const parsedVolume2 = parseTrafficVolume(volume2);
          
          // Ordering should be preserved (or equal due to rounding)
          return parsedSpeed1 <= parsedSpeed2 && parsedVolume1 <= parsedVolume2;
        }
      ),
      { numRuns: 1000 }
    );
  });
});
