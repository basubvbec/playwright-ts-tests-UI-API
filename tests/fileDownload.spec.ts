
//Listener : event page.waitForEvent('download');registered
// before the action to click to download

//fs path   file module used to check if the file exists on the hard drive after download...
// these are node.js modules and not part of playwright or typescript. so we need to import them in the test file

//__dirname is a node.js variable that gives the current directory path of the test file. we can use it to create a 
// path to the downloads folder and save the downloaded file there 

//const download = await downloadPromise; is used to capture the download object after the download event is triggered. 
// we can use this object to get the suggested filename and save the file to a specific location

// cwd is the current working directory of the process. we can use it to create a path to the downloads folder and 
// save the downloaded file there


import { test, expect } from '@playwright/test';



import * as path from 'path';
import * as fs from 'fs';

test('Real file download practice', async ({ page }) => {
  // 1. Go to a real testing sandbox
  await page.goto('https://the-internet.herokuapp.com/download');

  // 2. Start waiting for the download event
  const downloadPromise = page.waitForEvent('download');
    
  // 3. Click the first available download link on the page
  await page.locator('.example a').first().click();
  
  // 4. Capture the download object
  const download = await downloadPromise;
  console.log(`Downloading: ${download.suggestedFilename()}`);

  // 5. Save the file to a 'downloads' directory
  const downloadPath = path.join(__dirname, 'downloads', download.suggestedFilename());
  await download.saveAs(downloadPath);
  
  // 6. Assert the file actually exists on your hard drive
  expect(fs.existsSync(downloadPath)).toBeTruthy();

  // 1. Capture the CWD
  const currentDirectory = process.cwd();
  
  // 2. Print it to the terminal
  console.log(`My CWD is currently: ${currentDirectory}`);
  console.log(`The directory of this test file : fileDownloads is: ${__dirname}`);

});