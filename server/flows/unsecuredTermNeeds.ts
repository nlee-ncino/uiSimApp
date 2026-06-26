import {acceptDisclosures} from "../vars/utilMethods";

export const unsecuredTermNeeds = async (page: any) => {
    await page.getByRole("combobox").click();
    await page.waitForTimeout(500);

    await page.getByText("Automobile Pledge").click();
    await page.waitForTimeout(500);

    await page.getByRole("textbox", {name: "Desired Loan Amount"}).click();
    await page.waitForTimeout(500);

    await page.getByRole("textbox", {name: "Desired Loan Amount"}).fill("2300");
    await page.waitForTimeout(500);

    await acceptDisclosures(page);
    if ((process.env.PREMATURESTOP === "loanNeeds")) {
        await new Promise(() => {
        });
    }
    await page.getByRole("button", {name: "Save & Continue"}).click();
};
