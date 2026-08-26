import {businessLogin} from "../../flows/business/businessLogin";
import {businessEligibility} from "../../flows/business/businessEligibility";
import {businessProductSelection} from "../../flows/business/businessProductSelection";
import {businessInfo} from "../../flows/business/businessInfo";
import {businessYourInfo} from "../../flows/business/businessYourInfo";
import {businessOwnership} from "../../flows/business/businessOwnership";
import {businessManagingController} from "../../flows/business/businessManagingController";
import {businessCheckingOptions} from "../../flows/business/businessCheckingOptions";
import {test, waitForTestWindowToClose} from '../testSetup';

test("newBusinessDeposit", async ({page}) => {
    test.setTimeout(0);

    const productUrl = process.env.ENVIRONMENT;
    console.log("business deposit url: ", productUrl);

    let flowError: unknown;
    try {
        await businessLogin(page, productUrl);
        await businessEligibility(page);
        await businessProductSelection(page);
        await businessInfo(page);
        await businessYourInfo(page);
        await businessOwnership(page);
        await businessManagingController(page);
        await businessCheckingOptions(page);
    } catch (err) {
        console.error('Flow failed — keeping browser open so you can inspect:', err);
        flowError = err;
    }

    await waitForTestWindowToClose(page);
    if (flowError) throw flowError;
});
