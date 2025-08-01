import {defineConfig, devices} from "@playwright/test";

export default defineConfig({
    testDir: "./tests",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: 0,
    workers: 30,
    reporter: [["html", {open: "never"}]],
    use: {
        trace: 'off',
        video: 'off',
        screenshot: 'off',

    },
    projects: [
        {
            name: "chromium",
            use: {...devices["Desktop Chrome"]},
        }
    ],
});
