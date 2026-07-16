import {test} from '../testSetup';
import {eligibility} from "../../flows/eligibility";
import {productSelection} from "../../flows/productSelection";
import {helocNew} from "../../flows/helocNeedsNew";
import {demographicsNew} from "../../flows/demographicsNew";
import {propertyDetailsNew} from "../../flows/propertyDetailsNew";
import {loginPrefill} from "../../flows/login/loginPrefill";
import {kycPrefill} from "../../flows/kyc/kycPrefill";
import {incomePrefill} from "../../flows/income/incomePrefill";
import {coappInfo} from "../../flows/coappInfo";

test("heloc", async ({page}) => {
    test.setTimeout(0);
    const loanUrl = process.env.ENVIRONMENT;
    console.log("loanUrl: ", loanUrl);

    await loginPrefill(page, loanUrl);
    await eligibility(page);
    await productSelection(page, process.env.HASCOAPPLICANT);
    await helocNew(page);
    await kycPrefill(page);
    await incomePrefill(page);
    await demographicsNew(page);
    if (process.env.HASCOAPPLICANT === "true") {
        await coappInfo(page);
    }
    await propertyDetailsNew(page);
    //keep the browser open
    await new Promise(() => {
    });
});
