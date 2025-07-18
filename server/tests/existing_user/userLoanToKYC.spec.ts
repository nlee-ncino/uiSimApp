import {test} from '../testSetup';
import {UNSECURED_TERM_LOAN} from "../../vars/localProductUrls";
import {eligibility} from "../../flows/eligibility";
import {productSelection} from "../../flows/productSelection";
import {UNSECURED_LOAN} from "../../vars/qaProductUrls";
import {loginPrefill} from "../../flows/login/loginPrefill";
import {getLoanUrl} from "../../vars/utilMethods";

test("userLoanToKYC", async ({page}) => {
    test.setTimeout(600_000);

    const loanUrl = await getLoanUrl(process.env.ENVIRONMENT, UNSECURED_LOAN, UNSECURED_TERM_LOAN, process.env.PRNUMBER);
    console.log("loanUrl: ", loanUrl);

    await loginPrefill(page, loanUrl);
    await eligibility(page);
    await productSelection(page, process.env.HASCOAPPLICANT);
    //keep the browser open
    await new Promise(() => {
    });
});
