export const incomeNew = async (page: any) => {
    // Income migrated to a "dynamic add" pattern (omni OMNI-6831): an income card must be
    // revealed via the "Add employment" button before any income fields render, the card has
    // its own save button, and income source/type/frequency are indexed dropdowns.
    const index = 1;
    const childPage = page.getByTestId(`dynamic-add-child-page-${index}`);

    // Income source/type are searchable <input> comboboxes: type to filter, then click the option.
    const selectOption = async (dropdown: any, optionName: string) => {
        await dropdown.click({delay: 200});
        await page.waitForTimeout(300);
        await dropdown.fill(optionName);
        await page.waitForTimeout(300);
        await page.getByRole('option', {name: optionName, exact: true}).first().click({delay: 200});
        await page.waitForTimeout(500);
    };

    // Income frequency is a <div role="button" aria-haspopup="listbox"> (not an input, so it can't
    // be filled): click to open the listbox, then click the option.
    const selectListbox = async (button: any, optionName: string) => {
        await button.click({delay: 200});
        await page.waitForTimeout(300);
        await page.getByRole('option', {name: optionName, exact: true}).first().click({delay: 200});
        await page.waitForTimeout(500);
    };

    // Reveal a fresh income card.
    await page
        .locator('[data-cy="dynamic-add-btn"]', {hasText: 'Add employment'})
        .or(page.locator('[data-cy="dynamic-add-btn"]', {hasText: 'Add additional or previous employment'}))
        .first()
        .click({delay: 500});
    await page.waitForTimeout(500);

    // Income source.
    await selectOption(page.locator(`input[data-cy="detailed_income_${index}_type-dropdown"]`), 'Employment');

    // Employer name.
    const employerName = page.locator(`input[data-cy="detailed_income_${index}_employer_name-field"]`);
    await employerName.click();
    await employerName.pressSequentially('Emplyer Name', {delay: 50});
    await page.waitForTimeout(200);

    // Current income.
    await page.locator(`input[data-cy="detailed_income_${index}_current-Yes-btn"]`).click();
    await page.waitForTimeout(200);

    // Position.
    const position = page.locator(`input[data-cy="detailed_income_${index}_employment_position-field"]`);
    await position.click();
    await position.pressSequentially('Position', {delay: 50});
    await page.waitForTimeout(200);

    // Start date (MMddyyyy, Tab to dismiss the datepicker).
    const startDate = page.locator(`input[data-cy="detailed_income_${index}_start_date-field"]`);
    await startDate.click();
    await startDate.pressSequentially('12122000', {delay: 100});
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);

    // Income type (the dropdown id is suffixed with the income source).
    await selectOption(page.locator(`input[data-cy="detailed_income_${index}_type_for_Employment-dropdown"]`), 'Salary/Hourly Wages');

    // Income amount (scoped to this card).
    const amount = childPage.locator('input[data-cy="text-field"]');
    await amount.click();
    await amount.fill('200000');
    await page.waitForTimeout(200);

    // Income frequency (scoped to this card).
    await selectListbox(childPage.locator('[role="button"][aria-haspopup="listbox"]'), 'Annually');

    if ((process.env.PREMATURESTOP === "income")) {
        await new Promise(() => {
        });
    }

    // Save the income card, then continue.
    await childPage.getByTestId('dynamic-add-child-page-save-btn').click({delay: 500});
    await page.waitForTimeout(500);

    await page.getByRole("button", {name: "Save & Continue"}).click();
    await page.waitForTimeout(200);
};
