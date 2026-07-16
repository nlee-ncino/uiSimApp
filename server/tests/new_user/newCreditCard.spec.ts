import {test} from '../testSetup';
import {eligibility} from "../../flows/eligibility";
import {loginNew} from "../../flows/login/loginNew";
import {kycNew} from "../../flows/kyc/kycNew";
import {incomeNew} from "../../flows/income/incomeNew";
import {acceptDisclosures} from "../../vars/utilMethods";

test("newCreditCard", async ({page}) => {
    test.setTimeout(0);
    const loanUrl = process.env.ENVIRONMENT;
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
