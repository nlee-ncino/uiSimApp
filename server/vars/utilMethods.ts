export const generateRandomEmail = (emailTemplate = '', firstName = '', lastName = '', includeNameInModifier = false): string => {
    const randomSuffix = String(Math.floor(1000 + Math.random() * 9000));
    const normalizedName = [firstName, lastName]
        .map((name) => name.toLowerCase().replace(/[^a-z0-9]/g, ''))
        .filter(Boolean)
        .join('.') || 'test.user';
    const hasEmailBase = Boolean(emailTemplate.trim());
    const template = emailTemplate.trim() || `${normalizedName}@ncino.com`;
    const modifierSuffix = includeNameInModifier && hasEmailBase
        ? `${normalizedName.replace(/\./g, '')}${randomSuffix}`
        : randomSuffix;

    if (template.includes('{random}')) {
        return template.replaceAll('{random}', modifierSuffix);
    }

    const atIndex = template.lastIndexOf('@');
    if (atIndex > 0) {
        const localPart = template.slice(0, atIndex);
        const modifier = localPart.includes('+') ? modifierSuffix : `+${modifierSuffix}`;
        return `${localPart}${modifier}${template.slice(atIndex)}`;
    }

    return `${template}+${randomSuffix}@ncino.com`;
};

export const generateRandomResidentNumber = (): string => {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
};

export const generateRandomSsn = (): string => {
    let area = Math.floor(100 + Math.random() * 799);
    if (area === 666) area = 665;
    const group = Math.floor(10 + Math.random() * 90);
    const serial = Math.floor(1000 + Math.random() * 9000);
    return `${area}-${group}-${serial}`;
};

export const generateRandomDob = (): string => {
    const now = new Date();
    const oldestBirthDate = new Date(now.getFullYear() - 65, now.getMonth(), now.getDate());
    const youngestBirthDate = new Date(now.getFullYear() - 21, now.getMonth(), now.getDate());
    const birthDate = new Date(oldestBirthDate.getTime() + Math.random() * (youngestBirthDate.getTime() - oldestBirthDate.getTime()));
    const month = String(birthDate.getMonth() + 1).padStart(2, '0');
    const day = String(birthDate.getDate()).padStart(2, '0');
    return `${month}/${day}/${birthDate.getFullYear()}`;
};

export const generateRandomEin = (): string => {
    const prefix = Math.floor(10 + Math.random() * 90);
    const suffix = String(Math.floor(1000000 + Math.random() * 9000000));
    return `${prefix}-${suffix}`;
};

export const generateRandomIncorporationDate = (): string => {
    const now = new Date();
    const oldestDate = new Date(now.getFullYear() - 20, now.getMonth(), now.getDate());
    const newestDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const incorporationDate = new Date(oldestDate.getTime() + Math.random() * (newestDate.getTime() - oldestDate.getTime()));
    const month = String(incorporationDate.getMonth() + 1).padStart(2, '0');
    const day = String(incorporationDate.getDate()).padStart(2, '0');
    return `${month}/${day}/${incorporationDate.getFullYear()}`;
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
