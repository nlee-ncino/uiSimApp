import {formatPhoneNumber, generateRandomEmail} from "../vars/utilMethods";
import {updateLatestTestRunApplicantInfo} from "../vars/latestTestRunApplicantInfo";

export const coappInfo = async (page: any) => {
    const firstName = process.env.COAPPFIRSTNAME || 'NateCoapp';
    const lastName = process.env.COAPPLASTNAME || 'Pass';
    const phone = process.env.COAPPPHONE ? formatPhoneNumber(process.env.COAPPPHONE) : '(111) 111-1111';
    const email = process.env.REUSELATESTAPPLICANTINFO === 'true' && process.env.COAPPEMAIL
        ? process.env.COAPPEMAIL
        : generateRandomEmail(process.env.COAPPEMAIL, process.env.COAPPFIRSTNAME, process.env.COAPPLASTNAME);

    updateLatestTestRunApplicantInfo({
        hasCoApplicant: true,
        coappFirstName: firstName,
        coappLastName: lastName,
        coappPhone: phone,
        coappEmail: email
    });

    await page.getByRole('textbox', {name: 'Co-applicant first name'}).click();
    await page.waitForTimeout(500);

    await page.getByRole('textbox', {name: 'Co-applicant first name'}).fill(firstName);
    await page.waitForTimeout(500);

    await page.getByRole('textbox', {name: 'Co-applicant last name'}).click();
    await page.waitForTimeout(500);

    await page.getByRole('textbox', {name: 'Co-applicant last name'}).fill(lastName);
    await page.waitForTimeout(500);

    await page.getByRole('textbox', {name: '(___) ___-____'}).click();
    await page.waitForTimeout(500);

    await page.getByRole('textbox', {name: '(___) ___-____'}).fill(phone);
    await page.waitForTimeout(500);

    await page.getByRole('textbox', {name: 'Co-applicant email'}).click();
    await page.waitForTimeout(500);

    await page.getByRole('textbox', {name: 'Co-applicant email'}).fill(email);
    await page.waitForTimeout(500);

    if ((process.env.PREMATURESTOP === "coApp")) {
        await new Promise(() => {
        });
    }
    await page.getByRole('button', {name: 'Save & Continue'}).click();
    await page.waitForTimeout(500);
}
