import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatDateTime,
  truncateText,
  capitalize,
  toTitleCase,
  formatNumber,
  formatBytes,
  formatUptime,
  formatTrafficSpeed,
  formatTrafficVolume,
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

  describe("formatUptime", () => {
    it("should format uptime in Xd Xh Xm pattern", () => {
      expect(formatUptime(0)).toBe("0m");
      expect(formatUptime(90)).toBe("1m"); // 1 minute 30 seconds -> shows only 1m
      expect(formatUptime(3600)).toBe("1h");
      expect(formatUptime(3665)).toBe("1h 1m");
      expect(formatUptime(86400)).toBe("1d");
      expect(formatUptime(172800)).toBe("2d");
      expect(formatUptime(90061)).toBe("1d 1h 1m"); // 1 day, 1 hour, 1 minute, 1 second -> shows 1d 1h 1m
    });

    it("should handle negative values", () => {
      expect(formatUptime(-100)).toBe("0m");
    });

    it("should show only non-zero values", () => {
      expect(formatUptime(60)).toBe("1m");
      expect(formatUptime(3600)).toBe("1h");
      expect(formatUptime(7200)).toBe("2h");
      expect(formatUptime(90000)).toBe("1d 1h");
    });
  });

  describe("formatTrafficSpeed", () => {
    it("should format traffic speed in KB/s below 1024 threshold", () => {
      expect(formatTrafficSpeed(0)).toBe("0.00 KB/s");
      expect(formatTrafficSpeed(512)).toBe("0.50 KB/s");
      expect(formatTrafficSpeed(1024)).toBe("1.00 KB/s");
      expect(formatTrafficSpeed(1536)).toBe("1.50 KB/s");
      expect(formatTrafficSpeed(1023 * 1024)).toBe("1023.00 KB/s");
    });

    it("should convert to MB/s at 1024 KB/s threshold", () => {
      expect(formatTrafficSpeed(1024 * 1024)).toBe("1.00 MB/s");
      expect(formatTrafficSpeed(1536 * 1024)).toBe("1.50 MB/s");
      expect(formatTrafficSpeed(2 * 1024 * 1024)).toBe("2.00 MB/s");
      expect(formatTrafficSpeed(2.5 * 1024 * 1024)).toBe("2.50 MB/s");
    });

    it("should handle negative values gracefully", () => {
      expect(formatTrafficSpeed(-100)).toBe("0.00 KB/s");
    });

    it("should format with exactly 2 decimal places", () => {
      expect(formatTrafficSpeed(1234)).toBe("1.21 KB/s");
      expect(formatTrafficSpeed(1234567)).toBe("1.18 MB/s");
    });
  });

  describe("formatTrafficVolume", () => {
    it("should format traffic volume in GB below 1024 threshold", () => {
      expect(formatTrafficVolume(0)).toBe("0.00 GB");
      expect(formatTrafficVolume(1073741824)).toBe("1.00 GB"); // 1 GB
      expect(formatTrafficVolume(2147483648)).toBe("2.00 GB"); // 2 GB
      expect(formatTrafficVolume(536870912)).toBe("0.50 GB"); // 0.5 GB
      expect(formatTrafficVolume(1023 * 1024 * 1024 * 1024)).toBe("1023.00 GB");
    });

    it("should convert to TB at 1024 GB threshold", () => {
      expect(formatTrafficVolume(1024 * 1024 * 1024 * 1024)).toBe("1.00 TB");
      expect(formatTrafficVolume(1.5 * 1024 * 1024 * 1024 * 1024)).toBe("1.50 TB");
      expect(formatTrafficVolume(2 * 1024 * 1024 * 1024 * 1024)).toBe("2.00 TB");
    });

    it("should handle negative values gracefully", () => {
      expect(formatTrafficVolume(-100)).toBe("0.00 GB");
    });

    it("should format with exactly 2 decimal places", () => {
      expect(formatTrafficVolume(1234567890)).toBe("1.15 GB");
      expect(formatTrafficVolume(1234567890123)).toBe("1.12 TB");
    });
  });
});
