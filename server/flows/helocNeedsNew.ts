export const helocNew = async (page: any) => {
    await page.getByRole('textbox', {name: 'What do you need a loan for?'}).click();
    await page.waitForTimeout(200);

    await page.getByText('Automobile Pledge').click();
    await page.waitForTimeout(200);

    await page.getByRole('textbox', {name: 'Desired Loan Amount'}).click();
    await page.waitForTimeout(200);

    await page.getByRole('textbox', {name: 'Desired Loan Amount'}).fill('45000');
    await page.waitForTimeout(200);

    if ((process.env.PREMATURESTOP === "loanNeeds")) {
        await new Promise(() => {
        });
    }
    await page.getByRole('button', {name: 'Save & Continue'}).click();
    await page.waitForTimeout(200);
};
