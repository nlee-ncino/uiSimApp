export const generateRandomEmail = (): string => {
    const randomNumber = Math.floor(10000000 + Math.random() * 90000000); // 8-digit number
    return `nathaniel.lee+${randomNumber}@ncino.com`;
};

export const generateRandomResidentNumber = (): string => {
    return Math.floor(100000000 + Math.random() * 900000000).toString(); // 9-digit number
};

export const acceptDisclosures = async (page: any) => {
    // If we're on an intermediate page (e.g. Evaluating_eligibility), wait for the URL
    // to settle on the real destination before looking for disclosures.
    if (page.url().includes('Evaluating_eligibility')) {
        await page.waitForURL((url: URL) => !url.toString().includes('Evaluating_eligibility'), {timeout: 60000}).catch(() => {});
    }

    // Best-effort: some pages (e.g. consumer KYC) keep polling and never reach networkidle.
    await page.waitForLoadState('networkidle', {timeout: 10000}).catch(() => {});

    const viewAndAcceptText = 'View and Accept';
    const acceptText = 'Accept';

    // Disclosure buttons are gator "ngc-button" web components: the real <button> lives in an
    // open shadow root and the visible label is slotted light-DOM text. getByRole pierces the
    // shadow root and matches the slotted accessible name; if that misses (whitespace/aria
    // quirks), fall back to the host's text and click its inner <button>. Both matches are
    // anchored exactly so an already-accepted button (label becomes "Accepted") is NOT matched
    // by "Accept" — otherwise the loop would re-click it forever and never reach Save & Continue.
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

    // Poll until any disclosure element appears (checkbox or accept button), or give up.
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

    // Handle traditional consent checkboxes.
    for (const checkbox of await checkboxLocator.all()) {
        if (await checkbox.isVisible()) {
            await checkbox.click({delay: 500, force: true});
        }
    }

    // Handle the newer disclosure-group style: "View and Accept" opens a document viewer
    // modal that requires scrolling to the bottom before the Accept button enables, or a
    // plain "Accept" button with no modal.
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

            // Some disclosures accept inline without opening the document-viewer modal.
            if (!modalShown) {
                return true;
            }

            await modal.locator('.loading-overlay').waitFor({state: 'hidden', timeout: 30000}).catch(() => {});

            const acceptBtn = page.locator('[data-cy="document-viewer-accept-btn"]');
            await acceptBtn.waitFor({state: 'visible', timeout: 30000});

            // Scroll the PDF container to the bottom to enable the accept button.
            const scrollableContent = page.locator('[data-cy="viewer-modal-scrollable-content"]');
            if ((await scrollableContent.count()) > 0) {
                await scrollableContent.evaluate((el: HTMLElement) => {
                    el.scrollTop = el.scrollHeight;
                });
                await page.waitForTimeout(500);
            }

            // Wait for the accept button to become enabled.
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

        // Disclosures without a document, requiring only a click on "Accept".
        const acceptButton = await resolveButton(acceptText);
        if (acceptButton) {
            await acceptButton.click({delay: 500});
            return true;
        }

        return false;
    };

    // Keep accepting disclosures until none are left.
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

export const getLoanUrl = async (environment: string | undefined, omniQaURL: string, localURL: string, prNumber: string) => {
    let loanUrl: string;
    if (environment === "omniQA") {
        loanUrl = omniQaURL;
    } else if (environment === "local") {
        loanUrl = localURL;
    } else if (environment === "localQA") {
        loanUrl = convertQaUrlToLocalUrl(omniQaURL);
    } else if (environment === "feature" && prNumber && prNumber.length > 0) {
        loanUrl = convertQaUrlToFeatureUrl(omniQaURL, prNumber);
    } else if (environment) {
        loanUrl = environment;
    } else {
        console.log("Environment not set correctly: defaulting to omniQA");
        loanUrl = omniQaURL;
    }
    return loanUrl;
}


/**
 * Formats a phone number to (XXX) XXX-XXXX.
 * If too short, pads with '4'. If too long, trims to 10 digits.
 * @param raw - Raw phone number input
 * @returns Formatted phone number
 */
export function formatPhoneNumber(raw: string): string {
    // Remove all non-digit characters
    let digits = raw.replace(/\D/g, '');

    // Adjust length
    if (digits.length < 10) {
        digits = digits.padEnd(10, '4');
    } else if (digits.length > 10) {
        digits = digits.slice(0, 10);
    }

    // Format to (XXX) XXX-XXXX
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function convertQaUrlToFeatureUrl(url: string, prNumber: string): string {
    const qaDomain = "custom6.omni.us.qa.api.ncino.com";
    const featureDomain = `custom6.cipr${prNumber}.ci.ncino.cloud`;

    return url.replace(qaDomain, featureDomain);
}

export function convertQaUrlToLocalUrl(url: string): string {
    const qaDomain = "https://custom6.omni-qa.ncino.com";
    const localDomain = "http://localhost:3000";

    return url.replace(qaDomain, localDomain);
}


