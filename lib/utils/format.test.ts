import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatDateTime,
  truncateText,
  capitalize,
  toTitleCase,
  formatNumber,
  formatBytes,
} from "./format";

describe("format utilities", () => {
  describe("formatDate", () => {
    it("should format a date string correctly", () => {
      const result = formatDate("2024-01-15T10:30:00Z");
      expect(result).toBe("Jan 15, 2024");
    });

    it("should handle invalid dates", () => {
      const result = formatDate("invalid-date");
      expect(result).toBe("Invalid date");
    });

    it("should format Date objects", () => {
      const date = new Date("2024-01-15T10:30:00Z");
      const result = formatDate(date);
      expect(result).toBe("Jan 15, 2024");
    });
  });

  describe("formatDateTime", () => {
    it("should format date and time", () => {
      const result = formatDateTime("2024-01-15T10:30:00Z");
      expect(result).toContain("Jan 15, 2024 at");
      expect(result).toMatch(/\d{1,2}:\d{2} (AM|PM)/);
    });

    it("should handle invalid dates", () => {
      const result = formatDateTime("invalid-date");
      expect(result).toBe("Invalid date");
    });
  });

  describe("truncateText", () => {
    it("should truncate text longer than maxLength", () => {
      const result = truncateText("This is a long text", 10);
      expect(result).toBe("This is...");
    });

    it("should not truncate text shorter than maxLength", () => {
      const result = truncateText("Short", 10);
      expect(result).toBe("Short");
    });

    it("should use custom suffix", () => {
      const result = truncateText("This is a long text", 10, "…");
      expect(result).toBe("This is a…");
    });
  });

  describe("capitalize", () => {
    it("should capitalize first letter", () => {
      expect(capitalize("hello")).toBe("Hello");
    });

    it("should handle empty strings", () => {
      expect(capitalize("")).toBe("");
    });

    it("should not affect already capitalized text", () => {
      expect(capitalize("Hello")).toBe("Hello");
    });
  });

  describe("toTitleCase", () => {
    it("should convert to title case", () => {
      expect(toTitleCase("hello world")).toBe("Hello World");
    });

    it("should handle single words", () => {
      expect(toTitleCase("hello")).toBe("Hello");
    });
  });

  describe("formatNumber", () => {
    it("should format with thousands separators", () => {
      expect(formatNumber(1234567)).toBe("1,234,567");
    });

    it("should handle decimal options", () => {
      const result = formatNumber(1234.56, { minimumFractionDigits: 2 });
      expect(result).toBe("1,234.56");
    });
  });

  describe("formatBytes", () => {
    it("should format bytes correctly", () => {
      expect(formatBytes(0)).toBe("0 Bytes");
      expect(formatBytes(1024)).toBe("1 KB");
      expect(formatBytes(1048576)).toBe("1 MB");
    });

    it("should respect decimal parameter", () => {
      expect(formatBytes(1536, 1)).toBe("1.5 KB");
    });
  });
});
