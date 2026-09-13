/**
 * Format a date to a human-readable string
 * @param date - Date string, Date object, or timestamp
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date string
 * 
 * @example
 * formatDate("2024-01-15T10:30:00Z") // "Jan 15, 2024"
 * formatDate(new Date(), { dateStyle: "full" }) // "Monday, January 15, 2024"
 */
export function formatDate(
  date: string | Date | number,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  }
): string {
  const dateObj = typeof date === "string" || typeof date === "number" 
    ? new Date(date) 
    : date;
  
  if (isNaN(dateObj.getTime())) {
    return "Invalid date";
  }
  
  return new Intl.DateTimeFormat("en-US", options).format(dateObj);
}

/**
 * Format a date with time to a human-readable string
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date and time string
 * 
 * @example
 * formatDateTime("2024-01-15T10:30:00Z") // "Jan 15, 2024 at 10:30 AM"
 */
export function formatDateTime(date: string | Date | number): string {
  const dateObj = typeof date === "string" || typeof date === "number"
    ? new Date(date)
    : date;
  
  if (isNaN(dateObj.getTime())) {
    return "Invalid date";
  }
  
  const datePart = formatDate(dateObj);
  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(dateObj);
  
  return `${datePart} at ${timePart}`;
}

/**
 * Format a relative time from now (e.g., "2 hours ago", "in 3 days")
 * @param date - Date string, Date object, or timestamp
 * @returns Relative time string
 * 
 * @example
 * formatRelativeTime(Date.now() - 3600000) // "1 hour ago"
 * formatRelativeTime(Date.now() + 86400000) // "in 1 day"
 */
export function formatRelativeTime(date: string | Date | number): string {
  const dateObj = typeof date === "string" || typeof date === "number"
    ? new Date(date)
    : date;
  
  if (isNaN(dateObj.getTime())) {
    return "Invalid date";
  }
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  
  const absSeconds = Math.abs(diffInSeconds);
  
  if (absSeconds < 60) {
    return rtf.format(-diffInSeconds, "second");
  } else if (absSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), "minute");
  } else if (absSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), "hour");
  } else if (absSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), "day");
  } else if (absSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), "month");
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), "year");
  }
}

/**
 * Truncate text to a specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to append (default: "...")
 * @returns Truncated text
 * 
 * @example
 * truncateText("This is a long text", 10) // "This is a..."
 * truncateText("Short", 10) // "Short"
 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = "..."
): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalize the first letter of a string
 * @param text - Text to capitalize
 * @returns Capitalized text
 * 
 * @example
 * capitalize("hello world") // "Hello world"
 */
export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Convert a string to title case
 * @param text - Text to convert
 * @returns Title-cased text
 * 
 * @example
 * toTitleCase("hello world") // "Hello World"
 */
export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(" ")
    .map(word => capitalize(word))
    .join(" ");
}

/**
 * Format a number with thousands separators
 * @param value - Number to format
 * @param options - Intl.NumberFormatOptions for formatting
 * @returns Formatted number string
 * 
 * @example
 * formatNumber(1234567) // "1,234,567"
 * formatNumber(1234.56, { minimumFractionDigits: 2 }) // "1,234.56"
 */
export function formatNumber(
  value: number,
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat("en-US", options).format(value);
}

/**
 * Format bytes to human-readable size
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted size string
 * 
 * @example
 * formatBytes(1024) // "1.00 KB"
 * formatBytes(1234567) // "1.18 MB"
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format uptime in seconds to human-readable duration
 * Formats as "Xd Xh Xm" pattern, showing only non-zero values
 * @param seconds - Uptime in seconds
 * @returns Formatted uptime string
 * 
 * @example
 * formatUptime(0) // "0m"
 * formatUptime(90) // "1m"
 * formatUptime(3665) // "1h 1m"
 * formatUptime(172800) // "2d 0h 0m"
 */
export function formatUptime(seconds: number): string {
  if (seconds < 0) return "0m";
  if (seconds === 0) return "0m";
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  const parts: string[] = [];
  
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  
  return parts.join(' ') || '0m';
}

/**
 * Format traffic speed (bytes per second) with auto-conversion between KB/s and MB/s
 * Converts to MB/s when value reaches 1024 KB/s threshold
 * @param bytesPerSecond - Traffic speed in bytes per second
 * @returns Formatted traffic speed string with appropriate unit
 * 
 * @example
 * formatTrafficSpeed(512) // "0.50 KB/s"
 * formatTrafficSpeed(1024) // "1.00 KB/s"
 * formatTrafficSpeed(1536) // "1.50 KB/s"
 * formatTrafficSpeed(1048576) // "1.00 MB/s"
 * formatTrafficSpeed(2621440) // "2.50 MB/s"
 */
export function formatTrafficSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond < 0) return "0.00 KB/s";
  
  const kbPerSecond = bytesPerSecond / 1024;
  
  if (kbPerSecond >= 1024) {
    const mbPerSecond = kbPerSecond / 1024;
    return `${mbPerSecond.toFixed(2)} MB/s`;
  }
  
  return `${kbPerSecond.toFixed(2)} KB/s`;
}

/**
 * Format traffic volume (bytes) with auto-conversion between GB and TB
 * Converts to TB when value reaches 1024 GB threshold
 * @param bytes - Traffic volume in bytes
 * @returns Formatted traffic volume string with appropriate unit
 * 
 * @example
 * formatTrafficVolume(1073741824) // "1.00 GB"
 * formatTrafficVolume(2147483648) // "2.00 GB"
 * formatTrafficVolume(1099511627776) // "1.00 TB"
 * formatTrafficVolume(2199023255552) // "2.00 TB"
 */
export function formatTrafficVolume(bytes: number): string {
  if (bytes < 0) return "0.00 GB";
  
  const gb = bytes / (1024 * 1024 * 1024);
  
  if (gb >= 1024) {
    const tb = gb / 1024;
    return `${tb.toFixed(2)} TB`;
  }
  
  return `${gb.toFixed(2)} GB`;
}
