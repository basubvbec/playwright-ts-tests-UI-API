import { test, expect } from '@playwright/test';

// ==========================================
// BACKGROUND / PRE-CONDITION LIFECYCLE HOOKS
// ==========================================

test.beforeEach(async ({ page }) => {
  // Step 1: Open a clean layout shell in the browser context before every test block runs
  await page.goto('about:blank'); 
  
  // Step 2: Inject a responsive HTML template containing all required test components
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
          
          <!-- Dialog Buttons -->
          <button id="alert-btn" onclick="alert('Hello! I am an alert box!')">Trigger Alert</button>
          
          <button id="confirm-btn" onclick="document.getElementById('res').innerText = confirm('Proceed?') ? 'You pressed OK!' : 'You pressed Cancel!'">Trigger Confirm</button>
          
          <button id="prompt-btn" onclick="document.getElementById('res').innerText = prompt('Enter your role:', 'Guest')">Trigger Prompt</button>
          
          <!-- Tab Navigation Links -->
          <a id="new-tab-link" href="https://playwright.dev" target="_blank">Open Playwright Docs in New Tab</a>
          
          <!-- Assertion Target Panel -->
          <h2 id="res">Waiting for action...</h2>
        </div>
      </body>
    </html>
  `);

  // Provide a short visual pause so you can see the local page mount on the UI
  await page.waitForTimeout(1000);
});

// ==========================================
// 1. JAVASCRIPT DIALOGS (Alert, Confirm, Prompt)
// ==========================================

test('1. Handle JavaScript Alert Box', async ({ page }) => {
  // Register the dialog handler listener BEFORE triggering the click action thread
  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('alert');
    expect(dialog.message()).toBe('Hello! I am an alert box!');
    
    console.log('Alert visible! Pausing 2 seconds to view...');
    await page.waitForTimeout(2000); // Visual pause to watch the popup window open
    await dialog.accept();           // Click "OK"
  });

  await page.locator('#alert-btn').click();
  await page.waitForTimeout(1000); // Visual pause after handling dialog
});

test('2. Handle JavaScript Confirmation Box', async ({ page }) => {
  // Register dialog handler to Dismiss (Simulate clicking "Cancel")
  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('confirm');
    
    console.log('Confirm box visible! Pausing 2 seconds...');
    await page.waitForTimeout(2000); 
    await dialog.dismiss();          // Click "Cancel"
  });

  await page.locator('#confirm-btn').click();

  // Verify the internal DOM text states changed dynamically based on our cancellation action
  await expect(page.locator('#res')).toHaveText('You pressed Cancel!');
  await page.waitForTimeout(1000);
});

test('3. Handle JavaScript Prompt Box', async ({ page }) => {
  // Register dialog handler to accept custom manual text inputs
  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('prompt');
    
    console.log('Prompt box visible! Pausing 2 seconds...');
    await page.waitForTimeout(2000); 
    await dialog.accept('Playwright QA Engineer'); // Enters custom text and clicks "OK"
  });

  await page.locator('#prompt-btn').click();

  // Assert that our string input value was successfully written into the page DOM tree
  await expect(page.locator('#res')).toHaveText('Playwright QA Engineer');
  await page.waitForTimeout(1000);
});

// ==========================================
// 2. OPENING A NEW TAB / WINDOW
// ==========================================

test('4. Open and Interact with a New Tab', async ({ page, context }) => {
  // Use Promise.all to cleanly capture the asynchronous page creation event thread
  const [newTab] = await Promise.all([
    context.waitForEvent('page'), 
    page.locator('#new-tab-link').click() 
  ]);

  // Force the new browser tab thread context environment to completely finish loading resources
  await newTab.waitForLoadState();
  
  console.log('New tab opened successfully! Pausing 2 seconds to view...');
  await page.waitForTimeout(2000);

  // Assert targeted URL domain properties directly on the isolated new tab reference handle
  expect(newTab.url()).toContain('playwright.dev');
  
  // Bring the primary master test controller page cleanly back to screen focus
  await page.bringToFront();
  console.log('Switched focus back to original page. Pausing 2 seconds...');
  await page.waitForTimeout(2000);

  // Clean up and terminate the background window thread safely to free up system memory
  await newTab.close();
});
