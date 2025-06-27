export const kycNewPartial = async (page: any) => {
    await page.getByRole("textbox", {name: "mm/dd/yyyy"}).click();
    await page.waitForTimeout(200);

    const dob = process.env.DOB ? process.env.DOB : "12/12/2000";
    await page.getByRole("textbox", {name: "mm/dd/yyyy"}).fill(dob);
    await page.waitForTimeout(200);

    await page
        .getByRole("textbox", {name: /social security/i})
        .click();
    await page.waitForTimeout(200);

    const ssn = process.env.SSN ? process.env.SSN : "666-00-1234";

    await page
        .getByRole("textbox", {name: /social security/i})
        .fill(ssn);

    await page.waitForTimeout(200);

    await page.getByRole("textbox", {name: "Street address"}).click();
    await page.waitForTimeout(200);

    const address = process.env.ADDRESS ? process.env.ADDRESS : "200201 Test Rd";
    await page
        .getByRole("textbox", {name: "Street address"})
        .fill(address);
    await page.waitForTimeout(200);

    await page.getByRole("textbox", {name: "City"}).click();
    await page.waitForTimeout(200);

    const city = process.env.CITY ? process.env.CITY : "Fantasy Island";
    await page.getByRole("textbox", {name: "City"}).fill(city);
    await page.waitForTimeout(200);

    await page.getByRole("textbox", {name: "State"}).click();
    await page.waitForTimeout(200);

    await page.getByRole("textbox", {name: "State"}).fill("il");
    await page.waitForTimeout(200);

    await page.getByRole("textbox", {name: "State"}).press("Enter");
    await page.waitForTimeout(200);

    await page.getByRole("textbox", {name: /zip/i}).click();
    await page.waitForTimeout(200);

    const zipcode = process.env.ZIP ? process.env.ZIP : "60750";
    await page.getByRole("textbox", {name: /zip/i}).fill(zipcode);
    await page.waitForTimeout(200);

    await page.getByRole("radio", {name: "Own"}).check();
    await page.waitForTimeout(200);

    await page.getByRole("button", {name: "Identification type"}).click();
    await page.waitForTimeout(200);

    await page.getByRole("radio", {name: "Driver's license"}).check();
    await page.waitForTimeout(200);

    await page.getByRole("textbox", {name: "ID number"}).click();
    await page.waitForTimeout(200);

    await page.getByRole("textbox", {name: "ID number"}).fill("a123443");
    await page.waitForTimeout(200);

    await page
        .getByRole("textbox", {name: "Driver's license issuing state"})
        .click();
    await page.waitForTimeout(200);

    await page
        .getByRole("textbox", {name: "Driver's license issuing state"})
        .fill("il");
    await page.waitForTimeout(200);

    await page
        .getByRole("textbox", {name: "Driver's license issuing state"})
        .press("Enter");
    await page.waitForTimeout(200);

    await page.locator("#identification_issue_date").click();
    await page.waitForTimeout(200);

    await page.locator("#identification_issue_date").fill("12/12/2000");
    await page.waitForTimeout(200);

    await page.locator("#identification_expiration_date").click();
    await page.waitForTimeout(200);

    await page.locator("#identification_expiration_date").fill("12/12/2070");
    await page.waitForTimeout(200);
};
