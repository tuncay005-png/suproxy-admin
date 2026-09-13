'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * CircularProgressChart Component
 * 
 * Displays a circular progress indicator with dynamic coloring based on value thresholds.
 * Uses SVG for rendering and CSS transitions for smooth animations.
 * 
 * Accessibility Features:
 * - role="progressbar" on the chart container
 * - aria-valuenow, aria-valuemin, aria-valuemax for current state
 * - aria-label with comprehensive metric description
 * - aria-live region for announcing real-time updates to screen readers
 * 
 * Color Thresholds:
 * - Green (#22c55e): 0-69%
 * - Yellow (#eab308): 70-89%
 * - Red (#ef4444): 90-100%
 * 
 * @example
 * ```tsx
 * <CircularProgressChart
 *   value={75}
 *   max={100}
 *   label="CPU"
 *   unit="%"
 *   size={120}
 * />
 * ```
 * 
 * @example
 * ```tsx
 * // With custom color override and accessibility label
 * <CircularProgressChart
 *   value={1024}
 *   max={4096}
 *   label="RAM"
 *   unit="MB"
 *   color="yellow"
 *   ariaLabel="RAM usage: 1024 out of 4096 megabytes"
 * />
 * ```
 */

interface CircularProgressChartProps {
  /** Current value to display */
  value: number;
  /** Maximum value for percentage calculation */
  max: number;
  /** Label text displayed below the chart */
  label: string;
  /** Unit suffix (%, MB, GB) */
  unit: string;
  /** Chart diameter in pixels (default: 120) */
  size?: number;
  /** Stroke width in pixels (default: 8) */
  strokeWidth?: number;
  /** Override automatic color selection */
  color?: 'green' | 'yellow' | 'red';
  /** CSS class for additional styling */
  className?: string;
  /** Accessible description for screen readers */
  ariaLabel?: string;
}

/**
 * Determines the chart color based on percentage thresholds.
 * Uses CSS variables defined in globals.css for consistent theming.
 * 
 * Color Thresholds:
 * - Green (var(--color-chart-green)): 0-69%
 * - Yellow (var(--color-chart-yellow)): 70-89%
 * - Red (var(--color-chart-red)): 90-100%
 * 
 * @param percentage - The percentage value (0-100)
 * @returns CSS variable string for the appropriate color
 * 
 * @example
 * getChartColor(50) // returns 'var(--color-chart-green)'
 * getChartColor(75) // returns 'var(--color-chart-yellow)'
 * getChartColor(95) // returns 'var(--color-chart-red)'
 */
export function getChartColor(percentage: number): string {
  if (percentage >= 90) return 'var(--color-chart-red)';
  if (percentage >= 70) return 'var(--color-chart-yellow)';
  return 'var(--color-chart-green)';
}

/**
 * Maps color names to CSS variable strings.
 * Allows explicit color override via the color prop.
 */
function getColorVariable(color: 'green' | 'yellow' | 'red'): string {
  const colorMap = {
    green: 'var(--color-chart-green)',
    yellow: 'var(--color-chart-yellow)',
    red: 'var(--color-chart-red)',
  };
  return colorMap[color];
}

export function CircularProgressChart({
  value,
  max,
  label,
  unit,
  size = 120,
  strokeWidth = 8,
  color,
  className,
  ariaLabel,
}: CircularProgressChartProps) {
  const [percentage, setPercentage] = useState(0);

  // Calculate percentage
  useEffect(() => {
    const calculatedPercentage = max > 0 ? Math.min(Math.max((value / max) * 100, 0), 100) : 0;
    setPercentage(calculatedPercentage);
  }, [value, max]);

  // Determine display color
  const displayColor = color ? getColorVariable(color) : getChartColor(percentage);

  // Calculate SVG circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Center point of the SVG
  const center = size / 2;

  // Format the display value
  const displayValue = Math.round(value);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        className
      )}
    >
      {/* SVG Circular Chart with progressbar role and ARIA attributes */}
      <div 
        className="relative" 
        style={{ width: size, height: size }}
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel || `${label}: ${displayValue}${unit} out of ${max}${unit}, ${Math.round(percentage)} percent`}
      >
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          aria-hidden="true"
        >
          {/* Background circle (gray) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#2a2a2a"
            strokeWidth={strokeWidth}
          />

          {/* Progress circle (colored) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={displayColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-[stroke-dashoffset] duration-300 ease-out"
            style={{ willChange: 'stroke-dashoffset' }}
          />
        </svg>

        {/* Center text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-semibold text-foreground">
              {displayValue}
              <span className="text-sm text-muted-foreground ml-0.5">{unit}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {Math.round(percentage)}%
            </p>
          </div>
        </div>
      </div>

      {/* Label below chart */}
      <p className="mt-3 text-sm font-medium text-foreground">
        {label}
      </p>

      {/* Live region for real-time updates - announces changes to screen readers */}
      <div 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {label} updated: {displayValue}{unit}, {Math.round(percentage)} percent
      </div>
    </div>
  );
}
