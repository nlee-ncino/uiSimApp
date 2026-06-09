import {acceptDisclosures} from "../../vars/utilMethods";

export const businessInfo = async (page: any) => {
    const entityType = process.env.BUSINESSENTITYTYPE || 'llc';
    const businessName = process.env.BUSINESSNAME || 'Acme Test LLC';
    const ein = process.env.BUSINESSEIN || '12-3456789';
    const businessPhone = process.env.BUSINESSPHONE || '(234) 242-3423';
    const incorporationDate = process.env.BUSINESSINCORPORATIONDATE || '01/01/2010';
    const businessAddress = process.env.BUSINESSADDRESS || '200201 Test Rd';
    const businessCity = process.env.BUSINESSCITY || 'Fantasy Island';
    const businessState = process.env.BUSINESSSTATE || 'NC';
    const businessZip = process.env.BUSINESSZIP || '60750';

    // Basic Details — Entity Type selection (card buttons or dropdown)
    const dropdown = page.getByRole('combobox', {name: 'Entity Type'});
    const isDropdown = await dropdown.isVisible({timeout: 5000}).catch(() => false);

    const valueMap: Record<string, string> = {
        corporation: 'Corporation',
        llc: 'Limited Liability Company',
        partnership: 'Partnership',
        'sole proprietorship': 'Sole Proprietorship - Business'
    };

    if (isDropdown) {
        const value = valueMap[entityType.toLowerCase()];
        if (value) await dropdown.selectOption({value});
    } else {
        const cardMap: Record<string, string> = {
            corporation: 'Corporation',
            llc: 'Limited Liability Company (LLC)',
            partnership: 'Partnership',
            'sole proprietorship': 'Sole Proprietorship'
        };
        const cardLabel = cardMap[entityType.toLowerCase()];
        if (cardLabel) {
            await page.locator(`[data-cy="${cardLabel}"]`).click({timeout: 30000});
        }
    }
    await page.waitForTimeout(500);

    await page.locator('[data-cy="business_name-field"]').fill(businessName);
    await page.waitForTimeout(500);

    await page.locator('[id="ein_identification-input"]').fill(ein.replace(/\D/g, ''));
    await page.waitForTimeout(500);

    await page.locator('[data-cy="continue-btn"]').click({delay: 500});
    await page.waitForLoadState('networkidle', {timeout: 30000});

    // Wait for matching to complete then move to additional details
    await page.locator('[data-cy="business_other_names-Yes-btn"], [data-cy="business_address-field"]')
        .first()
        .waitFor({state: 'visible', timeout: 60000});

    // No DBA
    await page.locator('[data-cy="business_other_names-No-btn"]').click();
    await page.waitForTimeout(500);

    // Country dropdown (when present) clears address fields on change — set first
    const countryField = page.locator('[data-cy="business_origin-field"]');
    if (await countryField.isVisible({timeout: 2000}).catch(() => false)) {
        await countryField.selectOption('US').catch(() => {});
        await page.waitForLoadState('networkidle', {timeout: 10000}).catch(() => {});
        await page.waitForTimeout(500);
    }

    // Use pressSequentially for the address field to suppress the autocomplete picker
    await page.locator('[data-cy="business_address-field"]').click();
    await page.locator('[data-cy="business_address-field"]').pressSequentially(businessAddress, {delay: 50});
    await page.click('body', {position: {x: 0, y: 0}});
    await page.waitForTimeout(500);

    await page.locator('[data-cy="business_city-field"]').fill(businessCity);
    await page.waitForTimeout(500);

    const stateDropdown = page.locator('[data-cy="business_state-dropdown"]');
    if (await stateDropdown.isVisible({timeout: 2000}).catch(() => false)) {
        await stateDropdown.selectOption(businessState).catch(async () => {
            // Fallback for searchable dropdowns
            await stateDropdown.click({delay: 200});
            await page.waitForTimeout(500);
            await page.getByRole('option', {name: businessState, exact: true}).first().click().catch(() => {});
        });
        await page.waitForTimeout(500);
    }

    await page.locator('[data-cy="business_zip-field"]').fill(businessZip);
    await page.waitForTimeout(500);

    await page.locator('[data-cy="business_incorporation_date-field"]').fill(incorporationDate);
    await page.locator('[data-cy="business_phone-field"]').click();
    await page.waitForTimeout(500);
    await page.locator('[data-cy="business_phone-field"]').fill(businessPhone);
    await page.waitForTimeout(500);

    // Business activities — select "None of the above" (the input is visually hidden,
    // so click the label).
    const noneActivities = page.locator('label[for="kyb_business_activities-4"]');
    if (await noneActivities.isVisible({timeout: 2000}).catch(() => false)) {
        await noneActivities.click({force: true});
        await page.waitForTimeout(500);
    }

    await acceptDisclosures(page);

    if (process.env.PREMATURESTOP === 'businessInfo') {
        await new Promise(() => {
        });
    }

    await page.locator('[data-cy="continue-btn"]').click({delay: 500});
    await page.waitForLoadState('networkidle', {timeout: 30000});
};
