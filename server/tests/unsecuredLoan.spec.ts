import {test} from './testSetup';
import {loginPrefill} from "../flows/login/loginPrefill";
import {UNSECURED_TERM_LOAN} from "../vars/localProductUrls";
import {eligibility} from "../flows/eligibility";
import {productSelection} from "../flows/productSelection";
import {kycPrefill} from "../flows/kyc/kycPrefill";
import {incomePrefill} from "../flows/income/incomePrefill";
import {unsecuredTermNeeds} from "../flows/unsecuredTermNeeds";
import {UNSECURED_LOAN} from "../vars/qaProductUrls";
import {getLoanUrl} from "../vars/utilMethods";
import {coappInfo} from "../flows/coappInfo";

test("unsecuredLoanPrefill", async ({page}) => {
    test.setTimeout(600_000);

    const loanUrl = await getLoanUrl(process.env.ENVIRONMENT, UNSECURED_LOAN, UNSECURED_TERM_LOAN, process.env.PRNUMBER);
    console.log("loanUrl: ", loanUrl);

    await loginPrefill(page, loanUrl);
    await eligibility(page);
    await productSelection(page, process.env.HASCOAPPLICANT);
    await kycPrefill(page);
    await incomePrefill(page);
    if (process.env.HASCOAPPLICANT === "true") {
        await coappInfo(page);
    }
    await unsecuredTermNeeds(page);
    //keep the browser open
    await new Promise(() => {
    });
});
