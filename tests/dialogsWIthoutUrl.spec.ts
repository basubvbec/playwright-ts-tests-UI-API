
// test 2 : if page.on is used, then test will fail due to race condition. 2 times the event to capture confirmation dialog box
//  will be fired and the test will fail.
//  Use page.once instead of page.on to avoid this issue.

import { test, expect } from '@playwright/test';
// Add this line right below your imports to force parallel execution in this file!
test.describe.configure({ mode: 'parallel' });

// ==========================================
// BACKGROUND / PRE-CONDITION LIFECYCLE HOOKS
// ==========================================

test.beforeEach(async ({ page }) => {
  // Open a clean layout shell in the browser context before every test block runs
  await page.goto('about:blank'); 
  
  // Inject a responsive HTML template containing all required test components
  await page.setContent(`
    <html>
      <head>
        <title>Automation Testing Sandbox</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; text-align: center; background: #f4f6f9; }
          .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: inline-block; }
          button, a { display: inline-block; font-size: 16px; padding: 10px 20px; margin: 10px; cursor: pointer; border-radius: 4px; border: 1px solid #ccc; text-decoration: none; color: black; }
          button { background: #007bff; color: white; border: none; }
          h2 { color: #333; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Dialog & Window Automation Playground</h1>
          
          <button id="alert-btn" onclick="alert('Hello! I am an alert box!')">Trigger Alert</button>
          
          <button id="confirm-btn" onclick="document.getElementById('res').innerText = confirm('Proceed?') ? 'You pressed OK!' : 'You pressed Cancel!'">Trigger Confirm</button>
          
          <button id="prompt-btn" onclick="const val = prompt('Enter your role:', 'Guest'); document.getElementById('res').innerText = (val === null) ? 'You cancelled prompt!' : val">Trigger Prompt</button>
          
          <a id="new-tab-link" href="https://playwright.dev" target="_blank">Open Playwright Docs in New Tab</a>
          
          <h2 id="res">Waiting for action...</h2>
        </div>
      </body>
    </html>
  `);

  await page.waitForTimeout(1000); // Visual pause to see the local page mount
});

// ==========================================
// 1. JAVASCRIPT DIALOGS (Alert, Confirm, Prompt)
// ==========================================

test('1. Handle JavaScript Alert Box', async ({ page }) => {
  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('alert');
    expect(dialog.message()).toBe('Hello! I am an alert box!');
    
    console.log('Alert visible! Pausing 2 seconds to view...');
    await page.waitForTimeout(2000); 
    await dialog.accept();           // Click "OK"
  });

  await page.locator('#alert-btn').click();
  await page.waitForTimeout(1000); 
});

test('2. Handle JavaScript Confirmation Box - Click Cancel and OK', async ({ page }) => {
  // --- PATH A: Click "Cancel" ---

  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('confirm');
    console.log('Confirm box open (Testing Cancel). Pausing 2 seconds...');
    await page.waitForTimeout(2000); 
    await dialog.dismiss();          // Clicks "Cancel"
  });

  await page.locator('#confirm-btn').click();
  await expect(page.locator('#res')).toHaveText('You pressed Cancel!');
  await page.waitForTimeout(1500);   // Visual pause to see the DOM change

  // --- PATH B: Click "OK" ---
  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('confirm');
    console.log('Confirm box open (Testing OK). Pausing 2 seconds...');
    await page.waitForTimeout(2000); 
    await dialog.accept();           // Clicks "OK"
  });

  await page.locator('#confirm-btn').click();
  await expect(page.locator('#res')).toHaveText('You pressed OK!');
  await page.waitForTimeout(1000);
});

test('3. Handle JavaScript Prompt Box - Accept Input and Click Cancel', async ({ page }) => {
  // --- PATH A: Fill input text and Click "OK" ---
  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('prompt');
    console.log('Prompt box open (Testing Input + OK). Pausing 2 seconds...');
    await page.waitForTimeout(2000); 
    await dialog.accept('Playwright QA Engineer'); // Types text and clicks "OK"
  });

  await page.locator('#prompt-btn').click();
  await expect(page.locator('#res')).toHaveText('Playwright QA Engineer');
  await page.waitForTimeout(1500);   // Visual pause to check text injection

  // --- PATH B: Click "Cancel" on Prompt ---
  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('prompt');
    console.log('Prompt box open (Testing Cancel button). Pausing 2 seconds...');
    await page.waitForTimeout(2000); 
    await dialog.dismiss();          // Clicks "Cancel" (browser returns null values)
  });

  await page.locator('#prompt-btn').click();
  await expect(page.locator('#res')).toHaveText('You cancelled prompt!');
  await page.waitForTimeout(1000);
});

// ==========================================
// 2. OPENING A NEW TAB / WINDOW
// ==========================================

test('4. Open and Interact with a New Tab', async ({ page, context }) => {
  const [newTab] = await Promise.all([
    context.waitForEvent('page'), 
    page.locator('#new-tab-link').click() 
  ]);

  await newTab.waitForLoadState();
  
  console.log('New tab opened successfully! Pausing 2 seconds to view...');
  await page.waitForTimeout(2000);

  expect(newTab.url()).toContain('playwright.dev');
  
  await page.bringToFront();
  console.log('Switched focus back to original page. Pausing 2 seconds...');
  await page.waitForTimeout(2000);

  await newTab.close();
});
