export const businessEligibility = async (page: any) => {
    if (process.env.SKIPELIGIBILITY === 'true') {
        return;
    }
    const locationDropdown = page.locator('input[data-cy="eligibility_live_work_worship_volunteer-dropdown"]');

    const present = await locationDropdown
        .waitFor({state: 'visible', timeout: 15000})
        .then(() => true)
        .catch(() => false);
    if (!present) {
        return;
    }

    const fail = process.env.FAILELIGIBILITY === 'true';

    const selectOption = async (dropdown: any, optionName: string) => {
        await dropdown.click({delay: 200});
        await page.waitForTimeout(500);
        const option = fail
            ? page.getByRole('option', {name: 'None of the above'})
            : page.getByRole('option', {name: optionName});
        await option.first().click();
        await page.waitForTimeout(500);
    };

    await selectOption(locationDropdown, 'Durham County');
    await selectOption(page.locator('input[data-cy="eligibility_employment_location-dropdown"]'), 'Atrium Health');
    await selectOption(page.locator('input[data-cy="eligibility_school_attended-dropdown"]'), 'Clemson University');

    await page.locator('input[data-cy="eligibility_family_member-No-btn"]').click();
    await page.waitForTimeout(500);

    if (process.env.PREMATURESTOP === 'eligibility') {
        await new Promise(() => {
        });
    }

    await page.getByRole('button', {name: 'Save & Continue'}).click();
    await page.waitForTimeout(500);
};
