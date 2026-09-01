import fs from 'fs';
import path from 'path';

const latestApplicantInfoPath = path.join(__dirname, '../.local/latest-test_run_applicant_info.json');

interface LatestApplicantInfo {
    [key: string]: string | boolean | number | undefined;
}

interface LatestApplicantSnapshot {
    version: 1;
    capturedAt: string;
    applicant: LatestApplicantInfo;
}

const readSnapshot = (): LatestApplicantSnapshot | null => {
    if (!fs.existsSync(latestApplicantInfoPath)) {
        return null;
    }

    try {
        const parsed = JSON.parse(fs.readFileSync(latestApplicantInfoPath, 'utf8'));
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) ||
            !parsed.applicant || typeof parsed.applicant !== 'object' || Array.isArray(parsed.applicant)) {
            return null;
        }
        return parsed as LatestApplicantSnapshot;
    } catch (error) {
        console.error('Unable to read latest test-run applicant info:', error);
        return null;
    }
};

const writeSnapshot = (snapshot: LatestApplicantSnapshot): void => {
    fs.mkdirSync(path.dirname(latestApplicantInfoPath), {recursive: true});
    const temporaryPath = `${latestApplicantInfoPath}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(temporaryPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
    fs.renameSync(temporaryPath, latestApplicantInfoPath);
};

export const startLatestTestRunApplicantInfo = (applicant: LatestApplicantInfo): void => {
    writeSnapshot({
        version: 1,
        capturedAt: new Date().toISOString(),
        applicant
    });
};

export const updateLatestTestRunApplicantInfo = (applicant: LatestApplicantInfo): void => {
    const current = readSnapshot();
    writeSnapshot({
        version: 1,
        capturedAt: current?.capturedAt || new Date().toISOString(),
        applicant: Object.assign({}, current?.applicant || {}, applicant)
    });
};
