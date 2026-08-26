import {PASSWORD} from "../../vars/prefillLoginCredentials";
import {formatPhoneNumber, generateRandomEmail} from "../../vars/utilMethods";

export const loginNew = async (page: any, url: any) => {
    await page.goto(url);
    await page.waitForTimeout(200);

    await page.getByRole("textbox", {name: "What is your email?"}).click();
    await page.waitForTimeout(200);

    const email = generateRandomEmail(process.env.EMAIL, process.env.FIRSTNAME, process.env.LASTNAME, true);

    console.log("email: ", email);
    await page
        .getByRole("textbox", {name: "What is your email?"})
        .fill(email);
    await page.waitForTimeout(200);

    await page.getByRole("button", {name: "Continue"}).click();
    await page.waitForTimeout(200);

    const firstName = process.env.FIRSTNAME ? process.env.FIRSTNAME : 'John';
    await page.getByRole("textbox", {name: "First Name"}).fill(firstName);
    await page.waitForTimeout(200);

    await page.getByRole("textbox", {name: "First Name"}).press("Tab");
    await page.waitForTimeout(200);

    const lastName = process.env.LASTNAME ? process.env.LASTNAME : 'Pass';
    await page.getByRole("textbox", {name: "Last Name"}).fill(lastName);
    await page.waitForTimeout(200);

    await page.getByRole("textbox", {name: "Last Name"}).press("Tab");
    await page.waitForTimeout(200);

    const phone = process.env.PHONE ? formatPhoneNumber(process.env.PHONE) : '(234) 242-3423';
    await page
        .getByRole("textbox", {name: "Mobile Number"})
        .fill(phone);
    await page.waitForTimeout(200);

    const passwordElement = await page.locator("#user-password");
    const confirmPswdElement = await page.locator("#confirm-password");

    const password = process.env.PASSWORD ? process.env.PASSWORD : PASSWORD;
    console.log("Password: ", password);

    await passwordElement.click();
    await page.waitForTimeout(200);

    await passwordElement.fill(password);
    await page.waitForTimeout(200);

    await confirmPswdElement.click();
    await page.waitForTimeout(200);

    await confirmPswdElement.fill(password);
    await page.waitForTimeout(200);

    if ((process.env.PREMATURESTOP === "login")) {
        await new Promise(() => {
        });
    }
    await page.getByRole("button", {name: "Register Account"}).click();
    await page.waitForTimeout(200);
};
