import {test} from '../testSetup';
import {loginPrefill} from "../../flows/login/loginPrefill";
import {eligibility} from "../../flows/eligibility";
import {LETTER_OF_CREDIT} from "../../vars/localProductUrls";
import {productSelection} from "../../flows/productSelection";
import {kycPrefill} from "../../flows/kyc/kycPrefill";
import {incomePrefill} from "../../flows/income/incomePrefill";
import {letterOfCreditNeeds} from "../../flows/letterOfCreditNeeds";
import {UNSECURED_LOC} from "../../vars/qaProductUrls";
import {getLoanUrl} from "../../vars/utilMethods";
import {coappInfo} from "../../flows/coappInfo";

test("letterOfCredit", async ({page}) => {
    test.setTimeout(600_000);

    const loanUrl = await getLoanUrl(process.env.ENVIRONMENT, UNSECURED_LOC, LETTER_OF_CREDIT, process.env.PRNUMBER);
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
    //keep the browser open
    await new Promise(() => {
    });
});
