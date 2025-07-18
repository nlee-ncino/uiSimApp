import {chromium, test as base} from '@playwright/test';
import path from 'path';

export const test = base.extend({
    context: async ({browser}, use) => {
        const commonContextOptions = {
            userAgent:
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            viewport: {width: 1280, height: 720},
            javaScriptEnabled: true,
            bypassCSP: true,
            ignoreHTTPSErrors: true,
            deviceScaleFactor: 1,
            locale: 'en-US',
            timezoneId: 'America/New_York'
        };

        const addStealthScripts = async (context) => {
            await context.addInitScript(() => {
                Object.defineProperty(navigator, 'webdriver', {get: () => false});
                Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]});
            });
        };


        // Chromium-specific setup with Vue DevTools extension
        const vueDevToolsPath = path.join(__dirname, '../extensions/vue-tools/6.6.4_0');
        const userDataDir = path.join(__dirname, '../temp-profile');

        const context = await chromium.launchPersistentContext(userDataDir, {
            ...commonContextOptions,
            args: [
                `--disable-extensions-except=${vueDevToolsPath}`,
                `--load-extension=${vueDevToolsPath}`,
                '--disable-blink-features=AutomationControlled',
                '--enable-webgl',
                '--use-gl=egl',
                '--enable-accelerated-2d-canvas'
            ],
        });

        // Close the default blank page
        const [firstPage] = context.pages();
        if (firstPage) await firstPage.close();

        await addStealthScripts(context);
        await use(context);
    },
});

export {expect} from '@playwright/test';
