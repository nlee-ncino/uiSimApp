import {test} from '../testSetup'
import {CASH_REWARDS_CREDIT_CARD,} from "../../vars/qaProductUrls";
import {CREDIT_CARD} from "../../vars/localProductUrls";
import {eligibility} from "../../flows/eligibility";
import {acceptDisclosures, getLoanUrl} from "../../vars/utilMethods";
import {loginPrefill} from "../../flows/login/loginPrefill";
import {kycPrefill} from "../../flows/kyc/kycPrefill";
import {incomePrefill} from "../../flows/income/incomePrefill";

test("creditCardPrefill", async ({page}) => {
    test.setTimeout(0);
    const loanUrl: string = await getLoanUrl(
        process.env.ENVIRONMENT,
        CASH_REWARDS_CREDIT_CARD,
        CREDIT_CARD,
        process.env.PRNUMBER,
    );
    console.log("loanUrl: ", loanUrl);

    await loginPrefill(page, loanUrl);
    await eligibility(page);
    // await productSelection(page);
    //no product selection for credit card
    await page.waitForSelector('text=Looks like you\'re applying for', {timeout: 60000});
    await page.getByRole("button", {name: "Save & Continue"}).click();
    await page.waitForTimeout(500);

    await kycPrefill(page);
    await incomePrefill(page);
    await acceptDisclosures(page);

    await page.getByRole("button", {name: "Save & Continue"}).click();
    await page.waitForTimeout(200);
    //keep the browser open
    await new Promise(() => {
    });
});
