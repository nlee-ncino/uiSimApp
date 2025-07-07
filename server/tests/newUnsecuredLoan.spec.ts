import {UNSECURED_TERM_LOAN} from "../vars/localProductUrls";
import {eligibility} from "../flows/eligibility";
import {productSelection} from "../flows/productSelection";
import {unsecuredTermNeeds} from "../flows/unsecuredTermNeeds";
import {loginNew} from "../flows/login/loginNew";
import {kycNew} from "../flows/kyc/kycNew";
import {incomeNew} from "../flows/income/incomeNew";
import {UNSECURED_LOAN} from "../vars/qaProductUrls";
import {getLoanUrl} from "../vars/utilMethods";
import {coappInfo} from "../flows/coappInfo";
import {test} from './testSetup'

test("newUnsecuredLoan", async ({page}) => {
    test.setTimeout(600_000);

    const loanUrl = await getLoanUrl(process.env.ENVIRONMENT, UNSECURED_LOAN, UNSECURED_TERM_LOAN, process.env.PRNUMBER);
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
    //keep the browser open
    await new Promise(() => {
    });
});
