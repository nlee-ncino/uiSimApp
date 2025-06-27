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

app.use(cors());
app.use(bodyParser.json());

// API routes
app.post('/run-tests', async (req, res) => {
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
        console.log(
            `Email: ${email}, Password: ${password}, Test Type: ${testType}, isPrefill: ${isPrefill}, hasCoApplicant: ${hasCoApplicant}, environmentType: ${environmentType}, First Name: ${firstName}, Last Name: ${lastName}, Phone: ${phone} DOB: ${dob}, SSN: ${ssn}, Address: ${address}, City: ${city}, Zip: ${zip}, PR Number: ${prNumber}, Fail Eligibility: ${failEligibility}`
        );

        const path = getUrlPath(testType, isPrefill);

        exec(
            `EMAIL=${email} PASSWORD=${password} HASCOAPPLICANT=${hasCoApplicant} ENVIRONMENT=${environmentType} FIRSTNAME=${firstName} LASTNAME=${lastName} PHONE=${phone} DOB=${dob} SSN=${ssn} ADDRESS=${address} CITY=${city} ZIP=${zip} PRNUMBER=${prNumber} FAILELIGIBILITY=${failEligibility} npx playwright test ${path} --headed`
        );
        res.send('Tests completed successfully');
    } catch (error) {
        console.error('Error running tests:', error);
        res.status(500).send(`Error running tests: ${error.message}`);
    }
});

app.post('/run-tests-batch', async (req, res) => {
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
        console.log(
            `Email: ${email}, Password: ${password}, Test Type: ${testType}, isPrefill: ${isPrefill}, hasCoApplicant: ${hasCoApplicant}, urls: ${urls}, First Name: ${firstName}, Last Name: ${lastName}, Phone: ${phone} DOB: ${dob}, SSN: ${ssn}, Address: ${address}, City: ${city}, Zip: ${zip}, PR Number: ${prNumber}, Fail Eligibility: ${failEligibility}`
        );

        const path = getUrlPath(testType, isPrefill);

        urls.forEach((envUrl) => {
            const command = `EMAIL=${email} PASSWORD=${password} HASCOAPPLICANT=${hasCoApplicant} ENVIRONMENT=${envUrl} FIRSTNAME=${firstName} LASTNAME=${lastName} PHONE=${phone} DOB=${dob} SSN=${ssn} ADDRESS=${address} CITY=${city} ZIP=${zip} PRNUMBER=${prNumber} FAILELIGIBILITY=${failEligibility} npx playwright test ${path} --headed`;

            exec(command, (error, stdout, stderr) => {
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

        res.send('Batch tests completed successfully');
    } catch (error) {
        console.error('Error running batch tests:', error);
        res.status(500).send(`Error running batch tests: ${error.message}`);
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