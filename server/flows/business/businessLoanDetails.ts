export const businessLoanDetails = async (page: any) => {
    const shouldRandomizeAmount = process.env.RANDOMIZEBUSINESSLOANAMOUNT === 'true';
    const configuredAmount = Number(process.env.BUSINESSLOANAMOUNT || '50000');
    const amount = shouldRandomizeAmount
        ? 10000 + Math.floor(Math.random() * 81) * 500
        : configuredAmount;
    const purposeTextbox = page.getByRole('textbox', {name: 'What do you need a loan for?'});

    await purposeTextbox.waitFor({state: 'visible', timeout: 30000});
    await purposeTextbox.click({delay: 500});

    const purposeOption = page.locator('[role="option"]:visible').nth(1);
    await purposeOption.waitFor({state: 'visible', timeout: 10000});
    await purposeOption.click({delay: 500});

    const amountField = page.locator('[data-cy*="loan_amount"][data-cy$="field"]');
    await amountField.waitFor({state: 'visible', timeout: 30000});
    await amountField.fill(String(amount));
    console.log('UI_SIM_WAITING_FOR_INPUT: Business loan details are filled and ready for review.');
};
