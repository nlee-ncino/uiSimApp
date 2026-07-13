// Continues past the Additional Products / product selection page on business apps.
// Waits for Save & Continue (it's always present on this page), accepts checkbox defaults,
// and clicks through.
export const businessProductSelection = async (page: any) => {
    // After eligibility submits, the app shows interstitial loading screens
    // (Evaluating_eligibility -> Preparing_application) that ALSO render a disabled
    // "Save & Continue" (continue-btn). Wait for those to clear before looking for the real
    // product-selection button, or we'll click the disabled interstitial button and desync.
    await page.waitForURL(
        (url: URL) => !/Evaluating_eligibility|Preparing_application/i.test(url.toString()),
        {timeout: 60000}
    ).catch(() => {});

    const continueBtn = page.locator('button[data-cy="continue-btn"]').first();

    // If the page never appears (some envs skip it entirely), bail out.
    const present = await continueBtn
        .waitFor({state: 'visible', timeout: 15000})
        .then(() => true)
        .catch(() => false);

    if (!present) {
        return;
    }

    // The interstitial's button is disabled; the real product-page button is enabled. Wait
    // until it's actually enabled before clicking so we don't act on a leftover loading screen.
    await continueBtn.waitFor({state: 'visible', timeout: 30000}).catch(() => {});
    await page.waitForFunction(
        () => {
            const btn = document.querySelector('button[data-cy="continue-btn"]');
            return btn && !btn.hasAttribute('disabled') && (btn as HTMLButtonElement).disabled === false;
        },
        null,
        {timeout: 30000}
    ).catch(() => {});

    // Note: this app is an SPA that long-polls, so networkidle never settles — use fixed
    // settles and page-content signals instead.
    await page.waitForTimeout(1500);

    if (process.env.PREMATURESTOP === 'productSelection') {
        await new Promise(() => {
        });
    }

    await continueBtn.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(500);

    const box = await continueBtn.boundingBox();
    if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.waitForTimeout(100);
        await page.mouse.up();
    } else {
        await continueBtn.click({force: true, delay: 200});
    }
    await page.waitForTimeout(2000);

    // Fallback: if URL didn't move past Product_selection, dispatch the full event sequence
    if (/Product_selection/i.test(page.url())) {
        await page.evaluate(() => {
            const btn = document.querySelector('button[data-cy="continue-btn"]') as HTMLElement | null;
            if (!btn) return;
            ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach((type) => {
                btn.dispatchEvent(new MouseEvent(type, {bubbles: true, cancelable: true, view: window, button: 0}));
            });
        });
        await page.waitForTimeout(2000);
    }

    // Advanced when this page's title illustration detaches (omni's signal), rather than
    // waiting on networkidle which never settles here.
    await page.locator('[data-cy^="form-title-illustration"]')
        .first()
        .waitFor({state: 'detached', timeout: 30000})
        .catch(() => {});
};
