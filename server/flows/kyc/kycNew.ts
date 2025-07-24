import {acceptDisclosures} from "../../vars/utilMethods";
import {kycNewPartial} from "./kycNewPartial";

export const kycNew = async (page: any) => {
    await kycNewPartial(page);

    await page.locator('[data-cy="is_us_citizen-Yes-btn"]').click();
    await page.waitForTimeout(200);

    await acceptDisclosures(page);

    //this page needs more time for the backend to process the data
    await page.waitForTimeout(1000);
    await page.getByRole("button", {name: "Save & Continue"}).click();
    await page.waitForTimeout(200);
};
