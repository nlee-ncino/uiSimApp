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

    await addOwnerButton.click();

    for (let index = 0; index < relatedParties.length; index++) {
        const party = relatedParties[index];
        const ownerCard = page.locator('[data-testid^="dynamic-add-child-page-"]').last();
        await ownerCard.waitFor({state: 'visible', timeout: 15000});
        await ownerCard.locator('[data-cy="Individual"]').click();

        await ownerCard.locator('input[id^="owner_"][id$="_first_name"]').fill(party.firstName);
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
        await ownershipPercentage.fill(String(party.ownershipPercentage));
        await ownerCard.getByTestId('dynamic-add-child-page-save-btn').click();

        if (index < relatedParties.length - 1) {
            await addOwnerButton.click();
        }
    }
};
