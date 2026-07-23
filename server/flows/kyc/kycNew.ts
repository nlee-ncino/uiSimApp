import {acceptDisclosures} from "../../vars/utilMethods";
import {kycNewPartial} from "./kycNewPartial";

export const kycNew = async (page: any) => {
    await kycNewPartial(page);

    await acceptDisclosures(page);

    await page.waitForTimeout(1000);
    if ((process.env.PREMATURESTOP === "kyc")) {
        await new Promise(() => {
        });
    }
    await page.getByRole("button", {name: "Save & Continue"}).click();
    await page.waitForTimeout(200);
};
