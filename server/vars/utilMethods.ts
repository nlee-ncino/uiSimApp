export const generateRandomEmail = (): string => {
    const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
    return `nathaniel.lee+${randomNumber}@ncino.com`;
};

export const generateRandomResidentNumber = (): string => {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
};

export const acceptDisclosures = async (page: any) => {
    if (page.url().includes('Evaluating_eligibility')) {
        await page.waitForURL((url: URL) => !url.toString().includes('Evaluating_eligibility'), {timeout: 60000}).catch(() => {});
    }

    await page.waitForLoadState('networkidle', {timeout: 10000}).catch(() => {});

    const viewAndAcceptText = 'View and Accept';
    const acceptText = 'Accept';

    const resolveButton = async (text: string): Promise<any | null> => {
        const role = page.getByRole('button', {name: text, exact: true});
        if ((await role.count()) > 0) return role.first();
        const exactText = new RegExp(`^\\s*${text}\\s*$`);
        const host = page.locator('ngc-button', {hasText: exactText});
        if ((await host.count()) > 0) {
            const inner = host.first().locator('button');
            return (await inner.count()) > 0 ? inner.first() : host.first();
        }
        return null;
    };

    const checkboxLocator = page.locator('[data-cy="consent-checkbox"], .v-input--selection-controls__ripple');

    const pollTimeout = 30000;
    const pollInterval = 1000;
    const pollStart = Date.now();
    let found = false;
    while (Date.now() - pollStart < pollTimeout) {
        const checkboxes = await checkboxLocator.count();
        const viewAndAccept = (await resolveButton(viewAndAcceptText)) ? 1 : 0;
        const accept = (await resolveButton(acceptText)) ? 1 : 0;
        if (checkboxes + viewAndAccept + accept > 0) {
            found = true;
            break;
        }
        await page.waitForTimeout(pollInterval);
    }
    if (!found) {
        return;
    }

    await page.waitForTimeout(1000);

    const consentCheckboxes = page.locator('[data-cy="consent-checkbox"]');
    const checkboxes = (await consentCheckboxes.count()) > 0
        ? consentCheckboxes
        : page.locator('.v-input--selection-controls__ripple');
    for (const checkbox of await checkboxes.all()) {
        if (await checkbox.isVisible()) {
            await checkbox.click({delay: 500, force: true});
        }
    }

    const acceptOneDisclosure = async (): Promise<boolean> => {
        const viewAndAcceptButton = await resolveButton(viewAndAcceptText);
        if (viewAndAcceptButton) {
            const disclosurePdfUrlRegex = /\/ncino_consumer_api\/applications\/[^/]+\/disclosure_pdfs\/[^/]+/;
            const responsePromise = page
                .waitForResponse(
                    (resp: any) => disclosurePdfUrlRegex.test(resp.url()) && (resp.status() === 200 || resp.status() === 502),
                    {timeout: 90000}
                )
                .catch(() => null);
            await viewAndAcceptButton.click({delay: 500});
            await responsePromise;

            const modal = page.locator('[data-cy="document-viewer-modal"]');
            const modalShown = await modal
                .waitFor({state: 'visible', timeout: 30000})
                .then(() => true)
                .catch(() => false);

            if (!modalShown) {
                return true;
            }

            await modal.locator('.loading-overlay').waitFor({state: 'hidden', timeout: 30000}).catch(() => {});

            const acceptBtn = page.locator('[data-cy="document-viewer-accept-btn"]');
            await acceptBtn.waitFor({state: 'visible', timeout: 30000});

            const scrollableContent = page.locator('[data-cy="viewer-modal-scrollable-content"]');
            if ((await scrollableContent.count()) > 0) {
                await scrollableContent.evaluate((el: HTMLElement) => {
                    el.scrollTop = el.scrollHeight;
                });
                await page.waitForTimeout(500);
            }

            await page.waitForFunction(
                () => {
                    const btn = document.querySelector('[data-cy="document-viewer-accept-btn"]');
                    return btn && !btn.hasAttribute('disabled');
                },
                null,
                {timeout: 90000}
            );

            await acceptBtn.click({delay: 500});
            await modal.waitFor({state: 'hidden', timeout: 5000}).catch(() => {});

            return true;
        }

        const acceptButton = await resolveButton(acceptText);
        if (acceptButton) {
            await acceptButton.click({delay: 500});
            return true;
        }

        return false;
    };

    const maxDisclosures = 20;
    let disclosuresAccepted = 0;
    while (await acceptOneDisclosure()) {
        disclosuresAccepted++;
        if (disclosuresAccepted >= maxDisclosures) {
            throw new Error(
                `Exceeded maximum number of disclosures (${maxDisclosures}). ` +
                'This may indicate an infinite loop or an unusually large number of disclosures.'
            );
        }
        await page.waitForTimeout(500);
    }
}

export function formatPhoneNumber(raw: string): string {
    let digits = raw.replace(/\D/g, '');

    if (digits.length < 10) {
        digits = digits.padEnd(10, '4');
    } else if (digits.length > 10) {
        digits = digits.slice(0, 10);
    }

    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}



