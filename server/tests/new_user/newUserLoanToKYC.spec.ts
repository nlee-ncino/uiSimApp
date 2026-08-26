import {test, waitForTestWindowToClose} from '../testSetup';
import {loginNew} from "../../flows/login/loginNew";
import {eligibility} from "../../flows/eligibility";
import {productSelection} from "../../flows/productSelection";
import {kycNewPartial} from "../../flows/kyc/kycNewPartial";

test("newUserLoanToKYC", async ({page}) => {
    test.setTimeout(0);

    const loanUrl = process.env.ENVIRONMENT;
    console.log("loanUrl: ", loanUrl);

    await loginNew(page, loanUrl);
    await eligibility(page);
    await productSelection(page, process.env.HASCOAPPLICANT);
    await kycNewPartial(page);
    await waitForTestWindowToClose(page);
});
