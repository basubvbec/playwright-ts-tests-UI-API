import { test, expect } from '@playwright/test';

// ==========================================
// JAVASCRIPT DIALOGS WITH VISUAL DELAYS
// ==========================================

test('1. Handle JavaScript Alert Box (With Delays)', async ({ page }) => {
  // Inject a standard button into the page first
  await page.setContent(`
    <div style="padding: 40px; text-align: center;">
      <button id="btn" style="font-size: 20px; padding: 10px 20px;" onclick="alert('Hello! I am an alert box!')">
        Trigger Alert
      </button>
    </div>
  `);

  // Register the dialog handler BEFORE triggering the dialog event
  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('alert');
    
    console.log('Dialog detected! Pausing for 2 seconds to let you look at it...');
    await page.waitForTimeout(2000); // <-- PAUSE 1: Look at the open alert box
    
    await dialog.accept(); // Click "OK"
  });

  console.log('Page loaded. Waiting 2 seconds before clicking the button...');
  await page.waitForTimeout(2000); // <-- PAUSE 2: Look at the button before click

  await page.getByRole('button', { name: 'Trigger Alert' }).click();

  console.log('Alert dismissed. Keeping browser open for 2 seconds to see final state...');
  await page.waitForTimeout(2000); // <-- PAUSE 3: Look at the screen after dismissal
});

test('2. Handle JavaScript Confirmation Box (With Delays)', async ({ page }) => {
  await page.setContent(`
    <div style="padding: 40px; text-align: center;">
      <button id="btn" style="font-size: 20px; padding: 10px 20px;" 
              onclick="document.getElementById('res').innerText = confirm('Proceed?') ? 'Accepted' : 'Dismissed'">
        Trigger Confirm
      </button>
      <h2 id="res" style="margin-top: 20px; color: blue;">Waiting for action...</h2>
    </div>
  `);

  // Test Case: Dismissing the Confirmation (Clicking Cancel)
  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('confirm');
    
    console.log('Confirm dialog open. Pausing for 2 seconds...');
    await page.waitForTimeout(2000); // <-- PAUSE 1: Look at the open confirm box
    
    await dialog.dismiss(); // Clicks "Cancel"
  });

  await page.waitForTimeout(1500); // <-- PAUSE 2: Before clicking
  await page.getByRole('button', { name: 'Trigger Confirm' }).click();

  // Verify the UI updated to 'Dismissed'
  await expect(page.locator('#res')).toHaveText('Dismissed');
  
  console.log('Confirm handled. Pausing for 2 seconds to see the "Dismissed" text...');
  await page.waitForTimeout(2000); // <-- PAUSE 3: Look at the result text
});

test('3. Handle JavaScript Prompt Input Box (With Delays)', async ({ page }) => {
  await page.setContent(`
    <div style="padding: 40px; text-align: center;">
      <button id="btn" style="font-size: 20px; padding: 10px 20px;" 
              onclick="document.getElementById('res').innerText = prompt('Enter name:', 'Anonymous')">
        Trigger Prompt
      </button>
      <h2 id="res" style="margin-top: 20px; color: green;">Result will appear here</h2>
    </div>
  `);

  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('prompt');
    
    console.log('Prompt open. Pausing for 2 seconds before typing...');
    await page.waitForTimeout(2000); // <-- PAUSE 1: Look at the empty/default prompt
    
    await dialog.accept('Playwright QA Engineer'); // Enters text and clicks "OK"
  });

  await page.waitForTimeout(1500); // <-- PAUSE 2: Before clicking
  await page.getByRole('button', { name: 'Trigger Prompt' }).click();

  // Verify the UI updated with the text we typed into the prompt
  await expect(page.locator('#res')).toHaveText('Playwright QA Engineer');
  
  console.log('Prompt complete. Pausing for 3 seconds to admire the final UI text...');
  await page.waitForTimeout(3000); // <-- PAUSE 3: Look at the final injected name text
});
