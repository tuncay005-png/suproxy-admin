import { describe, it, expect } from "vitest";
import {
  isValidUTF8,
  sanitizeValue,
  sanitizeNumeric,
  containsArtifacts,
  getEncodingArtifacts,
} from "./encoding";

describe("isValidUTF8", () => {
  describe("valid UTF-8 strings", () => {
    it("should return true for valid numbers", () => {
      expect(isValidUTF8("42")).toBe(true);
      expect(isValidUTF8("1024")).toBe(true);
      expect(isValidUTF8("0")).toBe(true);
      expect(isValidUTF8("3.14")).toBe(true);
    });

    it("should return true for valid text", () => {
      expect(isValidUTF8("Hello World")).toBe(true);
      expect(isValidUTF8("Test 123")).toBe(true);
      expect(isValidUTF8("Valid text")).toBe(true);
    });

    it("should return true for text with whitespace", () => {
      expect(isValidUTF8("  spaced  ")).toBe(true);
      expect(isValidUTF8("line\nbreak")).toBe(true);
      expect(isValidUTF8("tab\there")).toBe(true);
    });
  });

  describe("invalid UTF-8 strings with encoding artifacts", () => {
    it("should return false for em-dash artifact", () => {
      expect(isValidUTF8("\u00E2\u0080\u0093")).toBe(false); // â€"
    });

    it("should return false for apostrophe artifact", () => {
      expect(isValidUTF8("\u00E2\u0080\u0099")).toBe(false); // â€™
      expect(isValidUTF8("\u00E2\u0080\u00995")).toBe(false); // â€™5
    });

    it("should return false for quotation mark artifacts", () => {
      expect(isValidUTF8("\u00E2\u0080\u009C")).toBe(false); // â€œ
      expect(isValidUTF8("\u00E2\u0080\u009D")).toBe(false); // â€
    });

    it("should return false for other common artifacts", () => {
      expect(isValidUTF8("\u00E2\u0080\u00A2")).toBe(false); // â€¢ bullet
      expect(isValidUTF8("\u00C3\u00A9")).toBe(false); // Ã© corrupted é
      expect(isValidUTF8("\u00C2")).toBe(false); // Â corrupted nbsp
    });

    it("should return false for text containing artifacts", () => {
      expect(isValidUTF8("Value: \u00E2\u0080\u0093")).toBe(false);
      expect(isValidUTF8("It's: \u00E2\u0080\u00995")).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should return false for empty string", () => {
      expect(isValidUTF8("")).toBe(false);
    });

    it("should return false for non-string values", () => {
      expect(isValidUTF8(null as any)).toBe(false);
      expect(isValidUTF8(undefined as any)).toBe(false);
      expect(isValidUTF8(42 as any)).toBe(false);
    });

    it("should return false for strings with invalid control characters", () => {
      expect(isValidUTF8("test\x00null")).toBe(false);
      expect(isValidUTF8("test\x1Fcontrol")).toBe(false);
    });

    it("should allow valid whitespace control characters", () => {
      expect(isValidUTF8("test\ttab")).toBe(true); // tab
      expect(isValidUTF8("test\nline")).toBe(true); // newline
      expect(isValidUTF8("test\rcarriage")).toBe(true); // carriage return
    });
  });
});

describe("sanitizeValue", () => {
  describe("valid values", () => {
    it("should pass through valid numbers as strings", () => {
      expect(sanitizeValue("42")).toBe("42");
      expect(sanitizeValue("1024")).toBe("1024");
      expect(sanitizeValue("0")).toBe("0");
    });

    it("should convert number values to strings", () => {
      expect(sanitizeValue(42)).toBe("42");
      expect(sanitizeValue(1024)).toBe("1024");
      expect(sanitizeValue(0)).toBe("0");
    });

    it("should pass through valid text", () => {
      expect(sanitizeValue("Hello")).toBe("Hello");
      expect(sanitizeValue("Test 123")).toBe("Test 123");
    });

    it("should trim whitespace by default", () => {
      expect(sanitizeValue("  42  ")).toBe("42");
      expect(sanitizeValue(" text ")).toBe("text");
    });
  });

  describe("garbled text returns fallback", () => {
    it("should return fallback for em-dash artifact", () => {
      expect(sanitizeValue("\u00E2\u0080\u0093")).toBe("0"); // â€"
      expect(sanitizeValue("\u00E2\u0080\u0093", "N/A")).toBe("N/A");
    });

    it("should return fallback for apostrophe artifact", () => {
      expect(sanitizeValue("\u00E2\u0080\u00995")).toBe("0"); // â€™5
      expect(sanitizeValue("\u00E2\u0080\u0099", "--")).toBe("--"); // â€™
    });

    it("should return fallback for quotation artifacts", () => {
      expect(sanitizeValue("\u00E2\u0080\u009Ctest")).toBe("0"); // â€œtest
      expect(sanitizeValue("test\u00E2\u0080\u009D")).toBe("0"); // testâ€
    });

    it("should return fallback for other artifacts", () => {
      expect(sanitizeValue("\u00E2\u0080\u00A2 item")).toBe("0"); // â€¢ item
      expect(sanitizeValue("\u00C3\u00A9cole")).toBe("0"); // Ã©cole
    });
  });

  describe("null/undefined/empty values", () => {
    it("should return fallback for null", () => {
      expect(sanitizeValue(null)).toBe("0");
      expect(sanitizeValue(null, "N/A")).toBe("N/A");
    });

    it("should return fallback for undefined", () => {
      expect(sanitizeValue(undefined)).toBe("0");
      expect(sanitizeValue(undefined, "--")).toBe("--");
    });

    it("should return fallback for empty string", () => {
      expect(sanitizeValue("")).toBe("0");
      expect(sanitizeValue("", "N/A")).toBe("N/A");
    });

    it("should return fallback for whitespace-only string", () => {
      expect(sanitizeValue("   ")).toBe("0");
      expect(sanitizeValue("  ", "N/A")).toBe("N/A");
    });
  });

  describe("special number values", () => {
    it("should return fallback for NaN", () => {
      expect(sanitizeValue(NaN)).toBe("0");
      expect(sanitizeValue(NaN, "N/A")).toBe("N/A");
    });

    it("should return fallback for Infinity", () => {
      expect(sanitizeValue(Infinity)).toBe("0");
      expect(sanitizeValue(-Infinity)).toBe("0");
    });

    it("should handle negative numbers correctly", () => {
      expect(sanitizeValue(-42)).toBe("-42");
      expect(sanitizeValue("-42")).toBe("-42");
    });

    it("should handle decimal numbers correctly", () => {
      expect(sanitizeValue(3.14)).toBe("3.14");
      expect(sanitizeValue("3.14")).toBe("3.14");
    });
  });

  describe("custom options", () => {
    it("should respect custom fallback value", () => {
      expect(sanitizeValue(null, "N/A")).toBe("N/A");
      expect(sanitizeValue("\u00E2\u0080\u0093", "--")).toBe("--"); // â€"
      expect(sanitizeValue(undefined, "Unknown")).toBe("Unknown");
    });

    it("should respect trim option", () => {
      expect(sanitizeValue("  42  ", "0", { trim: true })).toBe("42");
      expect(sanitizeValue("  42  ", "0", { trim: false })).toBe("  42  ");
    });

    it("should check custom artifacts", () => {
      const options = { customArtifacts: ["XXX", "BAD"] };
      expect(sanitizeValue("XXX", "0", options)).toBe("0");
      expect(sanitizeValue("testBAD", "0", options)).toBe("0");
      expect(sanitizeValue("good", "0", options)).toBe("good");
    });
  });
});

describe("sanitizeNumeric", () => {
  it("should sanitize valid numeric values", () => {
    expect(sanitizeNumeric("42")).toBe("42");
    expect(sanitizeNumeric(1024)).toBe("1024");
    expect(sanitizeNumeric("0")).toBe("0");
  });

  it("should return fallback for invalid values", () => {
    expect(sanitizeNumeric("\u00E2\u0080\u0093")).toBe("0"); // â€"
    expect(sanitizeNumeric(null)).toBe("0");
    expect(sanitizeNumeric(undefined)).toBe("0");
  });

  it("should respect custom fallback", () => {
    expect(sanitizeNumeric("\u00E2\u0080\u0093", "N/A")).toBe("N/A"); // â€"
    expect(sanitizeNumeric(null, "--")).toBe("--");
  });

  it("should handle edge cases", () => {
    expect(sanitizeNumeric(NaN)).toBe("0");
    expect(sanitizeNumeric(Infinity)).toBe("0");
    expect(sanitizeNumeric("")).toBe("0");
  });
});

describe("containsArtifacts", () => {
  it("should detect artifacts in text", () => {
    expect(containsArtifacts("\u00E2\u0080\u0093", ["\u00E2\u0080\u0093"])).toBe(true); // â€"
    expect(containsArtifacts("test\u00E2\u0080\u00995", ["\u00E2\u0080\u0099"])).toBe(true); // â€™
    expect(containsArtifacts("clean text", ["\u00E2\u0080\u0093"])).toBe(false);
  });

  it("should check multiple artifacts", () => {
    const artifacts = ["\u00E2\u0080\u0093", "\u00E2\u0080\u0099", "\u00C3\u00A9"]; // â€", â€™, Ã©
    expect(containsArtifacts("\u00E2\u0080\u0093", artifacts)).toBe(true);
    expect(containsArtifacts("\u00E2\u0080\u0099", artifacts)).toBe(true);
    expect(containsArtifacts("\u00C3\u00A9", artifacts)).toBe(true);
    expect(containsArtifacts("clean", artifacts)).toBe(false);
  });

  it("should handle edge cases", () => {
    expect(containsArtifacts("", ["\u00E2\u0080\u0093"])).toBe(false);
    expect(containsArtifacts(null as any, ["\u00E2\u0080\u0093"])).toBe(false);
    expect(containsArtifacts("test", [])).toBe(false);
  });
});

describe("getEncodingArtifacts", () => {
  it("should return an array of artifacts", () => {
    const artifacts = getEncodingArtifacts();
    expect(Array.isArray(artifacts)).toBe(true);
    expect(artifacts.length).toBeGreaterThan(0);
  });

  it("should include common artifacts", () => {
    const artifacts = getEncodingArtifacts();
    expect(artifacts).toContain("\u00E2\u0080\u0093"); // â€"
    expect(artifacts).toContain("\u00E2\u0080\u0099"); // â€™
    expect(artifacts).toContain("\u00C3\u00A9"); // Ã©
  });
});
