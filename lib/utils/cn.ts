import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes with proper precedence.
 * Combines clsx for conditional classes and tailwind-merge for deduplication.
 * 
 * @param inputs - Class names, conditional classes, or arrays of classes
 * @returns Merged and deduplicated class string
 * 
 * @example
 * cn("px-2 py-1", "px-4") // "py-1 px-4"
 * cn("text-red-500", isActive && "text-blue-500") // "text-blue-500" if isActive
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
