import { test, expect } from '@playwright/test';




// Your test case matching your exact logic using testInfo parameters
test('screenShotFailure', async ({ page , context }) => {
  

  // Perform your actions
  await page.goto('/login');   // fetch from playwright.config.ts 

  
  // (Optional demonstration) Let's explicitly look for something that will fail 
  // to force the screenshot execution:
  await expect(page.locator('h1')).toHaveText('This Heading Will Fail Intentionally');
});
