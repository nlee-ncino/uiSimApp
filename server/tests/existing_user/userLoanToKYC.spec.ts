import {test, waitForTestWindowToClose} from '../testSetup';
import {eligibility} from "../../flows/eligibility";
import {productSelection} from "../../flows/productSelection";
import {loginPrefill} from "../../flows/login/loginPrefill";

test("userLoanToKYC", async ({page}) => {
    test.setTimeout(0);

    const loanUrl = process.env.ENVIRONMENT;
    console.log("loanUrl: ", loanUrl);

    await loginPrefill(page, loanUrl);
    await eligibility(page);
    await productSelection(page, process.env.HASCOAPPLICANT);
    await waitForTestWindowToClose(page);
});
