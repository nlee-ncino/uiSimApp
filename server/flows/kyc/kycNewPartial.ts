import {generateRandomResidentNumber} from "../../vars/utilMethods";

export const kycNewPartial = async (page: any) => {
    // Citizenship is a 3-way choice on the KYC page (mirrors omni personal-info-page):
    //   citizen            -> U.S. Citizen (default, full identity path)
    //   permanentResident  -> U.S. Permanent Resident (residency sub-form, then full path)
    //   nonResident        -> Non-U.S. Citizen / NRA (country + DOB only; the app gates the rest)
    const citizenshipStatus = (process.env.CITIZENSHIPSTATUS || 'citizen').toLowerCase();
    const dob = process.env.DOB || '12/12/2000';
    // Permanent residents may or may not have an SSN. When "No", the app hides the SSN field,
    // so we both click the No toggle and skip the SSN fill in the shared identity path.
    const residentHasSsn = (process.env.RESIDENTHASSSN || 'true').toLowerCase() !== 'false';

    // Fill a Vuetify-style dropdown by clicking it then selecting the matching option.
    // The country dropdown is a readonly v-select whose `.v-select__selections` overlay
    // intercepts pointer events, so force the click (as omni's selectFromDropdown does).
    const selectFromDropdown = async (dropdown: any, optionName: string) => {
        await dropdown.click({delay: 200, force: true});
        await page.waitForTimeout(300);
        // Exclude native <select> <option>s; Vuetify options are not inside a <select>.
        await page
            .getByRole('option', {name: optionName, exact: true})
            .and(page.locator(':not(select *)'))
            .first()
            .click({delay: 200, force: true});
        await page.waitForTimeout(500);
    };

    // Shared tail for citizens and permanent residents: DOB, SSN, address, identification.
    // SSN is skipped when the applicant has no SSN (permanent resident answering "No"), since
    // the app hides the field in that case.
    const fillFullIdentity = async (fillSsn = true) => {
        await page.locator('input[data-cy="dob-field"]').fill(dob);
        await page.waitForTimeout(200);

        if (fillSsn) {
            const ssn = process.env.SSN || '666-00-1234';
            await page.getByTestId('ssn-identification-number-field-input').fill(ssn);
            await page.waitForTimeout(200);
        }

        await page.getByRole('textbox', {name: 'Street address'}).click();
        await page.waitForTimeout(200);

        const address = process.env.ADDRESS || '200201 Test Rd';
        await page.getByRole('textbox', {name: 'Street address'}).fill(address);
        await page.waitForTimeout(200);

        await page.getByRole('textbox', {name: 'City'}).click();
        await page.waitForTimeout(200);

        const city = process.env.CITY || 'Fantasy Island';
        await page.getByRole('textbox', {name: 'City'}).fill(city);
        await page.waitForTimeout(200);

        await page.getByRole('textbox', {name: 'State'}).click();
        await page.waitForTimeout(200);
        await page.getByRole('textbox', {name: 'State'}).fill('il');
        await page.waitForTimeout(200);
        await page.getByRole('textbox', {name: 'State'}).press('Enter');
        await page.waitForTimeout(200);

        await page.getByRole('textbox', {name: /zip/i}).click();
        await page.waitForTimeout(200);

        const zipcode = process.env.ZIP || '60750';
        await page.getByRole('textbox', {name: /zip/i}).fill(zipcode);
        await page.waitForTimeout(200);

        await page.getByRole('radio', {name: 'Own'}).check();
        await page.waitForTimeout(200);

        await page.getByRole('button', {name: 'Identification type'}).click();
        await page.waitForTimeout(200);

        await page.getByRole('radio', {name: "Driver's license"}).check();
        await page.waitForTimeout(200);

        const idNumber = page.getByTestId('identification_number-identification-number-field').locator('input');
        await idNumber.click();
        await page.waitForTimeout(200);
        await idNumber.clear();
        await page.waitForTimeout(200);
        await idNumber.pressSequentially('a123443');
        await page.waitForTimeout(200);

        await page.getByRole('textbox', {name: "Driver's license issuing state"}).click();
        await page.waitForTimeout(200);
        await page.getByRole('textbox', {name: "Driver's license issuing state"}).fill('il');
        await page.waitForTimeout(200);
        await page.getByRole('textbox', {name: "Driver's license issuing state"}).press('Enter');
        await page.waitForTimeout(200);

        await page.locator('input[data-cy="identification_issue_date-field"]').click();
        await page.waitForTimeout(200);
        await page.locator('input[data-cy="identification_issue_date-field"]').fill('12/12/2000');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(200);

        await page.locator('input[data-cy="identification_expiration_date-field"]').click();
        await page.waitForTimeout(200);
        // A far-future year trips the field's aboveMaxDate validation and leaves the
        // datepicker open, blocking the rest of the flow. Use a near-future expiration date.
        await page.locator('input[data-cy="identification_expiration_date-field"]').fill('12/12/2030');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(200);
    };

    // Fill the permanent-resident sub-form (country, residency dates, resident number, has-SSN).
    const fillPermanentResidentForm = async () => {
        const country = process.env.COUNTRYOFCITIZENSHIP || 'AF - Afghanistan';
        await selectFromDropdown(page.locator('[data-testid="country_of_citizenship-dropdown"]'), country);

        const issueDate = process.env.RESIDENCYISSUEDATE || '01/01/2020';
        await page.locator('[data-cy="permanent_residency_issue_date-field"]').fill(issueDate);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(200);

        const entryDate = process.env.RESIDENCYENTRYDATE || '01/01/2020';
        await page.locator('[data-cy="permanent_residency_date_of_entry-field"]').fill(entryDate);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(200);

        const residentNumber = process.env.RESIDENTNUMBER || generateRandomResidentNumber();
        await page.locator('[data-cy="permanent_resident_number-field"]').fill(residentNumber);
        await page.waitForTimeout(200);

        const hasSsnBtn = residentHasSsn
            ? 'input[data-cy="permanent_resident_has_ssn-Yes-btn"]'
            : 'input[data-cy="permanent_resident_has_ssn-No-btn"]';
        await page.locator(hasSsnBtn).click();
        await page.waitForTimeout(200);
    };

    if (citizenshipStatus === 'permanentresident') {
        await page.getByRole('radio', {name: 'U.S. Permanent Resident', exact: true}).click();
        await page.waitForTimeout(1200);
        await fillPermanentResidentForm();
        await fillFullIdentity(residentHasSsn);
    } else if (citizenshipStatus === 'nonresident' || citizenshipStatus === 'nra') {
        await page.getByRole('radio', {name: 'Non-U.S. Citizen', exact: true}).click();
        await page.waitForTimeout(1200);
        // NRA path: country of citizenship + DOB only — the app gates SSN/address/ID.
        const country = process.env.COUNTRYOFCITIZENSHIP || 'AF - Afghanistan';
        await selectFromDropdown(page.locator('[data-testid="country_of_citizenship-dropdown"]'), country);
        await page.locator('input[data-cy="dob-field"]').fill(dob);
        await page.waitForTimeout(200);
    } else {
        await page.getByRole('radio', {name: 'U.S. Citizen', exact: true}).click();
        await page.waitForTimeout(1200);
        await fillFullIdentity();
    }
};
