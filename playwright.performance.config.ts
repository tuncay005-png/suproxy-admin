import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for performance testing
 * Task 16.4: Performance verification
 */
export default defineConfig({
  testDir: './tests/performance',
  fullyParallel: false, // Run performance tests sequentially
  forbidOnly: !!process.env.CI,
  retries: 0, // No retries for performance tests
  workers: 1, // Single worker for consistent metrics
  reporter: [['html', { outputFolder: 'playwright-report-performance' }], ['list']],
  
  timeout: 60000, // 60 second timeout for performance tests
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on',
    screenshot: 'on',
    video: 'on',
  },

  projects: [
    {
      name: 'Desktop Performance',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],

  // Production server should already be running for performance tests
  // We don't start a dev server here
});
