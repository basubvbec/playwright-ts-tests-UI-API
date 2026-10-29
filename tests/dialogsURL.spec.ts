import { test, expect } from '@playwright/test';

// ==========================================
// 1. JAVASCRIPT DIALOGS (Alert, Confirm, Prompt)
// ==========================================

test('1. Handle JavaScript Alert Box', async ({ page }) => {
  // Navigate to the stable LambdaTest sandbox URL
  await page.goto('https://lambdatest.com');
  await page.waitForTimeout(1500); // Visual pause after loading the page

  // Register the dialog handler BEFORE triggering it
  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('alert');
    expect(dialog.message()).toBe('Alert Box');
    
    console.log('Alert visible! Pausing 2 seconds to view...');
    await page.waitForTimeout(2000); // Visual pause so you can see the open popup
    await dialog.accept(); // Click "OK"
  });

  // Target the first button under "JavaScript Alert Box"
  await page.locator('button:has-text("Click Me")').first().click();
  await page.waitForTimeout(2000); // Visual pause to watch the post-dismissal behavior
});

test('2. Handle JavaScript Confirmation Box', async ({ page }) => {
  await page.goto('https://lambdatest.com');
  await page.waitForTimeout(1500);

  // Register dialog handler to Dismiss (Click Cancel)
  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('confirm');
    
    console.log('Confirm box visible! Pausing 2 seconds...');
    await page.waitForTimeout(2000); // Visual pause to see the option buttons
    await dialog.dismiss(); // Click "Cancel"
  });

  // Click the specific confirmation trigger button
  await page.locator('button:has-text("Click Me")').nth(1).click();

  // Verify the page registers the "Cancel" choice in its DOM text
  await expect(page.locator('#confirm-demo')).toHaveText('You pressed Cancel!');
  await page.waitForTimeout(2000);
});

test('3. Handle JavaScript Prompt Box', async ({ page }) => {
  await page.goto('https://lambdatest.com');
  await page.waitForTimeout(1500);

  // Register dialog handler to supply text into the prompt input
  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('prompt');
    
    console.log('Prompt box visible! Pausing 2 seconds...');
    await page.waitForTimeout(2000); // Visual pause to see prompt box
    await dialog.accept('Playwright QA Engineer'); // Types text and clicks "OK"
  });

  // Click the prompt button
  await page.locator('button:has-text("Click Me")').nth(2).click();

  // Verify the page extracted our prompt text input dynamically
  await expect(page.locator('#prompt-demo')).toHaveText("You have entered 'Playwright QA Engineer' !");
  await page.waitForTimeout(2000);
});

// ==========================================
// 2. OPENING A NEW TAB / WINDOW
// ==========================================

test('4. Open and Interact with a New Tab', async ({ page, context }) => {
  // Navigate to LambdaTest's window switching sandbox URL
  await page.goto('https://lambdatest.com');
  await page.waitForTimeout(1500);

  // Use Promise.all to catch the secondary tab background promise thread cleanly
  const [newTab] = await Promise.all([
    context.waitForEvent('page'), 
    page.getByRole('link', { name: 'Follow On Twitter' }).click() // Target blank browser handle link
  ]);

  // Wait for the new tab environment thread to completely load
  await newTab.waitForLoadState();
  
  console.log('New tab opened! Pausing 2 seconds to view...');
  await page.waitForTimeout(2000);

  // Validate the URL matches the target social media domain
  expect(newTab.url()).toContain('twitter.com');
  
  // Bring the browser focus cleanly back to the initial primary tab
  await page.bringToFront();
  console.log('Switched focus back to original tab. Pausing 2 seconds...');
  await page.waitForTimeout(2000);

  // Clean up and terminate the background window thread safely
  await newTab.close();
});
