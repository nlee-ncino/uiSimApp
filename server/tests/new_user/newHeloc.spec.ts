import {test} from '../testSetup';
import {eligibility} from "../../flows/eligibility";
import {productSelection} from "../../flows/productSelection";
import {loginNew} from "../../flows/login/loginNew";
import {helocNew} from "../../flows/helocNeedsNew";
import {kycNew} from "../../flows/kyc/kycNew";
import {incomeNew} from "../../flows/income/incomeNew";
import {demographicsNew} from "../../flows/demographicsNew";
import {propertyDetailsNew} from "../../flows/propertyDetailsNew";
import {coappInfo} from "../../flows/coappInfo";

test("newHeloc", async ({page}) => {
    test.setTimeout(0);
    const loanUrl = process.env.ENVIRONMENT;
    console.log("loanUrl: ", loanUrl);

    await loginNew(page, loanUrl);
    await eligibility(page);
    await productSelection(page, process.env.HASCOAPPLICANT);
    await helocNew(page);
    await kycNew(page);
    await incomeNew(page);
    await demographicsNew(page);
    if (process.env.HASCOAPPLICANT === "true") {
        await coappInfo(page);
    }
    await propertyDetailsNew(page);
    await new Promise(() => {
    });
});
