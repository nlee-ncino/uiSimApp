import {acceptDisclosures} from "../vars/utilMethods";

export const letterOfCreditNeeds = async (page: any) => {
    await page.getByRole("textbox", {name: "Purpose"}).click();
    await page.waitForTimeout(200);

    await page.getByText("Automobile Pledge").click();
    await page.waitForTimeout(200);

    await page.getByRole("textbox", {name: "Requested line amount"}).click();
    await page.waitForTimeout(200);

    await page
        .getByRole("textbox", {name: "Requested line amount"})
        .fill("2300");
    await page.waitForTimeout(200);

    await acceptDisclosures(page);
    if (!(process.env.PREMATURESTOP === "loanNeeds")) {
        await page.getByRole("button", {name: "Save & Continue"}).click();
    }
};
