const {existsSync} = require('fs');
const {execFileSync} = require('child_process');
const {chromium} = require('playwright');

const executablePath = chromium.executablePath();

if (existsSync(executablePath)) {
    console.log(`Playwright Chromium is ready: ${executablePath}`);
    process.exit(0);
}

console.log('Playwright Chromium is missing. Installing it now...');
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
execFileSync(npx, ['playwright', 'install', 'chromium'], {stdio: 'inherit'});

if (!existsSync(executablePath)) {
    throw new Error(`Playwright Chromium was not installed at ${executablePath}`);
}
