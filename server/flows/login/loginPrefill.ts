import {EMAIL, PASSWORD} from "../../vars/prefillLoginCredentials";

export const loginPrefill = async (page: any, url: any) => {
    await page.goto(url);
    await page.waitForTimeout(200);

    await page.getByRole("textbox", {name: "What is your email?"}).click();
    await page.waitForTimeout(200);

    const email = process.env.EMAIL ? process.env.EMAIL : EMAIL;
    console.log("email: ", email);
    await page.getByRole("textbox", {name: "What is your email?"}).fill(email);
    await page.waitForTimeout(200);

    await page.getByRole("button", {name: "Continue"}).click();
    await page.waitForTimeout(200);

    await page.getByRole("textbox", {name: "Password"}).click();
    await page.waitForTimeout(200);

    const password = process.env.PASSWORD ? process.env.PASSWORD : PASSWORD;
    console.log("Password: ", password);
    await page.getByRole("textbox", {name: "Password"}).fill(password);
    await page.waitForTimeout(200);

    if (!(process.env.PREMATURESTOP === "login")) {
        await page.getByRole('button', {name: 'Sign in'}).click();
        await page.waitForTimeout(200);
    }
};
