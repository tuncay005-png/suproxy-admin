/**
 * Axe-Core Accessibility Testing Helper
 * 
 * Provides utilities for running automated accessibility audits using axe-core.
 * This helper simplifies axe-core integration and provides consistent reporting.
 * 
 * @module lib/test-utils/axe-helper
 */

import { axe, toHaveNoViolations } from 'jest-axe';
import { expect } from 'vitest';

// Extend Vitest matchers with jest-axe
expect.extend(toHaveNoViolations);

/**
 * Axe configuration for automated testing
 */
export const axeConfig = {
  rules: {
    // WCAG 2.1 Level A & AA rules
    'color-contrast': { enabled: true },
    'valid-lang': { enabled: true },
    'html-has-lang': { enabled: true },
    'landmark-one-main': { enabled: true },
    'region': { enabled: true },
    'aria-allowed-attr': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'button-name': { enabled: true },
    'link-name': { enabled: true },
    'label': { enabled: true },
    'image-alt': { enabled: true },
  },
};

/**
 * Run axe-core accessibility audit on a rendered component
 * 
 * @param container - The DOM element to audit
 * @param config - Optional axe configuration overrides
 * @returns Promise resolving to axe results
 * 
 * @example
 * ```typescript
 * const { container } = render(<MyComponent />);
 * const results = await runAxeAudit(container);
 * expect(results).toHaveNoViolations();
 * ```
 */
export async function runAxeAudit(
  container: Element,
  config = axeConfig
) {
  return await axe(container, config);
}

/**
 * Violation severity levels
 */
export type ViolationLevel = 'critical' | 'serious' | 'moderate' | 'minor';

/**
 * Categorize violations by severity level
 * 
 * @param results - Axe audit results
 * @returns Object with violations grouped by severity
 */
export function categorizeViolations(results: any) {
  const violations = results.violations || [];
  
  return {
    critical: violations.filter((v: any) => v.impact === 'critical'),
    serious: violations.filter((v: any) => v.impact === 'serious'),
    moderate: violations.filter((v: any) => v.impact === 'moderate'),
    minor: violations.filter((v: any) => v.impact === 'minor'),
  };
}

/**
 * Format violation details for reporting
 * 
 * @param violation - Axe violation object
 * @returns Formatted string with violation details
 */
export function formatViolation(violation: any): string {
  const nodes = violation.nodes.map((node: any) => {
    return `    - ${node.html}\n      ${node.failureSummary}`;
  }).join('\n\n');

  return `
  Rule: ${violation.id}
  Impact: ${violation.impact}
  Description: ${violation.description}
  Help: ${violation.help}
  WCAG: ${violation.tags.filter((tag: string) => tag.startsWith('wcag')).join(', ')}
  
  Affected Elements:
${nodes}
`;
}

/**
 * Generate a comprehensive accessibility report
 * 
 * @param results - Axe audit results
 * @param componentName - Name of the tested component
 * @returns Markdown-formatted report string
 */
export function generateAccessibilityReport(
  results: any,
  componentName: string
): string {
  const categorized = categorizeViolations(results);
  const totalViolations = results.violations.length;
  
  if (totalViolations === 0) {
    return `# ✅ Accessibility Audit: ${componentName}\n\n**Status:** PASSED - No violations detected\n`;
  }

  let report = `# Accessibility Audit Report: ${componentName}\n\n`;
  report += `**Total Violations:** ${totalViolations}\n\n`;
  report += `**Breakdown:**\n`;
  report += `- 🔴 Critical: ${categorized.critical.length}\n`;
  report += `- 🟠 Serious: ${categorized.serious.length}\n`;
  report += `- 🟡 Moderate: ${categorized.moderate.length}\n`;
  report += `- 🔵 Minor: ${categorized.minor.length}\n\n`;

  // Critical violations
  if (categorized.critical.length > 0) {
    report += `## 🔴 Critical Violations\n\n`;
    report += `**Action Required:** These must be fixed immediately.\n\n`;
    categorized.critical.forEach((v: any) => {
      report += formatViolation(v);
      report += '\n---\n';
    });
  }

  // Serious violations
  if (categorized.serious.length > 0) {
    report += `## 🟠 Serious Violations\n\n`;
    report += `**Action Required:** These should be fixed as soon as possible.\n\n`;
    categorized.serious.forEach((v: any) => {
      report += formatViolation(v);
      report += '\n---\n';
    });
  }

  // Moderate violations
  if (categorized.moderate.length > 0) {
    report += `## 🟡 Moderate Violations\n\n`;
    report += `**Action Recommended:** These should be addressed in the near future.\n\n`;
    categorized.moderate.forEach((v: any) => {
      report += formatViolation(v);
      report += '\n---\n';
    });
  }

  // Minor violations
  if (categorized.minor.length > 0) {
    report += `## 🔵 Minor Violations\n\n`;
    report += `**Action Optional:** These can be addressed as time permits.\n\n`;
    categorized.minor.forEach((v: any) => {
      report += formatViolation(v);
      report += '\n---\n';
    });
  }

  return report;
}
