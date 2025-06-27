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
            path = "tests/unsecuredLoan.spec.ts";
        } else {
            path = "tests/newUnsecuredLoan.spec.ts";
        }
    } else if (testType === "letterOfCredit") {
        if (isPrefill) {
            path = "tests/letterOfCredit.spec.ts";
        } else {
            path = "tests/newLetterOfCredit.spec.ts";
        }
    } else if (testType === "auto") {
        if (isPrefill) {
            path = "tests/usedAuto.spec.ts";
        } else {
            path = "tests/newUsedAuto.spec.ts";
        }
    } else if (testType === "loanToKYC") {
        if (isPrefill) {
            path = "tests/userLoanToKYC.spec.ts";
        } else {
            path = "tests/newUserLoanToKYC.spec.ts";
        }
    } else if (testType === "heloc") {
        if (isPrefill) {
            path = "tests/heloc.spec.ts";
        } else {
            path = "tests/newHeloc.spec.ts";
        }
    } else if (testType === "creditCard") {
        if (isPrefill) {
            path = "tests/creditCard.spec.ts";
        } else {
            path = "tests/newCreditCard.spec.ts";
        }
    }
    return path;
};

const buildTestCommand = (params) => {
    const envVars = Object.entries(params)
        .filter(([key]) => key !== 'path')
        .map(([key, value]) => {
            // Convert camelCase to UPPERCASE for environment variables
            const envKey = key === 'environment' ? 'ENVIRONMENT' : key.toUpperCase();
            return `${envKey}=${value}`;
        })
        .join(' ');

    return `${envVars} npx playwright test ${params.path} --headed`;
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
            environmentType,
            firstName,
            lastName,
            phone,
            dob,
            ssn,
            address,
            city,
            zip,
            prNumber,
            failEligibility
        } = req.body;

        const path = getUrlPath(testType, isPrefill);
        const testCommand = buildTestCommand({
            email,
            password,
            hasCoApplicant,
            environment: environmentType,
            firstName,
            lastName,
            phone,
            dob,
            ssn,
            address,
            city,
            zip,
            prNumber,
            failEligibility,
            path
        })
        console.log('Running test command:', testCommand);
        exec(testCommand);
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
            urls,
            firstName,
            lastName,
            phone,
            dob,
            ssn,
            address,
            city,
            zip,
            prNumber,
            failEligibility
        } = req.body;

        const path = getUrlPath(testType, isPrefill);

        urls.forEach((envUrl) => {
            const testCommand = buildTestCommand({
                email,
                password,
                hasCoApplicant,
                environment: envUrl,
                firstName,
                lastName,
                phone,
                dob,
                ssn,
                address,
                city,
                zip,
                prNumber,
                failEligibility,
                path
            })
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