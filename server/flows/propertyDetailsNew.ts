export const propertyDetailsNew = async (page: any) => {
    await page.getByRole('radio', {name: 'Yes'}).check();
    await page.waitForTimeout(200);

    await page.getByRole('radio', {name: 'Primary residence'}).check();
    await page.waitForTimeout(200);

    await page.getByRole('textbox', {name: 'What is the estimated value'}).click();
    await page.waitForTimeout(200);

    await page.getByRole('textbox', {name: 'What is the estimated value'}).fill('450000');
    await page.waitForTimeout(200);

    await page.getByRole('button', {name: 'Save & Continue'}).click();
    await page.waitForTimeout(200);
};
