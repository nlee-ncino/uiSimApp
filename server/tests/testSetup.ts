import {test as base, chromium} from '@playwright/test';
import path from 'path';

export const test = base.extend({
    context: async ({browser}, use) => {
        // Vue DevTools can only be loaded in Chromium
        if (browser.browserType().name() !== 'chromium') {
            const context = await browser.newContext({
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                viewport: {width: 1920, height: 1080},
                javaScriptEnabled: true,
                bypassCSP: true,
                ignoreHTTPSErrors: true,
            });

            await context.addInitScript(() => {
                Object.defineProperty(navigator, 'webdriver', {get: () => false});
                Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]});
            });

            await use(context);
            return;
        }

        // For Chromium, use a more specific approach to load extensions
        const vueDevToolsPath = path.join(__dirname, '../extensions/vue-tools/6.6.4_0');

        // Launch a persistent context with the extension
        const userDataDir = path.join(__dirname, '../temp-profile');
        const context = await chromium.launchPersistentContext(userDataDir, {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            viewport: {width: 1920, height: 1080},
            javaScriptEnabled: true,
            bypassCSP: true,
            ignoreHTTPSErrors: true,
            args: [
                `--disable-extensions-except=${vueDevToolsPath}`,
                `--load-extension=${vueDevToolsPath}`
            ]
        });
        // launch persist context creates a blank page, so we need to close it
        if (context.pages().length > 0) {
            await context.pages()[0].close();
        }

        await context.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', {get: () => false});
            Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]});
        });

        await use(context);
    }
});

export {expect} from '@playwright/test';