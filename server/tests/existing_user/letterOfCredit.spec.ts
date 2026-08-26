import {test, waitForTestWindowToClose} from '../testSetup';
import {loginPrefill} from "../../flows/login/loginPrefill";
import {eligibility} from "../../flows/eligibility";
import {productSelection} from "../../flows/productSelection";
import {kycPrefill} from "../../flows/kyc/kycPrefill";
import {incomePrefill} from "../../flows/income/incomePrefill";
import {letterOfCreditNeeds} from "../../flows/letterOfCreditNeeds";
import {coappInfo} from "../../flows/coappInfo";

test("letterOfCredit", async ({page}) => {
    test.setTimeout(0);

    const loanUrl = process.env.ENVIRONMENT;
    console.log("loanUrl: ", loanUrl);

    console.log("loanUrl: ", loanUrl);
    await loginPrefill(page, loanUrl);
    await eligibility(page);
    await productSelection(page, process.env.HASCOAPPLICANT);
    await kycPrefill(page);
    await incomePrefill(page);
    if (process.env.HASCOAPPLICANT === "true") {
        await coappInfo(page);
    }
    await letterOfCreditNeeds(page);
    await waitForTestWindowToClose(page);
});
