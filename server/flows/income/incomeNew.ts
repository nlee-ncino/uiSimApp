export const incomeNew = async (page: any) => {
  await page.getByRole("textbox", { name: "Income source" }).click();
  await page.waitForTimeout(200);

  await page.getByText("Employment", { exact: true }).click();
  await page.waitForTimeout(200);

  await page.getByRole("textbox", { name: "Employer name" }).click();
  await page.waitForTimeout(200);

  await page
    .getByRole("textbox", { name: "Employer name" })
    .fill("Emplyer Name");
  await page.waitForTimeout(200);

  await page.locator(`[data-cy="detailed_income_1_current-Yes-btn"]`).click();
  await page.waitForTimeout(200);

  await page.getByRole("textbox", { name: "Position" }).click();
  await page.waitForTimeout(200);

  await page.getByRole("textbox", { name: "Position" }).fill("Position");
  await page.waitForTimeout(200);

  await page.getByRole("textbox", { name: "mm/dd/yyyy" }).click();
  await page.waitForTimeout(200);

  await page.getByRole("textbox", { name: "mm/dd/yyyy" }).fill("12/12/2000");
  await page.waitForTimeout(200);

  await page.getByRole("textbox", { name: "Income type" }).click();
  await page.waitForTimeout(200);

  await page.getByText("Salary/Hourly Wages").click();
  await page.waitForTimeout(200);

  await page.locator(`[data-cy="text-field"]`).click();
  await page.waitForTimeout(200);

  await page.locator(`[data-cy="text-field"]`).fill("200000");
  await page.waitForTimeout(200);

  await page
    .locator(`[data-cy="detailed_income_1_bonus_or_commission-No-btn"]`)
    .click();
  await page.waitForTimeout(200);

  if (!(process.env.PREMATURESTOP === "income")) {
    await page.getByRole("button", { name: "Save & Continue" }).click();
    await page.waitForTimeout(200);
  }
};
