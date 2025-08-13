export const incomePrefill = async (page: any) => {
  if (!(process.env.PREMATURESTOP === "income")) {
    await page.getByRole("button", { name: "Save & Continue" }).click();
    await page.waitForTimeout(200);
  }
};
