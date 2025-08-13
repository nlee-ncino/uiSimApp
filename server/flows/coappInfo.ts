import {generateRandomEmail} from "../vars/utilMethods";

export const coappInfo = async (page: any) => {
    await page.getByRole('textbox', {name: 'Co-applicant first name'}).click();
    await page.waitForTimeout(500);

    await page.getByRole('textbox', {name: 'Co-applicant first name'}).fill('Josh');
    await page.waitForTimeout(500);

    await page.getByRole('textbox', {name: 'Co-applicant last name'}).click();
    await page.waitForTimeout(500);

    await page.getByRole('textbox', {name: 'Co-applicant last name'}).fill('Pass');
    await page.waitForTimeout(500);

    await page.getByRole('textbox', {name: '(___) ___-____'}).click();
    await page.waitForTimeout(500);

    await page.getByRole('textbox', {name: '(___) ___-____'}).fill('(111) 111-1111');
    await page.waitForTimeout(500);

    await page.getByRole('textbox', {name: 'Co-applicant email'}).click();
    await page.waitForTimeout(500);

    const randomEmail = generateRandomEmail();
    await page.getByRole('textbox', {name: 'Co-applicant email'}).fill(randomEmail);
    await page.waitForTimeout(500);

    if ((process.env.PREMATURESTOP === "coApp")) {
        await new Promise(() => {
        });
    }
    await page.getByRole('button', {name: 'Save & Continue'}).click();
    await page.waitForTimeout(500);
}


