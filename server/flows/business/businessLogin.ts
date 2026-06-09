import {PASSWORD} from "../../vars/prefillLoginCredentials";
import {formatPhoneNumber, generateRandomEmail} from "../../vars/utilMethods";

export const businessLogin = async (page: any, url: any) => {
    await page.goto(url);
    await page.waitForTimeout(500);

    // Email page — uses data-cy on business signup
    const emailField = page.locator('[data-cy="What is your email?-field"]');
    await emailField.waitFor({state: 'visible', timeout: 30000});

    const randomEmail = generateRandomEmail();
    const email = process.env.EMAIL ? process.env.EMAIL : randomEmail;
    console.log("email: ", email);

    await emailField.click();
    await page.waitForTimeout(500);
    await emailField.fill(email);
    await page.waitForTimeout(500);

    await page.getByRole("button", {name: "Continue"}).click();
    await page.waitForTimeout(500);

    // Register account page — data-cy locators
    const firstNameField = page.locator('[data-cy="user-first-name-field"]');
    await firstNameField.waitFor({state: 'visible', timeout: 30000});

    const firstName = process.env.FIRSTNAME || 'John';
    await firstNameField.fill(firstName);
    await page.waitForTimeout(500);

    const lastName = process.env.LASTNAME || 'Pass';
    await page.locator('[data-cy="user-last-name-field"]').fill(lastName);
    await page.waitForTimeout(500);

    const phone = process.env.PHONE ? formatPhoneNumber(process.env.PHONE) : '(234) 242-3423';
    await page.getByLabel('Mobile Number').fill(phone);
    await page.waitForTimeout(500);

    const password = process.env.PASSWORD || PASSWORD;
    console.log("Password: ", password);

    await page.locator('[data-cy="enter-password"]').fill(password);
    await page.waitForTimeout(500);
    await page.locator('[data-cy="confirm-password"]').fill(password);
    await page.waitForTimeout(500);
    // Tab off the field so Vue blur-validation runs and the button enables
    await page.locator('[data-cy="confirm-password"]').press('Tab');
    await page.waitForTimeout(500);

    if (process.env.PREMATURESTOP === 'login') {
        await new Promise(() => {
        });
    }

    // Submit the registration form via a direct DOM click — bypasses focus/overlay issues
    await page.evaluate(() => {
        const btn = document.querySelector('[data-cy="register-account-button"]') as HTMLElement | null;
        btn?.click();
    });
    await page.waitForTimeout(1500);

    // If a separate onboarding/T&C page (terms-and-conditions) appears, click Register Account.
    // Wait for the URL/page to settle first — the button mounts before its handler is wired.
    const onTerms = await page
        .waitForURL(/onboarding\/terms-and-conditions/i, {timeout: 10000})
        .then(() => true)
        .catch(() => false);

    if (onTerms) {
        await page.waitForLoadState('networkidle', {timeout: 30000}).catch(() => {});
        await page.waitForTimeout(2000);

        const tcButton = page.locator('button[data-cy="continue"]').first();
        await tcButton.waitFor({state: 'visible', timeout: 15000});
        await tcButton.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(500);

        // Real user click via bounding-box center — bypasses Vuetify ripple wrappers
        const box = await tcButton.boundingBox();
        if (box) {
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await page.mouse.down();
            await page.waitForTimeout(100);
            await page.mouse.up();
        } else {
            await tcButton.click({force: true});
        }
        await page.waitForTimeout(2000);

        // If still on T&C, fall back to dispatching the full mouse-event sequence
        if (/terms-and-conditions/i.test(page.url())) {
            await page.evaluate(() => {
                const btn = document.querySelector('button[data-cy="continue"]') as HTMLElement | null;
                if (!btn) return;
                ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach((type) => {
                    btn.dispatchEvent(new MouseEvent(type, {bubbles: true, cancelable: true, view: window, button: 0}));
                });
            });
            await page.waitForTimeout(2000);
        }
    }
};
