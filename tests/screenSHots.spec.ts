import { test, expect } from '@playwright/test';

test('Capture various types of screenshots', async ({ page }) => {
  // Navigate to the target website
  await page.goto('https://playwright.dev');

  // 1. Standard Viewport Screenshot
  // Captures only what is currently visible in the browser viewport
  await page.screenshot({ 
    path: 'screenshots/visible-viewport.png' 
  });

  // 2. Full-Page Screenshot
  // Scrolls and captures the entire length of the webpage
  await page.screenshot({ 
    path: 'screenshots/full-page.png', 
    fullPage: true 
  });

  // 3. Specific Element Screenshot
  // Locates a single element, scrolls it into view, and captures it
  const getStartedButton = page.locator('a:has-text("Get started")');
  await getStartedButton.screenshot({ 
    path: 'screenshots/element-target.png' 
  });

  // 4. Capture into a Buffer (Alternative)
  // Useful if you want to upload the image directly to an API or S3 bucket without saving locally
  const buffer = await page.screenshot();
  console.log(`Screenshot captured in buffer. Size: ${buffer.length} bytes`);
});