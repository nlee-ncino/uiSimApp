import {test, waitForTestWindowToClose} from '../testSetup';
import {eligibility} from "../../flows/eligibility";
import {productSelection} from "../../flows/productSelection";
import {letterOfCreditNeeds} from "../../flows/letterOfCreditNeeds";
import {coappInfo} from "../../flows/coappInfo";
import {loginNew} from "../../flows/login/loginNew";
import {kycNew} from "../../flows/kyc/kycNew";
import {incomeNew} from "../../flows/income/incomeNew";

test("newLetterOfCredit", async ({page}) => {
    test.setTimeout(0);

    const loanUrl = process.env.ENVIRONMENT;
    console.log("loanUrl: ", loanUrl);

    console.log("loanUrl: ", loanUrl);
    await loginNew(page, loanUrl);
    await eligibility(page);
    await productSelection(page, process.env.HASCOAPPLICANT);
    await kycNew(page);
    await incomeNew(page);
    if (process.env.HASCOAPPLICANT === "true") {
        await coappInfo(page);
    }
    await letterOfCreditNeeds(page);
    await waitForTestWindowToClose(page);
});
