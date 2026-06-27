export const kycNewPartial = async (page: any) => {
    // await page.getByRole("textbox", {name: "mm/dd/yyyy"}).click();
    // await page.waitForTimeout(200);
    await page.getByRole('radio', { name: 'U.S. Citizen', exact: true }).click();
    await page.waitForTimeout(1200);
    const dob = process.env.DOB ? process.env.DOB : "12/12/2000";
    await page.locator('input[data-cy="dob-field"]').fill(dob);
    await page.waitForTimeout(200);

    const ssn = process.env.SSN ? process.env.SSN : "666-00-1234";
    await page.getByTestId('ssn-identification-number-field-input')
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

    await page.getByTestId('identification_number-identification-number-field').locator('input').click();
    await page.waitForTimeout(200);
    
    // Clear the field first, then fill it
    await page.getByTestId('identification_number-identification-number-field').locator('input').clear();
    await page.waitForTimeout(200);
    await page.getByTestId('identification_number-identification-number-field').locator('input').pressSequentially("a123443");
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

    await page.locator('input[data-cy="identification_issue_date-field"]').click();
    await page.waitForTimeout(200);

    await page.locator('input[data-cy="identification_issue_date-field"]').fill("12/12/2000");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);

    await page.locator('input[data-cy="identification_expiration_date-field"]').click();
    await page.waitForTimeout(200);

    await page.locator('input[data-cy="identification_expiration_date-field"]').fill("12/12/2030");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
};
