export const incomePrefill = async (page: any) => {
  await page.getByRole("button", { name: "Save & Continue" }).click();
  await page.waitForTimeout(200);
};
