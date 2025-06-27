import {test} from "@playwright/test";
import {eligibility} from "../flows/eligibility";
import {LETTER_OF_CREDIT} from "../vars/localProductUrls";
import {productSelection} from "../flows/productSelection";
import {letterOfCreditNeeds} from "../flows/letterOfCreditNeeds";
import {UNSECURED_LOC} from "../vars/qaProductUrls";
import {getLoanUrl} from "../vars/utilMethods";
import {coappInfo} from "../flows/coappInfo";
import {loginNew} from "../flows/login/loginNew";
import {kycNew} from "../flows/kyc/kycNew";
import {incomeNew} from "../flows/incomeNew";

test("newLetterOfCredit", async ({page}) => {
    test.setTimeout(600_000);

    const loanUrl = await getLoanUrl(process.env.ENVIRONMENT, UNSECURED_LOC, LETTER_OF_CREDIT, process.env.PRNUMBER);
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
    //keep the browser open
    await new Promise(() => {
    });
});
