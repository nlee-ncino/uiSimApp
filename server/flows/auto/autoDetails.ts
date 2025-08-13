export const autoDetails = async (page: any) => {
    await page.getByText("Used vehicle").click();
    await page.waitForTimeout(200);

    await page.getByRole("radio", {name: "No"}).check();
    await page.waitForTimeout(200);

    await page.getByTestId("autoCollateral_purchaseState").click();
    await page.waitForTimeout(200);

    await page.getByText("AL - Alabama").click();
    await page.waitForTimeout(500);

    await page.getByTestId("autoCollateral_mileage").click();
    await page.waitForTimeout(500);

    await page.getByTestId("autoCollateral_mileage").fill("3000");
    await page.waitForTimeout(500);

    await page.getByTestId("autoCollateral_year").click();
    await page.waitForTimeout(500);

    await page.getByText("2025").click();
    await page.waitForTimeout(500);

    await page.getByTestId("autoCollateral_make").click();
    await page.waitForTimeout(500);

    await page.getByText("Acura").click();
    await page.waitForTimeout(500);

    await page.getByTestId("autoCollateral_model").click();
    await page.waitForTimeout(500);

    await page.getByText("Integra", {exact: true}).click();
    await page.waitForTimeout(500);

    await page.getByTestId("autoCollateral_trim").click();
    await page.waitForTimeout(500);

    await page.getByText("Sedan 4D A-Spec Technology 1.5L I4 Turbo Auto").click();
    await page.waitForTimeout(2500);

    if ((process.env.PREMATURESTOP === "loanDetails")) {
        await new Promise(() => {});
    }
    await page.getByRole("button", {name: "Continue"}).click();
    await page.waitForTimeout(500);
    // auto review
    await page.getByRole("button", {name: "Continue"}).click();
    await page.waitForTimeout(500);
};
