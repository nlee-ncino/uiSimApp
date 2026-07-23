export const businessManagingController = async (page: any) => {
    const dropdown = page.locator('[data-cy="managing_controller-dropdown"]');

    const present = await dropdown
        .waitFor({state: 'visible', timeout: 20000})
        .then(() => true)
        .catch(() => false);
    if (!present) {
        return;
    }

    const firstName = process.env.MCFIRSTNAME || process.env.FIRSTNAME || 'John';
    const lastName = process.env.MCLASTNAME || process.env.LASTNAME || 'Pass';
    const title = process.env.MCTITLE || 'CEO';
    const email = process.env.MCEMAIL || process.env.EMAIL || '';
    const phone = process.env.MCPHONE || '(234) 242-3423';
    const isOwner = (process.env.MCISOWNER || 'true').toLowerCase() !== 'false';

    await dropdown.click({delay: 200});
    await page.waitForTimeout(500);

    if (isOwner) {
        const ownerName = `${firstName} ${lastName}`;
        const ownerOption = page.getByRole('option', {name: ownerName, exact: true});
        if (await ownerOption.isVisible({timeout: 3000}).catch(() => false)) {
            await ownerOption.click();
        } else {
            await page.getByRole('option').first().click();
        }
        await page.waitForTimeout(500);
    } else {
        await page.getByRole('option', {name: 'Someone else', exact: true}).click();
        await page.waitForTimeout(500);

        await page.locator('[data-cy="managing_controller_first_name-field"]').pressSequentially(firstName, {delay: 100});
        await page.locator('[data-cy="managing_controller_last_name-field"]').pressSequentially(lastName, {delay: 100});
        await page.locator('[data-cy="managing_controller_title-field"]').pressSequentially(title, {delay: 100});
        if (email) {
            await page.locator('[data-cy="managing_controller_email-field"]').pressSequentially(email, {delay: 100});
        }
        await page.locator('[data-cy="managing_controller_phone-field"]').pressSequentially(phone, {delay: 100});
        await page.waitForTimeout(500);
    }

    if (process.env.PREMATURESTOP === 'managingController') {
        await new Promise(() => {
        });
    }

    await page.locator('[data-cy="continue-btn"]').click({delay: 500});
    await page.waitForTimeout(500);
};
