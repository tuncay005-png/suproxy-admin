/**
 * UTF-8 Character Encoding Validation and Sanitization Utilities
 * 
 * Provides functions to detect and handle garbled character encodings
 * that can appear when UTF-8 data is incorrectly decoded.
 * 
 * Common encoding artifacts include:
 * - "â€"" (incorrectly decoded em-dash or zero)
 * - "â€™" (incorrectly decoded apostrophe)
 * - Other multibyte character corruption
 */

/**
 * Common UTF-8 encoding artifacts that indicate corrupted text.
 * These patterns typically appear when UTF-8 text is decoded as Windows-1252 or similar.
 */
const ENCODING_ARTIFACTS = [
  "\u00E2\u0080\u0093",   // Corrupted em-dash or en-dash (â€")
  "\u00E2\u0080\u0099",   // Corrupted apostrophe (â€™)
  "\u00E2\u0080\u009C",   // Corrupted left double quotation mark (â€œ)
  "\u00E2\u0080\u009D",   // Corrupted right double quotation mark (â€)
  "\u00E2\u0080\u00A2",   // Corrupted bullet point (â€¢)
  "\u00C3\u00A9",         // Corrupted é (Ã©)
  "\u00C3\u00A8",         // Corrupted è (Ã¨)
  "\u00C3\u00A0",         // Corrupted à (Ã )
  "\u00C3\u00A7",         // Corrupted ç (Ã§)
  "\u00E2\u0082\u00AC",   // Corrupted euro sign (â‚¬)
  "\u00C2",               // Corrupted non-breaking space (Â)
];

/**
 * Options for sanitization behavior
 */
export interface SanitizeOptions {
  /** Fallback value to return when artifacts are detected (default: "0") */
  fallback?: string;
  /** Whether to trim whitespace (default: true) */
  trim?: boolean;
  /** Custom artifact patterns to check (in addition to default patterns) */
  customArtifacts?: string[];
}

/**
 * Check if a string contains UTF-8 encoding artifacts
 * 
 * @param text - Text to validate
 * @returns true if text is valid UTF-8 without artifacts, false otherwise
 * 
 * @example
 * isValidUTF8("42") // true
 * isValidUTF8("Hello World") // true
 * isValidUTF8("\u00E2\u0080\u0093") // false (corrupted em-dash)
 * isValidUTF8("\u00E2\u0080\u00995") // false (corrupted apostrophe + number)
 */
export function isValidUTF8(text: string): boolean {
  if (!text || typeof text !== "string") {
    return false;
  }

  // Check for common encoding artifacts
  for (const artifact of ENCODING_ARTIFACTS) {
    if (text.includes(artifact)) {
      return false;
    }
  }

  // Check for invalid control characters (except common whitespace)
  // Control characters in range 0x00-0x1F (except tab, newline, carriage return)
  // and 0x7F-0x9F should not appear in normal text
  const invalidControlChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/;
  if (invalidControlChars.test(text)) {
    return false;
  }

  return true;
}

/**
 * Sanitize a value by detecting and handling UTF-8 encoding artifacts
 * 
 * When encoding artifacts are detected, returns the fallback value.
 * For null/undefined/empty values, returns the fallback.
 * For valid values, returns the value as a string.
 * 
 * @param value - Value to sanitize (string, number, null, or undefined)
 * @param fallback - Fallback value to return for invalid data (default: "0")
 * @param options - Additional sanitization options
 * @returns Sanitized string value
 * 
 * @example
 * // Valid values pass through
 * sanitizeValue("42") // "42"
 * sanitizeValue(1024) // "1024"
 * sanitizeValue("Hello") // "Hello"
 * 
 * // Garbled text returns fallback
 * sanitizeValue("\u00E2\u0080\u0093") // "0" (corrupted em-dash)
 * sanitizeValue("\u00E2\u0080\u00995") // "0" (corrupted apostrophe)
 * 
 * // Null/undefined/empty returns fallback
 * sanitizeValue(null) // "0"
 * sanitizeValue(undefined) // "0"
 * sanitizeValue("") // "0"
 * 
 * // Custom fallback
 * sanitizeValue("\u00E2\u0080\u0093", "N/A") // "N/A"
 * sanitizeValue(null, "--") // "--"
 */
export function sanitizeValue(
  value: string | number | null | undefined,
  fallback: string = "0",
  options?: SanitizeOptions
): string {
  const opts: Required<SanitizeOptions> = {
    fallback: fallback,
    trim: true,
    customArtifacts: [],
    ...options,
  };

  // Handle null, undefined, or empty values
  if (value === null || value === undefined) {
    return opts.fallback;
  }

  // Convert numbers to strings
  if (typeof value === "number") {
    // Check for NaN and Infinity
    if (!isFinite(value)) {
      return opts.fallback;
    }
    return value.toString();
  }

  // Ensure we're working with a string
  if (typeof value !== "string") {
    return opts.fallback;
  }

  // Check for encoding artifacts BEFORE trimming
  // (trimming can remove parts of multi-byte artifacts like \u00C3\u00A0)
  if (!isValidUTF8(value)) {
    return opts.fallback;
  }

  // Trim if requested
  const processedValue = opts.trim ? value.trim() : value;

  // Empty string after trimming
  if (processedValue === "") {
    return opts.fallback;
  }

  // Check for custom artifacts
  if (opts.customArtifacts.length > 0) {
    for (const artifact of opts.customArtifacts) {
      if (processedValue.includes(artifact)) {
        return opts.fallback;
      }
    }
  }

  // Value is valid, return it
  return processedValue;
}

/**
 * Sanitize a numeric value specifically for display contexts
 * 
 * This is a convenience wrapper around sanitizeValue that ensures
 * the result can be safely displayed as a number.
 * 
 * @param value - Value to sanitize
 * @param fallback - Fallback value (default: "0")
 * @returns Sanitized numeric string
 * 
 * @example
 * sanitizeNumeric("42") // "42"
 * sanitizeNumeric(1024) // "1024"
 * sanitizeNumeric("\u00E2\u0080\u0093") // "0" (corrupted em-dash)
 * sanitizeNumeric(null) // "0"
 * sanitizeNumeric("invalid", "--") // "--"
 */
export function sanitizeNumeric(
  value: string | number | null | undefined,
  fallback: string = "0"
): string {
  return sanitizeValue(value, fallback, { trim: true });
}

/**
 * Check if a string contains any of the specified encoding artifacts
 * 
 * @param text - Text to check
 * @param artifacts - Array of artifact patterns to check for
 * @returns true if any artifact is found, false otherwise
 * 
 * @example
 * containsArtifacts("\u00E2\u0080\u0093", ["\u00E2\u0080\u0093"]) // true
 * containsArtifacts("Hello", ["\u00E2\u0080\u0093"]) // false
 */
export function containsArtifacts(text: string, artifacts: string[]): boolean {
  if (!text || typeof text !== "string") {
    return false;
  }

  for (const artifact of artifacts) {
    if (text.includes(artifact)) {
      return true;
    }
  }

  return false;
}

/**
 * Get a list of all default encoding artifacts checked by this module
 * 
 * @returns Array of encoding artifact patterns
 */
export function getEncodingArtifacts(): readonly string[] {
  return [...ENCODING_ARTIFACTS];
}
