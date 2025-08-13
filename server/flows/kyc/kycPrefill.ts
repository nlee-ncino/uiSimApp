import {acceptDisclosures} from "../../vars/utilMethods";

export const kycPrefill = async (page: any) => {
    //temporary until permanent resident stuff comes in
    await page.locator('[data-cy="is_us_citizen-No-btn"]').click();
    await page.waitForTimeout(200);
    await page.locator('[data-cy="is_us_citizen-Yes-btn"]').click();
    await page.waitForTimeout(200);

    await acceptDisclosures(page);

    if (!(process.env.PREMATURESTOP === "kyc")) {
        await page.getByRole("button", {name: "Save & Continue"}).click();
        await page.waitForTimeout(200);
    }
};
