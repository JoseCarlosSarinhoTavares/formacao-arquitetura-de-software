// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  use: {
    headless: true,
    browserName: 'chromium',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

