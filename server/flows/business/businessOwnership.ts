import {formatPhoneNumber, generateRandomEmail} from '../../vars/utilMethods';

interface RelatedParty {
    firstName: string;
    lastName: string;
    title?: string;
    email?: string;
    phone?: string;
    ownershipPercentage: number;
}

const getRelatedParties = (): RelatedParty[] => {
    try {
        const relatedParties = JSON.parse(process.env.RELATEDPARTIES || '[]');
        return Array.isArray(relatedParties) ? relatedParties : [];
    } catch (error) {
        throw new Error(`Unable to read related-party data: ${error}`);
    }
};

export const businessOwnership = async (page: any) => {
    const relatedParties = getRelatedParties();
    if (relatedParties.length === 0) {
        return;
    }

    const ownershipSection = page.getByTestId('ownership');
    const addOwnerButton = ownershipSection.locator('[data-cy="dynamic-add-btn"]')
        .filter({hasText: /Add (Another )?Owner/}).first();
    await addOwnerButton.waitFor({state: 'visible', timeout: 30000});

    const ownerCards = ownershipSection.getByTestId(/^dynamic-add-child-page-\d+$/);

    for (let index = 0; index < relatedParties.length; index++) {
        const party = relatedParties[index];
        const ownerIndex = await ownerCards.count();

        await addOwnerButton.click();

        const ownerCard = ownerCards.nth(ownerIndex);
        await ownerCard.waitFor({state: 'visible', timeout: 15000});

        const individualOwnerRadio = ownerCard.getByRole('radio', {name: 'Individual', exact: true});
        await individualOwnerRadio.waitFor({state: 'visible', timeout: 15000});
        await individualOwnerRadio.check();

        const firstName = ownerCard.locator('input[id^="owner_"][id$="_first_name"]');
        await firstName.waitFor({state: 'visible', timeout: 15000});
        await firstName.fill(party.firstName);
        await ownerCard.locator('input[id^="owner_"][id$="_last_name"]').fill(party.lastName);
        if (party.title) {
            await ownerCard.locator('input[id^="owner_"][id$="_title"]').fill(party.title);
        }
        if (party.phone) {
            await ownerCard.locator('input[id^="owner_"][id$="_phone"]').fill(formatPhoneNumber(party.phone));
        }

        const email = generateRandomEmail(party.email || process.env.EMAIL, party.firstName, party.lastName, true);
        await ownerCard.locator('input[id^="owner_"][id$="_email"]').fill(email);
        const ownershipPercentage = ownerCard
            .locator('input[id^="owner_"][id$="_percentage_individual-input"]')
            .or(ownerCard.locator('ngc-input-percent input'))
            .first();
        const percentageValue = String(party.ownershipPercentage);
        await ownershipPercentage.waitFor({state: 'visible', timeout: 15000});
        await ownershipPercentage.fill(percentageValue);

        const percentageComponent = ownerCard.locator('ngc-input-percent').first();
        if (await percentageComponent.count()) {
            await percentageComponent.evaluate((component: any, value: string) => {
                const input = component.shadowRoot?.querySelector('input') || component.querySelector('input');
                component.value = value;
                if (input) input.value = value;
                component.dispatchEvent(new CustomEvent('input', {
                    bubbles: true,
                    composed: true,
                    detail: {value}
                }));
                component.dispatchEvent(new Event('change', {bubbles: true, composed: true}));
            }, percentageValue);
        }
        await ownershipPercentage.blur();

        const renderedPercentage = Number((await ownershipPercentage.inputValue()).replace(/[^\d.]/g, ''));
        if (renderedPercentage !== party.ownershipPercentage) {
            throw new Error(`Related party ${index + 1} ownership percentage was not entered`);
        }

        const saveButton = ownerCard.getByTestId('dynamic-add-child-page-save-btn');
        await saveButton.click();
        await saveButton.waitFor({state: 'hidden', timeout: 15000});
    }
};
