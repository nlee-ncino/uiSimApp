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
        // Note: no networkidle wait — this SPA long-polls, so it never settles.
        await page.waitForTimeout(2000);

        const tcButton = page.locator('button[data-cy="continue"]').first();
        await tcButton.waitFor({state: 'visible', timeout: 15000}).catch(() => {});

        // The T&C body is long and scrollable; the continue button sits below the fold and is
        // typically disabled until the terms are scrolled to the bottom. Scroll the whole page
        // (and any inner scroll container) to the bottom to enable it, then wait for enabled.
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
            document.querySelectorAll('*').forEach((el) => {
                if (el.scrollHeight > el.clientHeight) el.scrollTop = el.scrollHeight;
            });
        });
        await page.waitForTimeout(1000);
        await tcButton.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForFunction(
            () => {
                const btn = document.querySelector('button[data-cy="continue"]') as HTMLButtonElement | null;
                return !!btn && !btn.disabled && !btn.hasAttribute('disabled');
            },
            null,
            {timeout: 15000}
        ).catch(() => {});

        // Click with a bounded timeout so a covered/animating button can't hang the action
        // retry loop; fall back to a forced click.
        await tcButton.click({delay: 200, timeout: 8000}).catch(async () => {
            await tcButton.click({force: true, timeout: 8000}).catch(() => {});
        });

        // Wait for the click to navigate off the T&C page. If it doesn't within 10s, retry the
        // click once more. Avoid page.evaluate here: the click triggers navigation and evaluating
        // against a tearing-down execution context can hang indefinitely.
        const leftTerms = await page
            .waitForURL((url: URL) => !/terms-and-conditions/i.test(url.toString()), {timeout: 10000})
            .then(() => true)
            .catch(() => false);

        if (!leftTerms) {
            await tcButton.click({force: true, timeout: 8000}).catch(() => {});
            await page
                .waitForURL((url: URL) => !/terms-and-conditions/i.test(url.toString()), {timeout: 10000})
                .catch(() => {});
        }
    }
};
