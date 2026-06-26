import {acceptDisclosures} from "../../vars/utilMethods";

export const businessYourInfo = async (page: any) => {
    const dob = process.env.DOB || '12/12/2000';
    const ssn = (process.env.SSN || '666-00-1234').replace(/\D/g, '');
    const ownerPercentage = process.env.BUSINESSOWNERPERCENTAGE || '100';
    const dlNumber = process.env.BUSINESSDLNUMBER || 'D1234567';
    const dlIssuingState = process.env.BUSINESSDLSTATE || 'NC';
    const dlIssueDate = process.env.BUSINESSDLISSUEDATE || '01012020';
    const dlExpDate = process.env.BUSINESSDLEXPDATE || '01012030';

    // Page 1: Personal details — beneficial owner, ownership %, citizenship, DOB, SSN
    const beneficialOwner = page.locator('[data-cy="beneficial_owner-checkbox"]');
    await beneficialOwner.waitFor({state: 'visible', timeout: 30000});
    await beneficialOwner.click({delay: 500});
    await page.waitForTimeout(500);

    const ownerField = page.locator('input[id="personal_info_owner_percentage-input"]');
    await ownerField.waitFor({state: 'visible', timeout: 30000});
    await ownerField.click();
    await page.waitForTimeout(500);
    await ownerField.clear();
    await ownerField.fill(ownerPercentage);
    await page.waitForTimeout(500);

    const dobField = page.locator('input[data-cy="personal_info_dob-field"]');
    await dobField.click();
    await dobField.pressSequentially(dob, {delay: 100});
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);

    const ssnField = page.locator('input[id="personal_info_ssn-input"]');
    if (!(await ssnField.inputValue())) {
        await ssnField.click();
        await ssnField.fill(ssn);
    }
    await page.waitForTimeout(500);

    await acceptDisclosures(page);

    if (process.env.PREMATURESTOP === 'businessYourInfo') {
        await new Promise(() => {
        });
    }

    await page.locator('[data-cy="continue-btn"]').click({delay: 500});
    await page.waitForLoadState('networkidle', {timeout: 30000});

    // Wait for individual matching to complete
    const matchingField = page.locator('[data-cy="individual_match_status-field"]');
    const addressToggle = page.locator(
        '[data-cy="personal_info_business_same_as_personal-Yes-btn"], [data-cy="personal_info_business_same_as_personal-No-btn"]'
    );
    const firstVisible = await Promise.race([
        matchingField.waitFor({state: 'visible', timeout: 60000}).then(() => 'matching'),
        addressToggle.first().waitFor({state: 'visible', timeout: 60000}).then(() => 'address')
    ]);
    if (firstVisible === 'matching') {
        await matchingField.waitFor({state: 'detached', timeout: 60000});
    }
    await page.waitForLoadState('networkidle', {timeout: 30000});

    // Page 2: Address & ID — reuse business address, same mailing, driver's license
    await page.locator('[data-cy="personal_info_business_same_as_personal-Yes-btn"]').click({delay: 500});
    await page.waitForTimeout(500);
    await page.locator('[data-cy="personal_info_mailing_same_as_current-Yes-btn"]').click({delay: 500});
    await page.waitForTimeout(500);

    await page.locator('[data-cy="Drivers License"]').click();
    await page.waitForTimeout(500);
    await page.locator('[data-cy="drivers_license_number-field"]').pressSequentially(dlNumber, {delay: 100});
    await page.waitForTimeout(500);

    const stateDropdown = page.locator('[data-cy="drivers_license_issuing_state-dropdown"]');
    await stateDropdown.click({delay: 200});
    await page.waitForTimeout(500);
    // Vuetify combobox: type to filter, then click the matching list item.
    // Defaults are 2-letter codes; map a few common ones to full names so the option matches.
    const stateNameMap: Record<string, string> = {
        NC: 'North Carolina', SC: 'South Carolina', NY: 'New York', CA: 'California',
        TX: 'Texas', FL: 'Florida', VA: 'Virginia', GA: 'Georgia', TN: 'Tennessee'
    };
    const stateName = stateNameMap[dlIssuingState.toUpperCase()] || dlIssuingState;
    await stateDropdown.fill(stateName);
    await page.waitForTimeout(500);
    const option = page.locator('.v-list-item, [role="option"]').filter({hasText: stateName}).first();
    if (await option.isVisible({timeout: 3000}).catch(() => false)) {
        await option.click();
    } else {
        await page.keyboard.press('Enter');
    }
    await page.waitForTimeout(500);

    await page.locator('[data-cy="drivers_license_issuing_date-field"]').pressSequentially(dlIssueDate, {delay: 100});
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);

    await page.locator('[data-cy="drivers_license_expiration_date-field"]').pressSequentially(dlExpDate, {delay: 100});
    await page.click('body', {position: {x: 0, y: 0}});
    await page.waitForTimeout(500);

    if (process.env.PREMATURESTOP === 'businessYourInfoAddress') {
        await new Promise(() => {
        });
    }

    await page.locator('[data-cy="continue-btn"]').click({delay: 500});
    await page.waitForLoadState('networkidle', {timeout: 30000});
};
