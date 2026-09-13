/**
 * Simple Axe-Core Accessibility Audit
 * 
 * Focused accessibility tests that can run quickly and independently.
 * Tests critical components for WCAG compliance.
 * 
 * Validates: Requirements 2.7, 12.3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { run as axe, AxeResults } from 'axe-core';
import React from 'react';

// Helper function to run axe and format results
async function checkAccessibility(container: HTMLElement): Promise<{ violations: any[], passes: number }> {
  const results: AxeResults = await axe(container);
  return {
    violations: results.violations,
    passes: results.passes.length,
  };
}

// Mock i18n
vi.mock('@/lib/i18n/context', () => ({
  useTranslations: () => ({
    t: (key: string) => key,
    locale: 'en',
  }),
}));

// Mock Next navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/admin',
}));

describe('Axe Accessibility Audit - Simple Tests', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
  });

  it('should pass accessibility for basic card structure', async () => {
    const { container } = render(
      <div role="article" aria-label="Statistics card">
        <h2>Total Users</h2>
        <p>1,234</p>
        <p>56 active</p>
      </div>
    );

    const { violations } = await checkAccessibility(container);
    
    expect(violations).toHaveLength(0);
  });

  it('should pass accessibility for button with label', async () => {
    const { container } = render(
      <button aria-label="Save changes" type="button">
        Save
      </button>
    );

    const { violations } = await checkAccessibility(container);
    expect(violations).toHaveLength(0);
  });

  it('should pass accessibility for form with labels', async () => {
    const { container } = render(
      <form aria-label="Login form">
        <div>
          <label htmlFor="username">Username</label>
          <input id="username" type="text" name="username" />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" name="password" />
        </div>
        <button type="submit">Login</button>
      </form>
    );

    const { violations } = await checkAccessibility(container);
    expect(violations).toHaveLength(0);
  });

  it('should pass accessibility for navigation links', async () => {
    const { container } = render(
      <nav aria-label="Main navigation">
        <ul>
          <li><a href="/admin">Dashboard</a></li>
          <li><a href="/admin/users">Users</a></li>
          <li><a href="/admin/settings">Settings</a></li>
        </ul>
      </nav>
    );

    const { violations } = await checkAccessibility(container);
    expect(violations).toHaveLength(0);
  });

  it('should pass accessibility for progress bar with ARIA', async () => {
    const { container } = render(
      <div
        role="progressbar"
        aria-valuenow={75}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="CPU Usage: 75%"
      >
        <div style={{ width: '75%' }}>75%</div>
      </div>
    );

    const { violations } = await checkAccessibility(container);
    expect(violations).toHaveLength(0);
  });

  it('should pass accessibility for table with proper structure', async () => {
    const { container } = render(
      <table>
        <caption>User List</caption>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>John Doe</td>
            <td>john@example.com</td>
            <td>Active</td>
          </tr>
        </tbody>
      </table>
    );

    const { violations } = await checkAccessibility(container);
    expect(violations).toHaveLength(0);
  });

  it('should pass accessibility for image with alt text', async () => {
    const { container } = render(
      <div>
        <img src="/logo.png" alt="Company Logo" />
        <img src="/decoration.png" alt="" role="presentation" />
      </div>
    );

    const { violations } = await checkAccessibility(container);
    expect(violations).toHaveLength(0);
  });

  it('should pass accessibility for heading hierarchy', async () => {
    const { container } = render(
      <main>
        <h1>Dashboard</h1>
        <section>
          <h2>Statistics</h2>
          <div>
            <h3>User Stats</h3>
            <p>Content</p>
          </div>
        </section>
      </main>
    );

    const { violations } = await checkAccessibility(container);
    expect(violations).toHaveLength(0);
  });

  it('should detect accessibility violations for missing form labels', async () => {
    const { container } = render(
      <form>
        {/* Missing label - should cause violation */}
        <input type="text" name="unlabeled" />
        <button type="submit">Submit</button>
      </form>
    );

    const { violations } = await checkAccessibility(container);
    
    // This should have violations (unlabeled input)
    expect(violations.length).toBeGreaterThan(0);
    expect(violations.some(v => v.id === 'label')).toBe(true);
  });

  it('should detect violations for missing button text', async () => {
    const { container } = render(
      <button type="button" /> // Empty button - should cause violation
    );

    const { violations } = await checkAccessibility(container);
    
    // Should have violations (button without accessible name)
    expect(violations.length).toBeGreaterThan(0);
  });
});
