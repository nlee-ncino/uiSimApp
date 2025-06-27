import {test} from "@playwright/test";
import {eligibility} from "../flows/eligibility";
import {productSelection} from "../flows/productSelection";
import {AUTOMOBILE} from "../vars/localProductUrls";
import {autoDetails} from "../flows/auto/autoDetails";
import {autoNeeds} from "../flows/auto/autoNeeds";
import {AUTOMOBILE as QA_AUTOMOBILE} from "../vars/qaProductUrls";
import {getLoanUrl} from "../vars/utilMethods";
import {coappInfo} from "../flows/coappInfo";
import {loginNew} from "../flows/login/loginNew";
import {kycNew} from "../flows/kyc/kycNew";
import {incomeNew} from "../flows/income/incomeNew";

test("newUsedAuto", async ({page}) => {
    test.setTimeout(600_000);

    const loanUrl = await getLoanUrl(process.env.ENVIRONMENT, QA_AUTOMOBILE, AUTOMOBILE, process.env.PRNUMBER);
    console.log("loanUrl: ", loanUrl);

    await loginNew(page, loanUrl);
    await eligibility(page);
    await productSelection(page, process.env.HASCOAPPLICANT);
    await kycNew(page);
    await incomeNew(page);
    if (process.env.HASCOAPPLICANT === "true") {
        await coappInfo(page);
    }
    await autoDetails(page);
    await autoNeeds(page);
    //keep the browser open
    await new Promise(() => {
    });
});
