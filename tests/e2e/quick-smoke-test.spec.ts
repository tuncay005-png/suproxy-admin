/**
 * Quick Smoke Test for E2E Verification
 * Task 16.3: Simplified test to verify basic functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Quick Smoke Test', () => {
  test.setTimeout(30000); // 30 second timeout per test

  test('dashboard loads and displays key components', async ({ page }) => {
    // Navigate directly to admin (assumes already logged in or no auth)
    await page.goto('/admin');
    
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Check if we need to login
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('Login required, filling credentials...');
      await page.fill('input[type="text"], input[name="username"]', 'admin');
      await page.fill('input[type="password"], input[name="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/admin', { timeout: 10000 });
    }
    
    // Verify we're on the dashboard
    await expect(page).toHaveURL('/admin');
    
    // Check for heading
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 5000 });
    
    console.log('✓ Dashboard page loads');
  });

  test('circular progress charts are present', async ({ page }) => {
    await page.goto('/admin');
    
    // Check for login
    if (page.url().includes('/login')) {
      await page.fill('input[type="text"], input[name="username"]', 'admin');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/admin', { timeout: 10000 });
    }
    
    // Look for SVG progress charts
    const charts = page.locator('svg[role="progressbar"], svg circle');
    const chartCount = await charts.count();
    
    console.log(`Found ${chartCount} chart elements`);
    expect(chartCount).toBeGreaterThan(0);
    
    console.log('✓ Charts are present');
  });

  test('navigation sidebar is accessible', async ({ page }) => {
    await page.goto('/admin');
    
    // Check for login
    if (page.url().includes('/login')) {
      await page.fill('input[type="text"], input[name="username"]', 'admin');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/admin', { timeout: 10000 });
    }
    
    // Look for navigation
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible({ timeout: 5000 });
    
    // Check for navigation links
    const links = page.locator('nav a, nav button');
    const linkCount = await links.count();
    
    console.log(`Found ${linkCount} navigation items`);
    expect(linkCount).toBeGreaterThan(0);
    
    console.log('✓ Navigation is accessible');
  });

  test('can navigate to xray management pages', async ({ page }) => {
    await page.goto('/admin');
    
    // Check for login
    if (page.url().includes('/login')) {
      await page.fill('input[type="text"], input[name="username"]', 'admin');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/admin', { timeout: 10000 });
    }
    
    // Try to navigate to Xray Inbounds
    await page.goto('/admin/xray/inbounds');
    await page.waitForLoadState('domcontentloaded');
    
    // Should load without error
    await expect(page).toHaveURL('/admin/xray/inbounds');
    
    // Check for content
    const content = page.locator('body');
    await expect(content).toBeVisible();
    
    console.log('✓ Xray management page accessible');
  });
});
