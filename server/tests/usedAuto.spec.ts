import {test} from "@playwright/test";
import {loginPrefill} from "../flows/login/loginPrefill";
import {eligibility} from "../flows/eligibility";
import {productSelection} from "../flows/productSelection";
import {kycPrefill} from "../flows/kyc/kycPrefill";
import {incomePrefill} from "../flows/income/incomePrefill";
import {AUTOMOBILE} from "../vars/localProductUrls";
import {autoDetails} from "../flows/auto/autoDetails";
import {autoNeeds} from "../flows/auto/autoNeeds";
import {AUTOMOBILE as QA_AUTOMOBILE} from "../vars/qaProductUrls";
import {getLoanUrl} from "../vars/utilMethods";
import {coappInfo} from "../flows/coappInfo";

test("usedAuto", async ({page}) => {
    test.setTimeout(600_000);

    const loanUrl = await getLoanUrl(process.env.ENVIRONMENT, QA_AUTOMOBILE, AUTOMOBILE, process.env.PRNUMBER);
    console.log("loanUrl: ", loanUrl);

    await loginPrefill(page, loanUrl);
    await eligibility(page);
    await productSelection(page, process.env.HASCOAPPLICANT);
    await kycPrefill(page);
    await incomePrefill(page);
    if (process.env.HASCOAPPLICANT === "true") {
        await coappInfo(page);
    }
    await autoDetails(page);
    await autoNeeds(page);
    //keep the browser open
    await new Promise(() => {
    });
});
