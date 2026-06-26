// Continues past the Additional Products / product selection page on business apps.
// Waits for Save & Continue (it's always present on this page), accepts checkbox defaults,
// and clicks through.
export const businessProductSelection = async (page: any) => {
    const continueBtn = page.locator('button[data-cy="continue-btn"]').first();

    // If the page never appears (some envs skip it entirely), bail out.
    const present = await continueBtn
        .waitFor({state: 'visible', timeout: 15000})
        .then(() => true)
        .catch(() => false);

    if (!present) {
        return;
    }

    await page.waitForLoadState('networkidle', {timeout: 30000}).catch(() => {});
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

    await page.waitForLoadState('networkidle', {timeout: 30000}).catch(() => {});
};
