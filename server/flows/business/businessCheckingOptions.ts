// Expected Account Activity page. Answers the activity Yes/No questions and selects the account
// purpose. Selectors mirror omni's expected-account-activity-page (descriptive data-cy names).
// Purpose is selected LAST, matching omni's submitExpectedActivity ordering.
export const businessCheckingOptions = async (page: any) => {
    const purpose = process.env.ACCOUNTPURPOSE || 'Payroll';

    const purposeDropdown = page.locator('[data-cy*="purpose_of_account"][data-cy$="-dropdown"]').first();

    // Detect the page; skip if not present.
    const present = await purposeDropdown
        .waitFor({state: 'attached', timeout: 20000})
        .then(() => true)
        .catch(() => false);
    if (!present) {
        return;
    }

    // Answer a Yes/No question — the buttons are checkable inputs matched by a data-cy fragment.
    const answerNo = async (field: string) => {
        const btn = page.locator(`[data-cy*="${field}"][data-cy$="-No-btn"]`).first();
        if (await btn.isVisible({timeout: 3000}).catch(() => false)) {
            await btn.check().catch(async () => {
                await btn.click({force: true}).catch(() => {});
            });
            await page.waitForTimeout(500);
        }
    };

    // Default all activity questions to "No".
    await answerNo('account_to_process_cash_transactions');
    await answerNo('account_to_send_or_receive_checks');
    await answerNo('account_to_send_or_receive_ach_payments');
    await answerNo('account_to_deposit_or_withdraw_via_ach');
    await answerNo('account_to_send_or_receive_wire_transfers');

    // Account purpose (selected last, mirroring omni). Vuetify dropdown → option.
    await purposeDropdown.click({delay: 300, force: true});
    await page.waitForTimeout(800);
    await page.getByRole('option', {name: purpose, exact: false})
        .and(page.locator(':not(select *)'))
        .first()
        .click({delay: 200, force: true});
    await page.waitForTimeout(800);

    if (process.env.PREMATURESTOP === 'checkingOptions') {
        await new Promise(() => {
        });
    }

    await page.locator('[data-cy="continue-btn"]').click({delay: 500});
    await page.waitForTimeout(500);
};
