export const demographicsNew = async (page: any) => {
    await page.getByRole('checkbox', {name: 'Hispanic or Latino', exact: true}).check();
    await page.waitForTimeout(200);

    await page.getByRole('checkbox', {name: 'Asian', exact: true}).check();
    await page.waitForTimeout(200);

    await page.getByRole('checkbox', {name: 'Male', exact: true}).check();
    await page.waitForTimeout(200);

    if ((process.env.PREMATURESTOP === "demographics")) {
        await new Promise(() => {
        });
    }
    await page.getByRole('button', {name: 'Save & Continue'}).click();
    await page.waitForTimeout(200);
};
