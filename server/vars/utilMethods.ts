export const generateRandomEmail = (): string => {
    const randomNumber = Math.floor(10000000 + Math.random() * 90000000); // 8-digit number
    return `nathaniel.lee+${randomNumber}@ncino.com`;
};

export const acceptDisclosures = async (page: any) => {
    for (let i = 0; i < 10; i++) {
        const isVisibleDisclosure = await page.locator(".v-input--selection-controls__ripple").nth(i).isVisible();
        if (isVisibleDisclosure) {
            await page.locator(".v-input--selection-controls__ripple").nth(i).click();
            await page.waitForTimeout(500);
        }
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


