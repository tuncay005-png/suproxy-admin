import { describe, it, expect } from "vitest";
import { cn } from "./cn";

describe("cn utility", () => {
  it("should merge class names", () => {
    const result = cn("px-2 py-1", "px-4");
    expect(result).toBe("py-1 px-4");
  });

  it("should handle conditional classes", () => {
    const isActive = true;
    const result = cn("text-red-500", isActive && "text-blue-500");
    expect(result).toBe("text-blue-500");
  });

  it("should handle undefined and null values", () => {
    const result = cn("text-red-500", undefined, null, "bg-blue-500");
    expect(result).toBe("text-red-500 bg-blue-500");
  });

  it("should deduplicate conflicting Tailwind classes", () => {
    const result = cn("p-4", "p-2");
    expect(result).toBe("p-2");
  });

  it("should handle arrays of classes", () => {
    const result = cn(["text-sm", "font-bold"], "text-lg");
    expect(result).toBe("font-bold text-lg");
  });
});
