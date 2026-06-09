import {LOCAL_BUSINESS_DEPOSIT, QA_BUSINESS_DEPOSIT} from "../../vars/businessProductUrls";
import {getLoanUrl} from "../../vars/utilMethods";
import {businessLogin} from "../../flows/business/businessLogin";
import {businessProductSelection} from "../../flows/business/businessProductSelection";
import {businessInfo} from "../../flows/business/businessInfo";
import {businessYourInfo} from "../../flows/business/businessYourInfo";
import {test} from '../testSetup';

test("newBusinessDeposit", async ({page}) => {
    test.setTimeout(0);

    const productUrl = await getLoanUrl(
        process.env.ENVIRONMENT,
        QA_BUSINESS_DEPOSIT,
        LOCAL_BUSINESS_DEPOSIT,
        process.env.PRNUMBER
    );
    console.log("business deposit url: ", productUrl);

    try {
        await businessLogin(page, productUrl);
        await businessProductSelection(page);
        await businessInfo(page);
        await businessYourInfo(page);
    } catch (err) {
        console.error('Flow failed — keeping browser open so you can inspect:', err);
    }

    // keep the browser open
    await new Promise(() => {
    });
});
