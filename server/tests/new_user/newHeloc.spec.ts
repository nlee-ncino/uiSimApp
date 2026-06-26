import {test} from '../testSetup';
import {HOME_EQUITY_LINE_OF_CREDIT} from "../../vars/qaProductUrls";
import {HELOC} from "../../vars/localProductUrls";
import {eligibility} from "../../flows/eligibility";
import {productSelection} from "../../flows/productSelection";
import {loginNew} from "../../flows/login/loginNew";
import {helocNew} from "../../flows/helocNeedsNew";
import {kycNew} from "../../flows/kyc/kycNew";
import {incomeNew} from "../../flows/income/incomeNew";
import {demographicsNew} from "../../flows/demographicsNew";
import {propertyDetailsNew} from "../../flows/propertyDetailsNew";
import {getLoanUrl} from "../../vars/utilMethods";
import {coappInfo} from "../../flows/coappInfo";

test("newHeloc", async ({page}) => {
    test.setTimeout(0);
    const loanUrl: string = await getLoanUrl(
        process.env.ENVIRONMENT,
        HOME_EQUITY_LINE_OF_CREDIT,
        HELOC,
        process.env.PRNUMBER
    );
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
    //keep the browser open
    await new Promise(() => {
    });
});
