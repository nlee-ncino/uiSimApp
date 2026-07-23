export const productSelection = async (page: any, hasCoapplicant: string | undefined) => {
    if (hasCoapplicant && hasCoapplicant === 'true') {
        await page.getByRole("radio", {name: "Yes"}).check();
        await page.waitForTimeout(500);

        await page.getByRole("radio", {name: "Yes"}).check();
        await page.waitForTimeout(500);
    } else {
        await page.getByRole("radio", {name: "No"}).check();
        await page.waitForTimeout(500);

        await page.getByRole("radio", {name: "No"}).check();
        await page.waitForTimeout(500);
    }

    const branchSelector = await page.getByRole("textbox", {name: "Which branch would you like to work with?"});
    if (await branchSelector.isVisible()) {
        await branchSelector.click();
        await branchSelector.fill("Online");
        await branchSelector.press("Enter");
        await page.waitForTimeout(500);
    }

    if ((process.env.PREMATURESTOP === "productSelection")) {
        await new Promise(() => {
        });
    }
    await page.getByRole("button", {name: "Save & Continue"}).click();
    await page.waitForTimeout(500);
};
