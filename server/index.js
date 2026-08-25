const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {spawn} = require("child_process");
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
            const envKey = key === 'environment' ? 'ENVIRONMENT' : key.toUpperCase();
            const quoted = `'${String(value).replace(/'/g, `'\\''`)}'`;
            return `${envKey}=${quoted}`;
        })
        .join(' ');

    const batchEnv = isBatch ? 'BATCH_TEST=true ' : '';

    return `${batchEnv}${envVars} npx playwright test ${params.path} --headed`;
};

const startTest = (testCommand, label) => {
    console.log(`Starting ${label}`);

    const child = spawn('/bin/sh', ['-lc', testCommand], {
        cwd: __dirname,
        stdio: ['ignore', 'pipe', 'pipe']
    });

    child.stdout.on('data', (output) => {
        process.stdout.write(`[${label}] ${output}`);
    });
    child.stderr.on('data', (output) => {
        process.stderr.write(`[${label}] ${output}`);
    });
    child.on('error', (error) => {
        console.error(`Unable to start ${label}:`, error);
    });
    child.on('close', (code, signal) => {
        console.log(`${label} exited with code ${code}${signal ? ` (signal: ${signal})` : ''}`);
    });
};

app.use(cors());
app.use(bodyParser.json());

app.post('/run-tests', (req, res) => {
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
        if (!path) {
            return res.status(400).json({error: `Unsupported test type: ${testType}`});
        }

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
        });

        startTest(testCommand, path);
        return res.status(202).json({message: 'Test started', path});
    } catch (error) {
        console.error('Error running tests:', error);
        return res.status(500).json({error: 'Unable to start test'});
    }
});

app.post('/run-tests-batch', (req, res) => {
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
        if (!path) {
            return res.status(400).json({error: `Unsupported test type: ${testType}`});
        }
        if (!Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({error: 'At least one batch URL is required'});
        }

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
            }, true);
            startTest(testCommand, `${path} (${envUrl})`);
        });
        return res.status(202).json({message: 'Batch tests started', path, count: urls.length});
    } catch (error) {
        console.error('Error running batch tests:', error);
        return res.status(500).json({error: 'Unable to start batch tests'});
    }
});

app.get('/', (_req, res) => {
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
