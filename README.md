# ui-sim-app

Run consumer and business onboarding simulations from a local Vue interface.

## Start the project

```
npm install
npm run all
```

`npm install` installs the server dependencies and verifies that Playwright's
Chromium browser is available. `npm run all` and `npm run build` perform the
same verification before they run.

Open http://localhost:4000 after both the client and server have started.

## Configure a simulation

- Set the test data in the form, then select **Save as Local Defaults** to
  reuse it in later local runs. Defaults are stored in
  `server/.local/test-data.json`; keep this machine-specific file out of Git.
- Consumer simulations generate a unique SSN and date of birth for each run by
  default. Turn off **Generate a unique SSN and date of birth** to provide
  fixed values instead.
- Business simulations generate a unique EIN and incorporation date by
  default. Turn off **Generate a unique EIN and incorporation date** to
  provide fixed values instead.
- For business deposit runs, set the primary applicant's ownership percentage
  and add related parties or beneficial owners as needed. Each related party
  requires a first name, last name, and ownership percentage of at least 20%;
  combined ownership cannot exceed 100%.

## Run simulations

Select **Run Tests** to start either a single simulation or a batch using the
configured URLs. The interface displays the active run and its batch progress,
and prevents a second run from starting until the current one finishes.
