/**
 * Property-Based Tests for Language Persistence Round-Trip
 * 
 * Tests Property 4: Language Persistence Round-Trip
 * **Validates: Requirements 3.3, 3.4**
 * 
 * This test suite verifies that language locale values ('en' and 'ru') persist correctly
 * through localStorage operations. The round-trip property ensures that:
 * - Setting a locale in localStorage and retrieving it returns the exact same value
 * - No data corruption occurs during storage/retrieval cycles
 * - The persistence works across simulated page reloads
 * 
 * Strategy:
 * - Generate test cases for valid locales ('en', 'ru')
 * - Verify localStorage.setItem → getItem preserves exact value
 * - Test across simulated page reloads (clear and re-read)
 * - Include edge cases like repeated writes and mixed operations
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { storage } from '@/lib/utils/feature-detection';

// Valid locales as per requirements
type Locale = 'en' | 'ru';
const VALID_LOCALES: Locale[] = ['en', 'ru'];
const STORAGE_KEY = 'preferred_locale';

describe('Property 4: Language Persistence Round-Trip', () => {
  // Clean up localStorage before and after each test
  beforeEach(() => {
    storage.removeItem(STORAGE_KEY);
  });

  afterEach(() => {
    storage.removeItem(STORAGE_KEY);
  });

  /**
   * Test 1: Basic Round-Trip Property
   * 
   * For any valid locale ('en' or 'ru'), storing it in localStorage
   * and immediately retrieving it should return the exact same locale value.
   */
  it('should preserve exact locale value through setItem → getItem cycle', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_LOCALES), // Generate 'en' or 'ru'

        (locale) => {
          // Store the locale
          storage.setItem(STORAGE_KEY, locale);

          // Retrieve the locale
          const retrieved = storage.getItem(STORAGE_KEY);

          // Verify exact equality
          expect(retrieved).toBe(locale);
          expect(retrieved).toEqual(locale);
          
          // Type-safe verification
          expect(['en', 'ru']).toContain(retrieved);

          return retrieved === locale;
        }
      ),
      {
        numRuns: 100, // Test with many iterations
        verbose: true,
      }
    );
  });

  /**
   * Test 2: Multiple Write-Read Cycles
   * 
   * Performing multiple consecutive write-read operations should
   * preserve the value correctly on each cycle without corruption.
   */
  it('should maintain correctness across multiple write-read cycles', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...VALID_LOCALES), { minLength: 1, maxLength: 10 }),

        (locales) => {
          // Perform multiple write-read cycles
          for (const locale of locales) {
            storage.setItem(STORAGE_KEY, locale);
            const retrieved = storage.getItem(STORAGE_KEY);
            
            // Each retrieval must match what was just written
            expect(retrieved).toBe(locale);
            
            if (retrieved !== locale) {
              return false; // Property violated
            }
          }

          return true; // All cycles successful
        }
      ),
      {
        numRuns: 50,
        verbose: true,
      }
    );
  });

  /**
   * Test 3: Simulated Page Reload (Clear and Re-read)
   * 
   * After storing a locale, simulating a "page reload" by not clearing
   * the storage should still return the correct value. This simulates
   * the real-world scenario where a user sets a language, closes the tab,
   * and returns later.
   */
  it('should persist locale across simulated page reloads', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_LOCALES),

        (locale) => {
          // Initial write
          storage.setItem(STORAGE_KEY, locale);

          // Simulate page reload: just re-read without clearing
          // (In real usage, localStorage persists across page loads)
          const afterReload = storage.getItem(STORAGE_KEY);

          expect(afterReload).toBe(locale);
          return afterReload === locale;
        }
      ),
      {
        numRuns: 100,
        verbose: true,
      }
    );
  });

  /**
   * Test 4: Overwrite Previous Value
   * 
   * When switching languages, the new locale should completely replace
   * the old one with no remnants or corruption.
   */
  it('should correctly overwrite previous locale when language is changed', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_LOCALES), // First locale
        fc.constantFrom(...VALID_LOCALES), // Second locale

        (firstLocale, secondLocale) => {
          // Set first locale
          storage.setItem(STORAGE_KEY, firstLocale);
          const afterFirst = storage.getItem(STORAGE_KEY);
          expect(afterFirst).toBe(firstLocale);

          // Change to second locale (may be same or different)
          storage.setItem(STORAGE_KEY, secondLocale);
          const afterSecond = storage.getItem(STORAGE_KEY);
          
          // Should now reflect second locale, not first
          expect(afterSecond).toBe(secondLocale);
          expect(afterSecond).not.toBe(firstLocale === secondLocale ? 'IMPOSSIBLE' : firstLocale);

          return afterSecond === secondLocale;
        }
      ),
      {
        numRuns: 100,
        verbose: true,
      }
    );
  });

  /**
   * Test 5: No Data Corruption (Type Safety)
   * 
   * Retrieved locale values should always be exactly one of the valid
   * locale types ('en' or 'ru'), never a corrupted or modified value.
   */
  it('should never corrupt locale values during storage operations', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_LOCALES),

        (locale) => {
          storage.setItem(STORAGE_KEY, locale);
          const retrieved = storage.getItem(STORAGE_KEY);

          // Must be non-null
          expect(retrieved).not.toBeNull();
          
          // Must be one of the valid locales
          expect(VALID_LOCALES).toContain(retrieved as Locale);
          
          // Should not be modified (no extra characters, no trimming needed)
          expect(retrieved).toBe(locale);
          expect(retrieved?.length).toBe(2); // Both 'en' and 'ru' are 2 chars
          expect(retrieved?.trim()).toBe(retrieved); // No whitespace

          return retrieved === locale && VALID_LOCALES.includes(retrieved as Locale);
        }
      ),
      {
        numRuns: 100,
        verbose: true,
      }
    );
  });

  /**
   * Test 6: Idempotence
   * 
   * Writing the same locale multiple times should have the same effect
   * as writing it once - the value should remain stable.
   */
  it('should be idempotent: multiple writes of same locale produce same result', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_LOCALES),
        fc.integer({ min: 1, max: 5 }), // Number of times to write

        (locale, writeCount) => {
          // Write the same locale multiple times
          for (let i = 0; i < writeCount; i++) {
            storage.setItem(STORAGE_KEY, locale);
          }

          // Should still retrieve the correct value
          const retrieved = storage.getItem(STORAGE_KEY);
          expect(retrieved).toBe(locale);

          return retrieved === locale;
        }
      ),
      {
        numRuns: 50,
        verbose: true,
      }
    );
  });

  /**
   * Test 7: Empty Key Handling
   * 
   * Before any locale is set, attempting to read should return null,
   * not a corrupted value or undefined.
   */
  it('should return null when no locale has been set yet', () => {
    // Ensure clean slate
    storage.removeItem(STORAGE_KEY);

    // Attempt to read non-existent key
    const retrieved = storage.getItem(STORAGE_KEY);

    expect(retrieved).toBeNull();
    expect(retrieved).not.toBe('en');
    expect(retrieved).not.toBe('ru');
    expect(retrieved).not.toBe(undefined);
    expect(retrieved).not.toBe('');
  });

  /**
   * Test 8: Remove and Re-add
   * 
   * After removing a locale and setting it again, the value should
   * persist correctly as if it were a fresh write.
   */
  it('should handle remove → re-add cycle correctly', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_LOCALES),

        (locale) => {
          // Initial write
          storage.setItem(STORAGE_KEY, locale);
          expect(storage.getItem(STORAGE_KEY)).toBe(locale);

          // Remove
          storage.removeItem(STORAGE_KEY);
          expect(storage.getItem(STORAGE_KEY)).toBeNull();

          // Re-add same locale
          storage.setItem(STORAGE_KEY, locale);
          const retrieved = storage.getItem(STORAGE_KEY);
          
          expect(retrieved).toBe(locale);
          return retrieved === locale;
        }
      ),
      {
        numRuns: 50,
        verbose: true,
      }
    );
  });

  /**
   * Test 9: Alternating Locales
   * 
   * Rapidly switching between 'en' and 'ru' should always reflect
   * the most recent write with no race conditions or stale reads.
   */
  it('should handle rapid locale switching without stale reads', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...VALID_LOCALES), { minLength: 2, maxLength: 20 }),

        (localeSequence) => {
          let lastWritten: Locale | null = null;

          for (const locale of localeSequence) {
            storage.setItem(STORAGE_KEY, locale);
            lastWritten = locale;

            // Immediately verify it was written correctly
            const immediate = storage.getItem(STORAGE_KEY);
            if (immediate !== lastWritten) {
              return false; // Stale read detected
            }
          }

          // Final check: should match the last written locale
          const finalRead = storage.getItem(STORAGE_KEY);
          expect(finalRead).toBe(lastWritten);

          return finalRead === lastWritten;
        }
      ),
      {
        numRuns: 50,
        verbose: true,
      }
    );
  });

  /**
   * Test 10: Type Stability
   * 
   * Retrieved values should always be strings (or null), never
   * other types like objects, arrays, or booleans.
   */
  it('should always return string or null, never other types', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_LOCALES),

        (locale) => {
          storage.setItem(STORAGE_KEY, locale);
          const retrieved = storage.getItem(STORAGE_KEY);

          // Type checks
          expect(typeof retrieved).toBe('string');
          expect(retrieved).not.toBeUndefined();
          expect(Array.isArray(retrieved)).toBe(false);
          expect(typeof retrieved).not.toBe('object');
          expect(typeof retrieved).not.toBe('boolean');
          expect(typeof retrieved).not.toBe('number');

          return typeof retrieved === 'string';
        }
      ),
      {
        numRuns: 100,
        verbose: true,
      }
    );
  });
});

/**
 * Additional Integration Tests for Real-World Scenarios
 * 
 * These tests verify behavior in contexts closer to actual usage,
 * such as the I18nProvider component's locale detection logic.
 */
describe('Language Persistence Integration Scenarios', () => {
  beforeEach(() => {
    storage.removeItem(STORAGE_KEY);
  });

  afterEach(() => {
    storage.removeItem(STORAGE_KEY);
  });

  /**
   * Scenario: User selects Russian, reloads page
   * Expected: Russian locale is restored from localStorage
   */
  it('should restore Russian locale after simulated page reload', () => {
    // User selects Russian
    storage.setItem(STORAGE_KEY, 'ru');

    // Simulate page reload: read from storage
    const restoredLocale = storage.getItem(STORAGE_KEY) as Locale | null;

    expect(restoredLocale).toBe('ru');
    expect(restoredLocale).not.toBe('en');
  });

  /**
   * Scenario: User switches from English to Russian and back
   * Expected: Each switch is correctly persisted
   */
  it('should correctly persist locale through multiple language switches', () => {
    // Start with English
    storage.setItem(STORAGE_KEY, 'en');
    expect(storage.getItem(STORAGE_KEY)).toBe('en');

    // Switch to Russian
    storage.setItem(STORAGE_KEY, 'ru');
    expect(storage.getItem(STORAGE_KEY)).toBe('ru');

    // Switch back to English
    storage.setItem(STORAGE_KEY, 'en');
    expect(storage.getItem(STORAGE_KEY)).toBe('en');

    // Switch to Russian again
    storage.setItem(STORAGE_KEY, 'ru');
    expect(storage.getItem(STORAGE_KEY)).toBe('ru');
  });

  /**
   * Scenario: First-time user (no stored locale)
   * Expected: getItem returns null, allowing default to 'en'
   */
  it('should return null for first-time user with no stored preference', () => {
    // No locale set yet
    const storedLocale = storage.getItem(STORAGE_KEY);

    expect(storedLocale).toBeNull();
    
    // Application logic would then default to 'en'
    const effectiveLocale = storedLocale || 'en';
    expect(effectiveLocale).toBe('en');
  });

  /**
   * Scenario: Invalid locale is somehow stored (defensive check)
   * Expected: Application should validate and fallback to default
   */
  it('should allow validation of retrieved locale against valid set', () => {
    // Simulate corrupted or invalid data
    storage.setItem(STORAGE_KEY, 'fr' as any); // Invalid locale

    const retrieved = storage.getItem(STORAGE_KEY);
    const isValid = VALID_LOCALES.includes(retrieved as Locale);

    // Application should detect invalid locale
    expect(isValid).toBe(false);
    
    // Application logic would fallback to default
    const effectiveLocale = isValid ? (retrieved as Locale) : 'en';
    expect(effectiveLocale).toBe('en');
  });
});
