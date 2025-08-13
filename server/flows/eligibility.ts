export const eligibility = async (page: any) => {
    await page.getByRole("textbox", {name: "Where do you live, work,"}).click();
    await page.waitForTimeout(500);


    process.env.FAILELIGIBILITY === 'true' ?
        await page.getByRole('option', {name: 'None of the above'}).click() : await page.getByText("Durham County").click();
    await page.waitForTimeout(500);

    await page.getByRole("textbox", {name: "Where are you employed?"}).click();
    await page.waitForTimeout(500);

    process.env.FAILELIGIBILITY === 'true' ?
        await page.getByRole('option', {name: 'None of the above'}).click() :
        await page.getByText("Atrium Health").click();
    await page.waitForTimeout(500);

    await page
        .getByRole("textbox", {name: "Where do you attend school or"})
        .click();
    await page.waitForTimeout(500);

    process.env.FAILELIGIBILITY === 'true' ?
        await page.getByRole('option', {name: 'None of the above'}).click() :
        await page.getByText("Clemson University").click();


    await page.waitForTimeout(500);

    await page.getByRole("radio", {name: "No"}).check();
    await page.waitForTimeout(500);

    if (!(process.env.PREMATURESTOP === "eligibility")) {
        await page.getByRole("button", {name: "Save & Continue"}).click();
        await page.waitForTimeout(500);
    }
};
