const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {exec} = require("child_process");
const app = express();
const port = process.env.PORT || 4001;
const getUrlPath = (testType, isPrefill) => {
    let path = "";
    if (testType === "unsecuredTerm") {
        if (isPrefill) {
            path = "tests/existing_user/unsecuredLoan.spec.ts";
        } else {
            path = "tests/new_user/newUnsecuredLoan.spec.ts";
        }
    } else if (testType === "letterOfCredit") {
        if (isPrefill) {
            path = "tests/existing_user/letterOfCredit.spec.ts";
        } else {
            path = "tests/new_user/newLetterOfCredit.spec.ts";
        }
    } else if (testType === "auto") {
        if (isPrefill) {
            path = "tests/existing_user/usedAuto.spec.ts";
        } else {
            path = "tests/new_user/newUsedAuto.spec.ts";
        }
    } else if (testType === "loanToKYC") {
        if (isPrefill) {
            path = "tests/existing_user/userLoanToKYC.spec.ts";
        } else {
            path = "tests/new_user/newUserLoanToKYC.spec.ts";
        }
    } else if (testType === "heloc") {
        if (isPrefill) {
            path = "tests/existing_user/heloc.spec.ts";
        } else {
            path = "tests/new_user/newHeloc.spec.ts";
        }
    } else if (testType === "creditCard") {
        if (isPrefill) {
            path = "tests/existing_user/creditCard.spec.ts";
        } else {
            path = "tests/new_user/newCreditCard.spec.ts";
        }
    } else if (testType === "businessDeposit") {
        path = "tests/new_user/newBusinessDeposit.spec.ts";
    }
    return path;
};

const buildTestCommand = (params, isBatch = false) => {
    const envVars = Object.entries(params)
        .filter(([key]) => key !== 'path')
        .map(([key, value]) => {
            // Convert camelCase to UPPERCASE for environment variables
            const envKey = key === 'environment' ? 'ENVIRONMENT' : key.toUpperCase();
            // Single-quote the value so spaces (e.g. "josh 2") don't break the command
            const quoted = `'${String(value).replace(/'/g, `'\\''`)}'`;
            return `${envKey}=${quoted}`;
        })
        .join(' ');

    // Add BATCH_TEST=true for batch tests
    const batchEnv = isBatch ? 'BATCH_TEST=true ' : '';

    return `${batchEnv}${envVars} npx playwright test ${params.path} --headed`;
};

app.use(cors());
app.use(bodyParser.json());

// API routes
app.post('/run-tests', async (req) => {
    try {
        const {
            email,
            password,
            testType,
            isPrefill,
            hasCoApplicant,
            coappFirstName,
            coappLastName,
            coappPhone,
            coappEmail,
            citizenshipStatus,
            countryOfCitizenship,
            residencyIssueDate,
            residencyEntryDate,
            residentNumber,
            residentHasSsn,
            environmentType,
            firstName,
            lastName,
            phone,
            dob,
            ssn,
            address,
            city,
            zip,
            failEligibility,
            skipEligibility,
            prematureStop,
            businessName,
            businessEntityType,
            businessEin,
            businessPhone,
            businessIncorporationDate,
            businessAddress,
            businessCity,
            businessState,
            businessZip
        } = req.body;

        const path = getUrlPath(testType, isPrefill);
        const testCommand = buildTestCommand({
            email,
            password,
            hasCoApplicant,
            coappFirstName,
            coappLastName,
            coappPhone,
            coappEmail,
            citizenshipStatus,
            countryOfCitizenship,
            residencyIssueDate,
            residencyEntryDate,
            residentNumber,
            residentHasSsn,
            environment: environmentType,
            firstName,
            lastName,
            phone,
            dob,
            ssn,
            address,
            city,
            zip,
            failEligibility,
            skipEligibility,
            prematureStop,
            businessName,
            businessEntityType,
            businessEin,
            businessPhone,
            businessIncorporationDate,
            businessAddress,
            businessCity,
            businessState,
            businessZip,
            path
        })
        console.log('Running test command:', testCommand);
        exec('killall \'Google Chrome for Testing\'', () => exec(testCommand));
    } catch (error) {
        console.error('Error running tests:', error);
    }
});

app.post('/run-tests-batch', async (req) => {
    try {
        const {
            email,
            password,
            testType,
            isPrefill,
            hasCoApplicant,
            coappFirstName,
            coappLastName,
            coappPhone,
            coappEmail,
            citizenshipStatus,
            countryOfCitizenship,
            residencyIssueDate,
            residencyEntryDate,
            residentNumber,
            residentHasSsn,
            urls,
            firstName,
            lastName,
            phone,
            dob,
            ssn,
            address,
            city,
            zip,
            failEligibility,
            skipEligibility,
            prematureStop,
            businessName,
            businessEntityType,
            businessEin,
            businessPhone,
            businessIncorporationDate,
            businessAddress,
            businessCity,
            businessState,
            businessZip
        } = req.body;

        const path = getUrlPath(testType, isPrefill);

        urls.forEach((envUrl) => {
            const testCommand = buildTestCommand({
                email,
                password,
                hasCoApplicant,
                coappFirstName,
                coappLastName,
                coappPhone,
                coappEmail,
                citizenshipStatus,
                countryOfCitizenship,
                residencyIssueDate,
                residencyEntryDate,
                residentNumber,
                residentHasSsn,
                environment: envUrl,
                firstName,
                lastName,
                phone,
                dob,
                ssn,
                address,
                city,
                zip,
                failEligibility,
                skipEligibility,
                prematureStop,
                businessName,
                businessEntityType,
                businessEin,
                businessPhone,
                businessIncorporationDate,
                businessAddress,
                businessCity,
                businessState,
                businessZip,
                path
            }, true) // Pass true for isBatch parameter
            console.log(`Running test command for ${envUrl}:`, testCommand);
            exec(testCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error for ${envUrl}:`, error);
                    return;
                }
                console.log(`Output for ${envUrl}:\n`, stdout);
                if (stderr) {
                    console.error(`Stderr for ${envUrl}:\n`, stderr);
                }
            });
        });
    } catch (error) {
        console.error('Error running batch tests:', error);
    }
});

app.get('/', (req, res) => {
    res.send(`
            <html>
                <head><title>API Server</title></head>
                <body>
                    <h1>API Server is running</h1>
                    <p>This is your Express API server
                </body>
            </html>
        `);
});

// Start server
app.listen(port, () => {
    console.log(`API Server running at http://localhost:${port}`);
});
