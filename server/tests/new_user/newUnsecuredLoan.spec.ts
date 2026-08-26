import {eligibility} from "../../flows/eligibility";
import {productSelection} from "../../flows/productSelection";
import {unsecuredTermNeeds} from "../../flows/unsecuredTermNeeds";
import {loginNew} from "../../flows/login/loginNew";
import {kycNew} from "../../flows/kyc/kycNew";
import {incomeNew} from "../../flows/income/incomeNew";
import {coappInfo} from "../../flows/coappInfo";
import {test, waitForTestWindowToClose} from '../testSetup'

test("newUnsecuredLoan", async ({page}) => {
    test.setTimeout(0);

    const loanUrl = process.env.ENVIRONMENT;
    console.log("loanUrl: ", loanUrl);

    await loginNew(page, loanUrl);
    await eligibility(page);
    await productSelection(page, process.env.HASCOAPPLICANT);
    await kycNew(page);
    await incomeNew(page);
    if (process.env.HASCOAPPLICANT === "true") {
        await coappInfo(page);
    }
    await unsecuredTermNeeds(page);
    await waitForTestWindowToClose(page);
});
