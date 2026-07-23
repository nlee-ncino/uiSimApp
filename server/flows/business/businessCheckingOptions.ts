export const businessCheckingOptions = async (page: any) => {
    const purpose = process.env.ACCOUNTPURPOSE || 'Payroll';

    const purposeDropdown = page.locator('[data-cy*="purpose_of_account"][data-cy$="-dropdown"]').first();

    const present = await purposeDropdown
        .waitFor({state: 'attached', timeout: 20000})
        .then(() => true)
        .catch(() => false);
    if (!present) {
        return;
    }

    const answerNo = async (field: string) => {
        const btn = page.locator(`[data-cy*="${field}"][data-cy$="-No-btn"]`).first();
        if (await btn.isVisible({timeout: 3000}).catch(() => false)) {
            await btn.check().catch(async () => {
                await btn.click({force: true}).catch(() => {});
            });
            await page.waitForTimeout(500);
        }
    };

    await answerNo('account_to_process_cash_transactions');
    await answerNo('account_to_send_or_receive_checks');
    await answerNo('account_to_send_or_receive_ach_payments');
    await answerNo('account_to_deposit_or_withdraw_via_ach');
    await answerNo('account_to_send_or_receive_wire_transfers');

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
