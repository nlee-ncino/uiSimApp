import {acceptDisclosures} from "../../vars/utilMethods";

export const autoNeeds = async (page: any) => {
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForTimeout(200);

  await page.getByRole("textbox", { name: "Desired Loan Amount" }).click();
  await page.waitForTimeout(200);

  await page.getByRole("textbox", { name: "Desired Loan Amount" }).fill("3000");
  await page.waitForTimeout(200);

  await page.getByRole("radio", { name: "No" }).check();

  await acceptDisclosures(page);

  if (!(process.env.PREMATURESTOP === "loanNeeds")) {
    await page.getByRole("button", { name: "Save & Continue" }).click();
  }
};
