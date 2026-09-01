const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {spawn} = require("child_process");
const fs = require('fs');
const nodePath = require('path');
const app = express();
const port = process.env.PORT || 4001;

const localConfigDirectory = nodePath.join(__dirname, '.local');
const localTestDataPath = nodePath.join(localConfigDirectory, 'test-data.json');
const latestApplicantInfoPath = nodePath.join(localConfigDirectory, 'latest-test_run_applicant_info.json');
const applicantProfileFields = [
    'email', 'password', 'firstName', 'lastName', 'phone', 'citizenshipStatus',
    'countryOfCitizenship', 'residencyIssueDate', 'residencyEntryDate', 'residentNumber',
    'residentHasSsn', 'randomizeIdentity', 'dob', 'ssn', 'address', 'city', 'zip', 'hasCoApplicant',
    'coappFirstName', 'coappLastName', 'coappPhone', 'coappEmail'
];
const businessProfileFields = [
    'businessName',
    'businessEntityType', 'randomizeBusinessIdentity', 'businessEin', 'businessPhone', 'businessIncorporationDate',
    'businessAddress', 'businessCity', 'businessState', 'businessZip', 'businessLoanAmount',
    'randomizeBusinessLoanAmount', 'businessOwnerPercentage'
];
const DEFAULT_BUSINESS_LOAN_AMOUNT = 50000;
const MIN_BUSINESS_LOAN_AMOUNT = 10000;
const MAX_BUSINESS_LOAN_AMOUNT = 50000;
const BUSINESS_LOAN_AMOUNT_INCREMENT = 500;
const WAITING_FOR_INPUT_MARKER = 'UI_SIM_WAITING_FOR_INPUT';
let activeRun = null;

const readLocalTestData = () => {
    if (!fs.existsSync(localTestDataPath)) {
        return null;
    }

    try {
        const parsed = JSON.parse(fs.readFileSync(localTestDataPath, 'utf8'));
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
    } catch (error) {
        console.error('Unable to read local test-data defaults:', error);
        return null;
    }
};

const readLatestApplicantInfo = () => {
    if (!fs.existsSync(latestApplicantInfoPath)) {
        return null;
    }

    try {
        const parsed = JSON.parse(fs.readFileSync(latestApplicantInfoPath, 'utf8'));
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) ||
            !parsed.applicant || typeof parsed.applicant !== 'object' || Array.isArray(parsed.applicant)) {
            return null;
        }
        return {
            version: parsed.version,
            capturedAt: parsed.capturedAt,
            applicant: parsed.applicant
        };
    } catch (error) {
        console.error('Unable to read latest test-run applicant info:', error);
        return null;
    }
};

const normalizeRelatedParties = (relatedParties) => {
    if (relatedParties === undefined) return [];
    if (!Array.isArray(relatedParties)) {
        throw new Error('Related parties must be a list');
    }

    return relatedParties.map((party, index) => {
        const ownershipPercentage = Number(party && party.ownershipPercentage);
        const firstName = party && typeof party.firstName === 'string' ? party.firstName.trim() : '';
        const lastName = party && typeof party.lastName === 'string' ? party.lastName.trim() : '';
        if (!party || typeof party !== 'object' || !firstName || !lastName ||
            !Number.isFinite(ownershipPercentage) || ownershipPercentage < 20 || ownershipPercentage > 100) {
            throw new Error(`Related party ${index + 1} needs a first name, last name, and ownership percentage from 20 to 100`);
        }

        return {
            firstName,
            lastName,
            title: typeof party.title === 'string' ? party.title.trim() : '',
            email: typeof party.email === 'string' ? party.email.trim() : '',
            phone: typeof party.phone === 'string' ? party.phone.trim() : '',
            ownershipPercentage
        };
    });
};

const normalizeBusinessLoanAmount = (amount) => {
    const normalizedAmount = Number(amount === undefined || amount === null || amount === ''
        ? DEFAULT_BUSINESS_LOAN_AMOUNT
        : amount);
    if (!Number.isInteger(normalizedAmount) ||
        normalizedAmount < MIN_BUSINESS_LOAN_AMOUNT ||
        normalizedAmount > MAX_BUSINESS_LOAN_AMOUNT ||
        normalizedAmount % BUSINESS_LOAN_AMOUNT_INCREMENT !== 0) {
        throw new Error('Business loan amount must be a whole number from 10000 to 50000 in increments of 500');
    }
    return String(normalizedAmount);
};

const pickProfileFields = (data, fields) => fields.reduce((result, field) => {
    const value = data && data[field];
    if (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number') {
        result[field] = value;
    }
    return result;
}, {});

const getApplicantProfileName = (data = {}) => [data.firstName, data.lastName]
    .filter((value) => typeof value === 'string' && value.trim())
    .map((value) => value.trim())
    .join(' ') || 'Unnamed applicant';

const getBusinessProfileName = (data = {}) => typeof data.businessName === 'string' && data.businessName.trim()
    ? data.businessName.trim()
    : 'Unnamed business';

const normalizeProfile = (profile, fields, type) => {
    if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
        throw new Error(`Each ${type} default must be an object`);
    }

    const id = typeof profile.id === 'string' ? profile.id.trim() : '';
    const requestedName = typeof profile.name === 'string' ? profile.name.trim() : '';
    if (!id || id.length > 120 || (type !== 'applicant' && type !== 'business' && (!requestedName || requestedName.length > 100))) {
        throw new Error(`${type[0].toUpperCase() + type.slice(1)} defaults need an id and a name up to 100 characters`);
    }

    const data = pickProfileFields(profile.data, fields);
    if (type === 'business') {
        data.relatedParties = normalizeRelatedParties(profile.data && profile.data.relatedParties);
    }
    const name = type === 'applicant' ? getApplicantProfileName(data) :
        type === 'business' ? getBusinessProfileName(data) : requestedName;
    return {id, name, data};
};

const normalizeProfiles = (profiles, fields, type) => {
    if (!Array.isArray(profiles)) {
        throw new Error(`${type[0].toUpperCase() + type.slice(1)} defaults must be a list`);
    }
    const ids = new Set();
    return profiles.map((profile) => {
        const normalized = normalizeProfile(profile, fields, type);
        if (ids.has(normalized.id)) {
            throw new Error(`${type[0].toUpperCase() + type.slice(1)} default ids must be unique`);
        }
        ids.add(normalized.id);
        return normalized;
    });
};

const legacyTestDataConfig = (data) => ({
    version: 2,
    applicantDefaults: [{
        id: 'legacy-applicant-default',
        name: getApplicantProfileName(data),
        data: pickProfileFields(data, applicantProfileFields)
    }],
    businessDefaults: [{
        id: 'legacy-business-default',
        name: getBusinessProfileName(data),
        data: Object.assign(pickProfileFields(data, businessProfileFields), {
            relatedParties: normalizeRelatedParties(data && data.relatedParties)
        })
    }]
});

const normalizeTestDataConfig = (data) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('Test-data defaults must be an object');
    }

    if (!Object.prototype.hasOwnProperty.call(data, 'applicantDefaults') &&
        !Object.prototype.hasOwnProperty.call(data, 'businessDefaults')) {
        return legacyTestDataConfig(data);
    }

    return {
        version: 2,
        applicantDefaults: normalizeProfiles(data.applicantDefaults, applicantProfileFields, 'applicant'),
        businessDefaults: normalizeProfiles(data.businessDefaults, businessProfileFields, 'business')
    };
};

const getRunStatus = () => ({
    isRunning: Boolean(activeRun && activeRun.status === 'running'),
    run: activeRun
});

const beginRun = ({path, count}) => {
    activeRun = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        status: 'running',
        path,
        total: count,
        completed: 0,
        startedAt: new Date().toISOString(),
        waitingForInput: false,
        children: []
    };
    return activeRun;
};

const cancelActiveRun = () => {
    if (!activeRun || activeRun.status !== 'running') {
        return false;
    }
    (activeRun.children || []).forEach((child) => {
        try {
            process.kill(-child.pid, 'SIGTERM');
        } catch (error) {
            try {
                child.kill('SIGTERM');
            } catch (innerError) {
                console.error('Unable to terminate test process:', innerError);
            }
        }
    });
    spawn('killall', ['Google Chrome for Testing'], {stdio: 'ignore'})
        .on('error', () => {});
    activeRun.status = 'cancelled';
    activeRun.finishedAt = new Date().toISOString();
    return true;
};

const completeRunProcess = (runId, code, signal) => {
    if (!activeRun || activeRun.id !== runId || activeRun.status !== 'running') {
        return;
    }

    activeRun.completed += 1;
    if (code !== 0) {
        activeRun.failed = true;
    }
    if (activeRun.completed >= activeRun.total) {
        activeRun.status = activeRun.failed ? 'failed' : 'completed';
        activeRun.finishedAt = new Date().toISOString();
        if (signal) {
            activeRun.signal = signal;
        }
    }
};
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
    } else if (testType === "businessLoan") {
        path = "tests/new_user/newBusinessLoan.spec.ts";
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

const startTest = (testCommand, label, onComplete) => {
    console.log(`Starting ${label}`);

    const child = spawn('/bin/sh', ['-lc', testCommand], {
        cwd: __dirname,
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: true
    });
    if (activeRun && Array.isArray(activeRun.children)) {
        activeRun.children.push(child);
    }

    child.stdout.on('data', (output) => {
        if (activeRun && activeRun.status === 'running' && output.toString().includes(WAITING_FOR_INPUT_MARKER)) {
            activeRun.waitingForInput = true;
        }
        process.stdout.write(`[${label}] ${output}`);
    });
    child.stderr.on('data', (output) => {
        process.stderr.write(`[${label}] ${output}`);
    });
    let completed = false;
    const complete = (code, signal) => {
        if (!completed) {
            completed = true;
            onComplete(code, signal);
        }
    };

    child.on('error', (error) => {
        console.error(`Unable to start ${label}:`, error);
        complete(1);
    });
    child.on('close', (code, signal) => {
        console.log(`${label} exited with code ${code}${signal ? ` (signal: ${signal})` : ''}`);
        complete(code, signal);
    });
};

app.use(cors());
app.use(bodyParser.json());

app.get('/config/test-data', (_req, res) => {
    try {
        const data = readLocalTestData();
        const config = data ? normalizeTestDataConfig(data) : {version: 2, applicantDefaults: [], businessDefaults: []};
        return res.json({configured: Boolean(data), ...config});
    } catch (error) {
        return res.status(400).json({error: error.message || 'Unable to load local test-data defaults'});
    }
});

app.put('/config/test-data', (req, res) => {
    try {
        const data = normalizeTestDataConfig(req.body && req.body.data ? req.body.data : req.body);
        fs.mkdirSync(localConfigDirectory, {recursive: true});
        fs.writeFileSync(localTestDataPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
        return res.json({configured: true, message: 'Local test-data profiles saved', ...data});
    } catch (error) {
        console.error('Unable to save local test-data defaults:', error);
        return res.status(400).json({error: error.message || 'Unable to save local test-data defaults'});
    }
});

app.get('/config/latest-applicant', (_req, res) => {
    const latestApplicantInfo = readLatestApplicantInfo();
    return res.json({
        available: Boolean(latestApplicantInfo),
        latestApplicantInfo
    });
});

app.get('/test-status', (_req, res) => {
    return res.json(getRunStatus());
});

app.post('/cancel-tests', (_req, res) => {
    const cancelled = cancelActiveRun();
    if (!cancelled) {
        return res.status(409).json({error: 'No active test run to cancel', ...getRunStatus()});
    }
    return res.json({message: 'Test run cancelled', ...getRunStatus()});
});

app.post('/run-tests', (req, res) => {
    try {
        if (activeRun && activeRun.status === 'running') {
            return res.status(409).json({error: 'A test run is already active', ...getRunStatus()});
        }
        const {
            email,
            password,
            testType,
            isPrefill,
            reuseLatestApplicantInfo,
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
            randomizeIdentity,
            failEligibility,
            skipEligibility,
            prematureStop,
            businessName,
            businessEntityType,
            businessEin,
            businessPhone,
            businessIncorporationDate,
            randomizeBusinessIdentity,
            businessAddress,
            businessCity,
            businessState,
            businessZip,
            businessLoanAmount,
            randomizeBusinessLoanAmount,
            businessOwnerPercentage,
            relatedParties
        } = req.body;

        const path = getUrlPath(testType, isPrefill);
        if (!path) {
            return res.status(400).json({error: `Unsupported test type: ${testType}`});
        }

        const normalizedBusinessLoanAmount = testType === 'businessLoan'
            ? normalizeBusinessLoanAmount(businessLoanAmount)
            : undefined;

        const normalizedRelatedParties = normalizeRelatedParties(relatedParties);
        const primaryOwnerPercentage = Number(businessOwnerPercentage || 100);
        const totalOwnership = primaryOwnerPercentage + normalizedRelatedParties
            .reduce((total, party) => total + party.ownershipPercentage, 0);
        if (!Number.isFinite(primaryOwnerPercentage) || primaryOwnerPercentage < 0 || primaryOwnerPercentage > 100 || totalOwnership > 100) {
            return res.status(400).json({error: 'Applicant and related-party ownership cannot exceed 100%'});
        }

        const testCommand = buildTestCommand({
            email,
            password,
            hasCoApplicant,
            reuseLatestApplicantInfo,
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
            dob: randomizeIdentity ? '' : dob,
            ssn: randomizeIdentity ? '' : ssn,
            address,
            city,
            zip,
            randomizeIdentity,
            failEligibility,
            skipEligibility,
            prematureStop,
            businessName,
            businessEntityType,
            businessEin: randomizeBusinessIdentity ? '' : businessEin,
            businessPhone,
            businessIncorporationDate: randomizeBusinessIdentity ? '' : businessIncorporationDate,
            randomizeBusinessIdentity,
            businessAddress,
            businessCity,
            businessState,
            businessZip,
            businessLoanAmount: normalizedBusinessLoanAmount,
            randomizeBusinessLoanAmount,
            businessOwnerPercentage,
            relatedParties: JSON.stringify(normalizedRelatedParties),
            path
        });

        const run = beginRun({path, count: 1});
        startTest(testCommand, path, (code, signal) => completeRunProcess(run.id, code, signal));
        return res.status(202).json({message: 'Test started', path, ...getRunStatus()});
    } catch (error) {
        console.error('Error running tests:', error);
        return res.status(500).json({error: 'Unable to start test'});
    }
});

app.post('/run-tests-batch', (req, res) => {
    try {
        if (activeRun && activeRun.status === 'running') {
            return res.status(409).json({error: 'A test run is already active', ...getRunStatus()});
        }
        const {
            email,
            password,
            testType,
            isPrefill,
            reuseLatestApplicantInfo,
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
            randomizeIdentity,
            failEligibility,
            skipEligibility,
            prematureStop,
            businessName,
            businessEntityType,
            businessEin,
            businessPhone,
            businessIncorporationDate,
            randomizeBusinessIdentity,
            businessAddress,
            businessCity,
            businessState,
            businessZip,
            businessLoanAmount,
            randomizeBusinessLoanAmount,
            businessOwnerPercentage,
            relatedParties
        } = req.body;

        const path = getUrlPath(testType, isPrefill);
        if (!path) {
            return res.status(400).json({error: `Unsupported test type: ${testType}`});
        }
        if (!Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({error: 'At least one batch URL is required'});
        }

        const normalizedBusinessLoanAmount = testType === 'businessLoan'
            ? normalizeBusinessLoanAmount(businessLoanAmount)
            : undefined;

        const normalizedRelatedParties = normalizeRelatedParties(relatedParties);
        const primaryOwnerPercentage = Number(businessOwnerPercentage || 100);
        const totalOwnership = primaryOwnerPercentage + normalizedRelatedParties
            .reduce((total, party) => total + party.ownershipPercentage, 0);
        if (!Number.isFinite(primaryOwnerPercentage) || primaryOwnerPercentage < 0 || primaryOwnerPercentage > 100 || totalOwnership > 100) {
            return res.status(400).json({error: 'Applicant and related-party ownership cannot exceed 100%'});
        }

        const run = beginRun({path, count: urls.length});
        urls.forEach((envUrl) => {
            const testCommand = buildTestCommand({
                email,
                password,
                hasCoApplicant,
                reuseLatestApplicantInfo,
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
                dob: randomizeIdentity ? '' : dob,
                ssn: randomizeIdentity ? '' : ssn,
                randomizeIdentity,
                address,
                city,
                zip,
                failEligibility,
                skipEligibility,
                prematureStop,
                businessName,
                businessEntityType,
                businessEin: randomizeBusinessIdentity ? '' : businessEin,
                businessPhone,
                businessIncorporationDate: randomizeBusinessIdentity ? '' : businessIncorporationDate,
                randomizeBusinessIdentity,
                businessAddress,
                businessCity,
                businessState,
                businessZip,
                businessLoanAmount: normalizedBusinessLoanAmount,
                randomizeBusinessLoanAmount,
                businessOwnerPercentage,
                relatedParties: JSON.stringify(normalizedRelatedParties),
                path
            }, true);
            startTest(testCommand, `${path} (${envUrl})`, (code, signal) => completeRunProcess(run.id, code, signal));
        });
        return res.status(202).json({message: 'Batch tests started', path, count: urls.length, ...getRunStatus()});
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
