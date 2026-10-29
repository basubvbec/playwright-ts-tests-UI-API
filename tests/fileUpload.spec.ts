
/*
before upload and download file: tsconfig.json should have "moduleResolution": "node" and "module": "commonjs" in the 
compilerOptions section... need to run few commands in the terminal to install node.js modules and types for node.js modules to use them in the test file
npm install --save-dev @types/node
npm install --save-dev @types/fs-extra
npm install --save-dev @types/path

   and create tsconfig.json file in the root of the project with the following content:

my-playwright-project/
├── tests/
│   ├── upload.spec.ts
│   └── fixtures/
│       └── invoice.pdf    <-- Keep your test files here
├── package.json
└── playwright.config.ts


// Playwright will look in: my-playwright-project/tests/fixtures/invoice.pdf
//await fileChooser.setFiles('tests/fixtures/invoice.pdf');

//import * as path from 'path';

// 1. Build an absolute path starting from this test file's location, 
// then going into 'fixtures', then selecting the file.
//const uploadPath = path.join(__dirname, 'fixtures', 'invoice.pdf');

// 2. Pass that exact path to Playwright
//await fileChooser.setFiles(uploadPath);

*/

/*
....combining __dirname with path.join() is the professional standard .....
why use --dir : absolute path instead of relative path in playwright file upload?

Using an absolute path ensures that the file is correctly located regardless of the current working directory from 
which the test is executed. Relative paths can lead to errors if the test is run from a different directory, as they depend on the current working directory. By using an absolute path, 
you eliminate this dependency and ensure that the file upload will work consistently across different environments and setups.  
__dirname is always an absolute path.It gives you the full, unchangeable path starting from the very root of your computer's hard drive 
(for example, C:\Users\Sarah\Projects\my-app\tests on Windows, or /Users/Sarah/Projects/my-app/tests on Mac). Because it is absolute,
 it will always point to the exact same folder regardless of how or where you start your tests.Playwright's Default Pathing 
 (Relative to CWD)When you don't use __dirname and instead pass a simple relative path to
  Playwright—like await fileChooser.setFiles('invoice.pdf')—Playwright defaults to using your Current Working Directory (CWD).
  Playwright treats your string as a relative path.It appends that relative path to whatever folder your terminal was currently inside 
  when you typed the npx playwright test command (usually the root of your project).The risk: If your CI/CD pipeline or another developer
   runs the test from a slightly different folder, the CWD changes, Playwright looks in the wrong place, and the test crashes.
   This is exactly why combining __dirname with path.join() is the professional standard. It converts a fragile relative path into a 
   bulletproof absolute path before Playwright even gets a chance to guess where the file is.
*/

import { test, expect } from '@playwright/test';
import * as path from 'path';

test('Upload a file using the filechooser event listener', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/upload');

  // 1. Start listening for the file chooser dialog (DO NOT 'await' here)
  const fileChooserPromise = page.waitForEvent('filechooser');


  await page.waitForTimeout(2000); // Visual pause to see the page before the dialog opens


  // 2. Perform the action that triggers the dialog to open
  // (Clicking the drag-and-drop box in this sandbox triggers the OS dialog)
  await page.locator('#drag-drop-upload').click();

  await page.waitForTimeout(4000); // Visual pause to see the file chooser dialog before we interact with it
  
  // 3. Await the promise to capture the event object
  const fileChooser = await fileChooserPromise;

  // 4. Check if multiple files are allowed (returns boolean)
  console.log(`Allows multiple files? ${fileChooser.isMultiple()}`);

  // 5. Attach the file using the captured event
  //passing relative path relative path . this is risky , It appends that relative path to whatever folder your terminal was currently inside 
  //when you typed the npx playwright test command (usually the root of your project).The risk: If your CI/CD pipeline or another developer
  // runs the test from a slightly different folder, the CWD changes, Playwright looks in the wrong place, and the test crashes.

  //await fileChooser.setFiles('tests/uploads/uploadFile.pdf'); 


  //THis is safer way to pass absolute path using __dirname and path.join() to ensure the file is correctly located 
  // regardless of the passing abosulute path using __dirname and path.join() to ensure the file is correctly located regardless of the 
  // current working directory
  const uploadPath = path.join(__dirname, 'uploads', 'uploadFile.pdf');
// Pass that exact path to Playwright
await fileChooser.setFiles(uploadPath);

await page.waitForTimeout(2000); // Visual pause to see the file attached and view the success message before submitting
  
  // To upload multiple files at once, pass an array of strings:
  // await fileChooser.setFiles(['filePath1', 'filepath2']);
});

