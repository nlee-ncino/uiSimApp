import {test} from "@playwright/test";
import {CASH_REWARDS_CREDIT_CARD,} from "../vars/qaProductUrls";
import {CREDIT_CARD} from "../vars/localProductUrls";
import {eligibility} from "../flows/eligibility";
import {loginNew} from "../flows/login/loginNew";
import {kycNew} from "../flows/kyc/kycNew";
import {incomeNew} from "../flows/income/incomeNew";
import {acceptDisclosures, getLoanUrl} from "../vars/utilMethods";

test("newCreditCard", async ({page}) => {
    test.setTimeout(600_000);
    const loanUrl: string = await getLoanUrl(
        process.env.ENVIRONMENT,
        CASH_REWARDS_CREDIT_CARD,
        CREDIT_CARD,
        process.env.PRNUMBER
    );
    console.log("loanUrl: ", loanUrl);

    await loginNew(page, loanUrl);
    await eligibility(page);
    // await productSelection(page);
    //no product selection for credit card
    // Wait for the page to finish loading after the click

    await page.waitForSelector('text=Looks like you\'re applying for', {timeout: 60000});
    await page.getByRole("button", {name: "Save & Continue"}).click();
    await page.waitForTimeout(500);

    await kycNew(page);
    await incomeNew(page);
    await acceptDisclosures(page);

    await page.getByRole("button", {name: "Save & Continue"}).click();
    await page.waitForTimeout(200);
    //keep the browser open
    await new Promise(() => {
    });
});
