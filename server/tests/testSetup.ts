import {test as base} from '@playwright/test';

export const test = base.extend({
    context: async ({browser}, use) => {
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            viewport: {width: 1920, height: 1080},
            javaScriptEnabled: true,
            bypassCSP: true,
            ignoreHTTPSErrors: true
        });

        // Apply common evasion techniques
        await context.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', {get: () => false});
            Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]});
        });

        await use(context);
    }
});

export {expect} from '@playwright/test';