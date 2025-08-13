import {test} from '../testSetup';
import {loginNew} from "../../flows/login/loginNew";
import {UNSECURED_TERM_LOAN} from "../../vars/localProductUrls";
import {eligibility} from "../../flows/eligibility";
import {productSelection} from "../../flows/productSelection";
import {kycNewPartial} from "../../flows/kyc/kycNewPartial";
import {UNSECURED_LOAN} from "../../vars/qaProductUrls";
import {getLoanUrl} from "../../vars/utilMethods";

test("newUserLoanToKYC", async ({page}) => {
    test.setTimeout(0);

    const loanUrl = await getLoanUrl(process.env.ENVIRONMENT, UNSECURED_LOAN, UNSECURED_TERM_LOAN, process.env.PRNUMBER);
    console.log("loanUrl: ", loanUrl);

    await loginNew(page, loanUrl);
    await eligibility(page);
    await productSelection(page, process.env.HASCOAPPLICANT);
    await kycNewPartial(page);
    //keep the browser open
    await new Promise(() => {
    });
});
