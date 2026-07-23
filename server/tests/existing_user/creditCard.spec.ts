import {test} from '../testSetup'
import {eligibility} from "../../flows/eligibility";
import {acceptDisclosures} from "../../vars/utilMethods";
import {loginPrefill} from "../../flows/login/loginPrefill";
import {kycPrefill} from "../../flows/kyc/kycPrefill";
import {incomePrefill} from "../../flows/income/incomePrefill";

test("creditCardPrefill", async ({page}) => {
    test.setTimeout(0);
    const loanUrl = process.env.ENVIRONMENT;
    console.log("loanUrl: ", loanUrl);

    await loginPrefill(page, loanUrl);
    await eligibility(page);
    await page.waitForSelector('text=Looks like you\'re applying for', {timeout: 60000});
    await page.getByRole("button", {name: "Save & Continue"}).click();
    await page.waitForTimeout(500);

    await kycPrefill(page);
    await incomePrefill(page);
    await acceptDisclosures(page);

    await page.getByRole("button", {name: "Save & Continue"}).click();
    await page.waitForTimeout(200);
    await new Promise(() => {
    });
});
