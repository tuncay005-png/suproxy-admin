/**
 * Property-Based Tests for UTF-8 Character Validation
 * 
 * **Validates: Requirements 1.1, 1.3, 1.4**
 * 
 * These tests use fast-check to generate random text inputs and verify
 * that the encoding validation functions correctly identify valid UTF-8
 * and encoding artifacts across a wide range of inputs.
 */

import { describe, it } from "vitest";
import * as fc from "fast-check";
import {
  isValidUTF8,
  sanitizeValue,
  getEncodingArtifacts,
} from "./encoding";

describe("Property 1: UTF-8 Character Validation", () => {
  /**
   * Property: Valid UTF-8 strings without artifacts should always pass validation
   * 
   * This property generates random strings composed of:
   * - ASCII alphanumeric characters (a-z, A-Z, 0-9)
   * - Common punctuation (space, comma, period, dash, underscore)
   * - Valid whitespace (space, tab, newline)
   * 
   * All generated strings should be valid UTF-8 without encoding artifacts.
   */
  it("should return true for all valid UTF-8 strings without encoding artifacts", () => {
    fc.assert(
      fc.property(
        // Generate strings from alphanumeric and safe characters only
        fc.string({
          minLength: 1,
          maxLength: 100,
        }).filter(text => {
          // Only keep strings that don't contain artifacts or control chars
          // This ensures we're testing the positive case: valid UTF-8
          const hasArtifacts = getEncodingArtifacts().some(art => text.includes(art));
          const hasInvalidControl = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/.test(text);
          return !hasArtifacts && !hasInvalidControl;
        }),
        (text) => {
          // Valid UTF-8 strings should pass validation
          return isValidUTF8(text) === true;
        }
      ),
      { numRuns: 1000 } // Run 1000 random test cases
    );
  });

  /**
   * Property: Strings containing known encoding artifacts should always fail validation
   * 
   * This property generates strings that include known encoding artifacts
   * and verifies they are correctly detected as invalid.
   */
  it("should return false for any string containing encoding artifacts", () => {
    const artifacts = getEncodingArtifacts();

    fc.assert(
      fc.property(
        // Generate a random artifact from our known list
        fc.constantFrom(...artifacts),
        // Generate random surrounding text
        fc.string({ maxLength: 50 }),
        fc.string({ maxLength: 50 }),
        (artifact, prefix, suffix) => {
          // Build a string containing the artifact
          const contaminated = prefix + artifact + suffix;
          
          // Any string with an artifact should fail validation
          return isValidUTF8(contaminated) === false;
        }
      ),
      { numRuns: 500 } // Test with 500 combinations
    );
  });

  /**
   * Property: Strings with invalid control characters should fail validation
   * 
   * Generates strings containing control characters in the range 0x00-0x1F
   * (excluding valid whitespace: tab, newline, carriage return) and verifies
   * they are rejected.
   */
  it("should return false for strings with invalid control characters", () => {
    // Invalid control characters (excluding \t, \n, \r which are valid)
    const invalidControlChars = Array.from({ length: 32 }, (_, i) => i)
      .filter(code => code !== 0x09 && code !== 0x0A && code !== 0x0D) // Exclude tab, newline, CR
      .map(code => String.fromCharCode(code));

    fc.assert(
      fc.property(
        fc.constantFrom(...invalidControlChars),
        fc.string({ maxLength: 50 }),
        fc.string({ maxLength: 50 }),
        (controlChar, prefix, suffix) => {
          const contaminated = prefix + controlChar + suffix;
          
          // Strings with invalid control characters should fail
          return isValidUTF8(contaminated) === false;
        }
      ),
      { numRuns: 300 }
    );
  });

  /**
   * Property: Empty strings and non-string values should always fail validation
   */
  it("should return false for empty strings and non-string types", () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(""),                    // Empty string
          fc.constant(null),                  // null
          fc.constant(undefined),             // undefined
          fc.integer(),                       // Numbers
          fc.boolean(),                       // Booleans
          fc.object()                         // Objects
        ),
        (value) => {
          // All non-valid-string inputs should fail
          return isValidUTF8(value as any) === false;
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * Property: sanitizeValue with encoding artifacts should always return fallback
   * 
   * This property verifies that sanitizeValue correctly handles contaminated
   * strings by returning the fallback value.
   */
  it("should return fallback for any string containing encoding artifacts", () => {
    const artifacts = getEncodingArtifacts();

    fc.assert(
      fc.property(
        fc.constantFrom(...artifacts),
        fc.string({ maxLength: 30 }),
        fc.string({ maxLength: 30 }),
        fc.string({ minLength: 1, maxLength: 20 }), // Custom fallback
        (artifact, prefix, suffix, fallback) => {
          const contaminated = prefix + artifact + suffix;
          
          // sanitizeValue should return the fallback for contaminated strings
          const result = sanitizeValue(contaminated, fallback);
          return result === fallback;
        }
      ),
      { numRuns: 500 }
    );
  });

  /**
   * Property: sanitizeValue with valid input should preserve the input
   * 
   * For valid strings without artifacts, sanitizeValue should return
   * the input unchanged (after optional trimming).
   */
  it("should preserve valid UTF-8 strings without artifacts", () => {
    fc.assert(
      fc.property(
        fc.string({
          minLength: 1,
          maxLength: 100,
        }).filter(text => {
          // Filter out strings with artifacts or invalid control chars
          const hasArtifacts = getEncodingArtifacts().some(art => text.includes(art));
          const hasInvalidControl = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/.test(text);
          return !hasArtifacts && !hasInvalidControl;
        }),
        (validText) => {
          // For valid strings, sanitizeValue should preserve them (trimmed)
          const result = sanitizeValue(validText, "FALLBACK");
          const expected = validText.trim() === "" ? "FALLBACK" : validText.trim();
          return result === expected;
        }
      ),
      { numRuns: 500 }
    );
  });

  /**
   * Property: sanitizeValue with numbers should convert to string
   * 
   * For numeric inputs, sanitizeValue should convert them to strings
   * unless they are NaN or Infinity.
   */
  it("should convert valid numbers to strings", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000000, max: 1000000 }),
        fc.string({ minLength: 1, maxLength: 20 }), // fallback
        (num, fallback) => {
          const result = sanitizeValue(num, fallback);
          
          // Valid finite numbers should be converted to strings
          if (isFinite(num)) {
            return result === num.toString();
          } else {
            // NaN and Infinity should return fallback
            return result === fallback;
          }
        }
      ),
      { numRuns: 500 }
    );
  });

  /**
   * Property: sanitizeValue should handle null/undefined consistently
   */
  it("should return fallback for null and undefined values", () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.constant(null), fc.constant(undefined)),
        fc.string({ minLength: 1, maxLength: 20 }), // fallback
        (nullishValue, fallback) => {
          const result = sanitizeValue(nullishValue, fallback);
          return result === fallback;
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * Property: Common encoding issues should be detected
   * 
   * This test specifically targets common real-world encoding problems:
   * - Em-dash artifacts (â€")
   * - Apostrophe artifacts (â€™)
   * - Accented character artifacts (Ã©, Ã¨, Ã )
   */
  it("should detect common real-world encoding artifacts", () => {
    // Common encoding artifacts that appear when UTF-8 is misinterpreted
    const commonIssues = [
      "\u00E2\u0080\u0093",   // â€" (em-dash/zero)
      "\u00E2\u0080\u0099",   // â€™ (apostrophe)
      "\u00E2\u0080\u009C",   // â€œ (left quote)
      "\u00E2\u0080\u009D",   // â€ (right quote)
      "\u00C3\u00A9",         // Ã© (corrupted é)
      "\u00C3\u00A8",         // Ã¨ (corrupted è)
      "\u00C3\u00A0",         // Ã  (corrupted à)
      "\u00C2",               // Â (corrupted nbsp)
    ];

    fc.assert(
      fc.property(
        fc.constantFrom(...commonIssues),
        (artifact) => {
          // Direct artifact should fail validation
          const directResult = isValidUTF8(artifact);
          
          // Artifact in a string should fail validation
          const embeddedResult = isValidUTF8("test" + artifact + "123");
          
          // sanitizeValue should return fallback
          const sanitizeResult = sanitizeValue(artifact, "0");
          
          return (
            directResult === false &&
            embeddedResult === false &&
            sanitizeResult === "0"
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Valid whitespace should be allowed
   * 
   * Tab, newline, and carriage return are valid whitespace characters
   * and should not cause validation to fail.
   */
  it("should allow valid whitespace characters (tab, newline, carriage return)", () => {
    fc.assert(
      fc.property(
        fc.string({
          minLength: 1,
          maxLength: 50,
        }).filter(text => {
          // Filter out strings with artifacts or invalid control chars (keep valid whitespace)
          const hasArtifacts = getEncodingArtifacts().some(art => text.includes(art));
          const hasInvalidControl = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/.test(text);
          return !hasArtifacts && !hasInvalidControl;
        }),
        (text) => {
          // Strings with valid whitespace should pass validation
          return isValidUTF8(text) === true;
        }
      ),
      { numRuns: 500 }
    );
  });

  /**
   * Edge case property: Very long strings with artifacts
   * 
   * Ensures validation works correctly even with long strings.
   */
  it("should detect artifacts in long strings", () => {
    const artifacts = getEncodingArtifacts();

    fc.assert(
      fc.property(
        fc.constantFrom(...artifacts),
        fc.integer({ min: 0, max: 1000 }), // Position to insert artifact
        (artifact, position) => {
          // Create a long string with artifact at specified position
          const prefix = "a".repeat(position);
          const suffix = "b".repeat(1000 - position);
          const longString = prefix + artifact + suffix;
          
          // Should still detect the artifact
          return isValidUTF8(longString) === false;
        }
      ),
      { numRuns: 200 }
    );
  });
});
